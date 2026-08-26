// Supabase Edge Function (Deno) — plano_migracao.xml, tarefa 6.
// Runs once a day (see 0002_cron_analyze.sql), compares the current month's
// categorized transactions against the goals set for that month, always
// refreshes a "monthly_summary" alerts_log entry (read by the Next.js
// dashboard), and additionally sends a Telegram alert — at most once a
// day — when spending is over budget.
//
// Deploy manually after reviewing this file:
//   supabase functions deploy analyze-spending --no-verify-jwt
// and set its secrets (Project Settings > Edge Functions > analyze-spending):
//   GEMINI_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)

import { createClient } from 'npm:@supabase/supabase-js@2';

const GEMINI_MODEL = 'gemini-2.5-flash';

type Transaction = {
  amount: number;
  category: string | null;
  category_suggested: string | null;
};

type Goal = {
  category: string | null;
  target_amount: number;
};

function currentMonthRange(): { from: string; to: string; monthDate: string } {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const nextMonth = now.getMonth() === 11 ? new Date(now.getFullYear() + 1, 0, 1) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const to = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
  return { from, to, monthDate: from };
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

async function generateSummary(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return prompt;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );

  if (!response.ok) {
    console.error('Gemini request failed:', await response.text());
    return prompt;
  }

  const body = await response.json();
  return body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || prompt;
}

async function sendTelegramMessage(text: string): Promise<void> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!token || !chatId) {
    console.warn('Telegram is not configured; skipping alert.');
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!response.ok) console.error('Failed to send Telegram alert:', await response.text());
}

Deno.serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { from, to, monthDate } = currentMonthRange();

  const [{ data: transactions, error: transactionsError }, { data: goals, error: goalsError }] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount, category, category_suggested')
      .eq('status', 'categorized')
      .gte('occurred_at', from)
      .lt('occurred_at', to),
    supabase.from('goals').select('category, target_amount').eq('month', monthDate),
  ]);

  if (transactionsError) throw new Error(transactionsError.message);
  if (goalsError) throw new Error(goalsError.message);

  const spendByCategory = new Map<string, number>();
  let totalSpent = 0;
  for (const transaction of (transactions ?? []) as Transaction[]) {
    const amount = Math.abs(Number(transaction.amount));
    if (transaction.amount < 0) {
      // Only DEBIT-like (negative) movements count as spending.
      totalSpent += amount;
      const category = transaction.category ?? transaction.category_suggested ?? 'Sem categoria';
      spendByCategory.set(category, (spendByCategory.get(category) ?? 0) + amount);
    }
  }

  const generalGoal = (goals as Goal[] | null)?.find((goal) => goal.category === null) ?? null;
  const categoryGoals = (goals as Goal[] | null)?.filter((goal) => goal.category !== null) ?? [];

  const overBudget: string[] = [];
  if (generalGoal && totalSpent > Number(generalGoal.target_amount)) {
    overBudget.push(`Total geral: ${formatBRL(totalSpent)} de ${formatBRL(Number(generalGoal.target_amount))}`);
  }
  for (const goal of categoryGoals) {
    const spent = spendByCategory.get(goal.category as string) ?? 0;
    if (spent > Number(goal.target_amount)) {
      overBudget.push(`${goal.category}: ${formatBRL(spent)} de ${formatBRL(Number(goal.target_amount))}`);
    }
  }

  const summaryPrompt = [
    'Resuma em até 3 frases, em português do Brasil, como está o mês financeiro do usuário.',
    `Total gasto até agora: ${formatBRL(totalSpent)}.`,
    generalGoal ? `Meta geral do mês: ${formatBRL(Number(generalGoal.target_amount))}.` : 'Nenhuma meta geral definida.',
    overBudget.length > 0
      ? `Categorias/total acima da meta: ${overBudget.join('; ')}.`
      : 'Nenhuma categoria acima da meta até agora.',
    'Seja direto, sem saudação.',
  ].join('\n');

  const summary = await generateSummary(summaryPrompt);
  await supabase.from('alerts_log').insert({ alert_type: 'monthly_summary', message: summary });

  if (overBudget.length === 0) {
    return new Response(JSON.stringify({ ok: true, alertSent: false }), { status: 200 });
  }

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count, error: countError } = await supabase
    .from('alerts_log')
    .select('id', { count: 'exact', head: true })
    .eq('alert_type', 'budget_alert')
    .gte('sent_at', since.toISOString());
  if (countError) throw new Error(countError.message);

  if ((count ?? 0) > 0) {
    return new Response(JSON.stringify({ ok: true, alertSent: false, reason: 'already_sent_today' }), { status: 200 });
  }

  const alertMessage = `⚠️ Atenção com o orçamento do mês:\n${overBudget.join('\n')}`;
  await sendTelegramMessage(alertMessage);
  await supabase.from('alerts_log').insert({ alert_type: 'budget_alert', message: alertMessage });

  return new Response(JSON.stringify({ ok: true, alertSent: true }), { status: 200 });
});
