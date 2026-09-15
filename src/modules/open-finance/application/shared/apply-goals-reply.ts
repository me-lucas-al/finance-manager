import { interpretGoalsReply } from '@/lib/gemini';
import { formatCurrency } from '@/lib/format';
import type { GoalRepository } from '../../domain/repositories/goal-repository';
import type { SavingsGoal, SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';
import { getExpenseCategories } from './expense-categories';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

// Case-insensitive/contains match: robust enough for "Viagem" vs "viagem para
// a praia" without requiring an exact title.
function findMatchingSavingsGoal(title: string, existing: SavingsGoal[]): SavingsGoal | null {
  const normalized = title.trim().toLowerCase();
  return (
    existing.find((goal) => {
      const goalTitle = goal.title.toLowerCase();
      return goalTitle === normalized || goalTitle.includes(normalized) || normalized.includes(goalTitle);
    }) ?? null
  );
}

// Core "interpret free text about financial goals and apply it" logic, shared
// by the Telegram flow (RecordGoalsReplyUseCase, which also notifies via
// Telegram) and the website chat flow (which only needs the confirmation
// text back to render in the UI) — keeps the Gemini interpretation and the
// goal/savings-goal upsert logic in one place.
export async function applyGoalsReply(params: {
  userId: string;
  replyText: string;
  goalRepository: GoalRepository;
  savingsGoalRepository: SavingsGoalRepository;
}): Promise<string> {
  const { userId, replyText, goalRepository, savingsGoalRepository } = params;

  const [categories, existingSavingsGoals] = await Promise.all([
    getExpenseCategories(userId),
    savingsGoalRepository.findAllActiveByUserId(userId),
  ]);

  const interpretation = await interpretGoalsReply({
    replyText,
    categories,
    existingSavingsGoals: existingSavingsGoals.map((goal) => goal.title),
  });

  const confirmationLines: string[] = [];
  const month = currentMonth();

  if (interpretation.monthlyGeneralTarget !== null) {
    await goalRepository.upsert({
      userId,
      month,
      category: null,
      targetAmount: interpretation.monthlyGeneralTarget,
    });
    confirmationLines.push(`🎯 Meta geral do mês: ${formatCurrency(interpretation.monthlyGeneralTarget)}`);
  }

  for (const target of interpretation.monthlyCategoryTargets) {
    await goalRepository.upsert({ userId, month, category: target.category, targetAmount: target.amount });
    confirmationLines.push(`🎯 Meta de ${target.category}: ${formatCurrency(target.amount)}`);
  }

  for (const update of interpretation.savingsGoalUpdates) {
    const matching = findMatchingSavingsGoal(update.title, existingSavingsGoals);

    if (matching) {
      const patch: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = {};
      if (update.targetAmount !== null) patch.targetAmount = update.targetAmount;
      if (update.targetDate !== null) patch.targetDate = update.targetDate;
      if (update.contributionAmount !== null) patch.currentAmount = matching.currentAmount + update.contributionAmount;

      const updated = await savingsGoalRepository.update(matching.id, patch);
      const deadline = updated.targetDate ? ` até ${updated.targetDate}` : '';
      confirmationLines.push(
        `💰 ${updated.title}: ${formatCurrency(updated.currentAmount)} de ${formatCurrency(updated.targetAmount)}${deadline}`,
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
        `💰 Novo objetivo "${created.title}": ${formatCurrency(created.currentAmount)} de ${formatCurrency(created.targetAmount)}${deadline}`,
      );
    }
  }

  return confirmationLines.length > 0
    ? ['✅ Objetivos atualizados!', ...confirmationLines].join('\n')
    : 'ℹ️ Não encontrei nenhum objetivo financeiro novo na sua mensagem.';
}
