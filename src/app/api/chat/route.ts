import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
import { z } from 'zod';
import { formatCurrency } from '@/lib/format';
import { SupabaseGoalRepository, SupabaseSavingsGoalRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { getLiveOverviewData, getLiveMovementsData, getLiveInvestmentsData, searchLiveTransactions } from '@/lib/pluggy-service';
import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';
import { SavingsGoal } from '@/modules/open-finance/domain/repositories/savings-goal-repository';

export const maxDuration = 60;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

// Helper to find matching savings goal (similar to apply-goals-reply)
function findMatchingSavingsGoal(title: string, existing: SavingsGoal[]): SavingsGoal | null {
  const normalized = title.trim().toLowerCase();
  return (
    existing.find((goal) => {
      const goalTitle = goal.title.toLowerCase();
      return goalTitle === normalized || goalTitle.includes(normalized) || normalized.includes(goalTitle);
    }) ?? null
  );
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const userId = process.env.FINANCE_OWNER_USER_ID;
  if (!userId) {
    return new Response('User ID not configured', { status: 500 });
  }

  const today = new Date();
  const currentDateFormatted = today.toLocaleDateString('pt-BR');
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const result = streamText({
    model: google('gemini-2.5-pro'),
    maxSteps: 5,
    system: `Você é um Consultor Financeiro Inteligente integrado ao Finance Manager.
A data de hoje é ${currentDateFormatted} (mês atual: ${currentMonthStr}).
Seu objetivo é ajudar o usuário a entender suas finanças, responder a perguntas sobre transações, metas, saldos e investimentos.

Instruções:
- Seja proativo. Em vez de apenas repetir números crus que as ferramentas retornam, analise os dados. Por exemplo: se o limite do cartão estiver 90% usado, alerte o usuário; se ele gastou muito com Ifood, mencione isso com uma dica.
- Sempre responda de forma amigável e clara usando Markdown rico (listas, tabelas se necessário, bold, emojis).
- Ao definir metas de economia ou de gastos, veja primeiro quais metas ou categorias o usuário já tem chamando \`get_financial_goals\` e \`get_expense_categories\`.
- Caso o usuário pergunte sobre uma transação específica ou loja (ex: "Uber", "MercadoLivre", "quanto paguei no McDonald's"), use \`search_transactions\`.
- Nunca devolva IDs crus de banco de dados para o usuário.
`,
    messages,
    tools: {
      get_expense_categories: tool({
        description: 'Obtém as categorias de despesa válidas cadastradas pelo usuário.',
        parameters: z.object({}),
        // @ts-expect-error - AI SDK inference is strict
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        execute: async (_args: any) => {
          const categories = await getExpenseCategories(userId);
          return { categories };
        },
      }),
      get_financial_goals: tool({
        description: 'Lista todas as metas financeiras do mês atual (teto de gastos por categoria e geral) e as metas de economia ativas do usuário.',
        parameters: z.object({}),
        // @ts-expect-error - AI SDK inference is strict
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        execute: async (_args: any) => {
          const goalRepository = new SupabaseGoalRepository();
          const savingsGoalRepository = new SupabaseSavingsGoalRepository();
          
          const monthGoals = await goalRepository.findAllByUserIdAndMonth(userId, currentMonth());
          const savingsGoals = await savingsGoalRepository.findAllActiveByUserId(userId);
          
          return {
            spendingGoals: monthGoals,
            savingsGoals: savingsGoals
          };
        },
      }),
      update_financial_goals: tool({
        description: 'Cria ou atualiza metas de gastos mensais e/ou metas de economia (savings goals).',
        parameters: z.object({
          monthlyGeneralTarget: z.number().nullable().describe('Teto geral de gasto para o mês (null se não definido).'),
          monthlyCategoryTargets: z.array(z.object({
            category: z.string().describe('Nome exato da categoria (veja get_expense_categories primeiro)'),
            amount: z.number().describe('Valor limite para a categoria')
          })).describe('Metas de gastos por categoria.'),
          savingsGoalUpdates: z.array(z.object({
            title: z.string().describe('Nome da meta de economia (ex: "Viagem")'),
            targetAmount: z.number().nullable().describe('Valor total do objetivo a ser alcançado'),
            targetDate: z.string().nullable().describe('Data limite no formato YYYY-MM-DD'),
            contributionAmount: z.number().nullable().describe('Valor a ser adicionado agora (aporte) à meta')
          })).describe('Novas metas de economia ou aportes a metas existentes.')
        }),
        // @ts-expect-error - AI SDK inference is strict
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execute: async ({ monthlyGeneralTarget, monthlyCategoryTargets, savingsGoalUpdates }: any) => {
          const goalRepository = new SupabaseGoalRepository();
          const savingsGoalRepository = new SupabaseSavingsGoalRepository();
          
          const month = currentMonth();
          const confirmationLines: string[] = [];

          if (monthlyGeneralTarget !== null) {
            await goalRepository.upsert({
              userId,
              month,
              category: null,
              targetAmount: monthlyGeneralTarget,
            });
            confirmationLines.push(`🎯 Meta geral do mês: ${formatCurrency(monthlyGeneralTarget)}`);
          }

          for (const target of monthlyCategoryTargets) {
            await goalRepository.upsert({ userId, month, category: target.category, targetAmount: target.amount });
            confirmationLines.push(`🎯 Meta de ${target.category}: ${formatCurrency(target.amount)}`);
          }

          if (savingsGoalUpdates && savingsGoalUpdates.length > 0) {
            const existingSavingsGoals = await savingsGoalRepository.findAllActiveByUserId(userId);
            for (const update of savingsGoalUpdates) {
              const matching = findMatchingSavingsGoal(update.title, existingSavingsGoals);

              if (matching) {
                const patch: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = {};
                if (update.targetAmount !== null) patch.targetAmount = update.targetAmount;
                if (update.targetDate !== null) patch.targetDate = update.targetDate;
                if (update.contributionAmount !== null) patch.currentAmount = matching.currentAmount + update.contributionAmount;

                const updated = await savingsGoalRepository.update(matching.id, patch);
                const deadline = updated.targetDate ? ` até ${updated.targetDate}` : '';
                confirmationLines.push(
                  `💰 ${updated.title}: ${formatCurrency(updated.currentAmount)} de ${formatCurrency(updated.targetAmount)}${deadline}`
                );
              } else if (update.targetAmount !== null) {
                const created = await savingsGoalRepository.create({
                  userId,
                  title: update.title,
                  targetAmount: update.targetAmount,
                  targetDate: update.targetDate,
                  currentAmount: update.contributionAmount ?? 0,
                });
                const deadline = created.targetDate ? ` até ${created.targetDate}` : '';
                confirmationLines.push(
                  `💰 Novo objetivo "${created.title}": ${formatCurrency(created.currentAmount)} de ${formatCurrency(created.targetAmount)}${deadline}`
                );
              }
            }
          }

          return confirmationLines.length > 0
            ? ['✅ Objetivos atualizados!', ...confirmationLines].join('\n')
            : 'ℹ️ Nenhum objetivo atualizado.';
        },
      }),
      search_transactions: tool({
        description: 'Pesquisa transações recentes que contenham um termo específico (nome do estabelecimento, categoria, etc).',
        parameters: z.object({
          query: z.string().describe('Termo para buscar nas descrições ou categorias das transações.'),
          limit: z.number().optional().describe('Número máximo de resultados. Padrão: 10.')
        }),
        // @ts-expect-error - AI SDK inference is strict
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execute: async ({ query, limit = 10 }: any) => {
          const txs = await searchLiveTransactions(query, limit);
          return {
            query,
            count: txs.length,
            transactions: txs.map(t => ({
              date: t.dateStr,
              description: t.description,
              category: t.category,
              amount: t.amount,
              type: t.type
            }))
          };
        }
      }),
      get_overview: tool({
        description: 'Obtém um resumo geral dos saldos das contas bancárias, cartões de crédito e investimentos do usuário.',
        parameters: z.object({}),
        // @ts-expect-error - AI SDK inference is strict
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        execute: async (_args: any) => {
          const data = await getLiveOverviewData();
          return {
            bankTotal: data.bankTotal,
            cardTotal: data.cardTotal,
            cardLimit: data.cardLimit,
            investmentTotal: data.investmentTotal,
            evolutionBalance: data.evolutionBalance,
          };
        },
      }),
      get_movements: tool({
        description: 'Obtém dados de movimentações e despesas de um mês específico.',
        parameters: z.object({
          month: z.string().describe('O mês no formato YYYY-MM. Exemplo: 2024-09'),
        }),
        // @ts-expect-error - AI SDK inference is strict
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execute: async ({ month }: any) => {
          const data = await getLiveMovementsData(month);
          return {
            totalExpenses: data.totalExpenses,
            totalIncome: data.totalIncome,
            netBalance: data.netBalance,
            categorizedExpenses: data.categorizedExpenses, // removed slice(0, 5) to show all
          };
        },
      }),
      get_investments: tool({
        description: 'Obtém os detalhes dos investimentos do usuário.',
        parameters: z.object({}),
        // @ts-expect-error - AI SDK inference is strict
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        execute: async (_args: any) => {
          const data = await getLiveInvestmentsData();
          return data;
        },
      }),
    },
  });

  return result.toTextStreamResponse();
}

