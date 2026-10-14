import { formatCurrency } from '@/lib/format';
import type { SavingsGoalUpdate } from '../../domain/ports/goals-reply-interpreter';
import type { SavingsGoal, SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';

type SavingsGoalPatch = Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

function findMatchingSavingsGoal(title: string, existing: SavingsGoal[]): SavingsGoal | null {
  const normalized = title.trim().toLowerCase();
  return (
    existing.find((goal) => {
      const goalTitle = goal.title.toLowerCase();
      return goalTitle === normalized || goalTitle.includes(normalized) || normalized.includes(goalTitle);
    }) ?? null
  );
}

function describeProgress(goal: SavingsGoal): string {
  const deadline = goal.targetDate ? ` até ${goal.targetDate}` : '';
  return `${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}${deadline}`;
}

function buildPatch(update: SavingsGoalUpdate, matching: SavingsGoal): SavingsGoalPatch {
  const patch: SavingsGoalPatch = {};
  if (update.targetAmount !== null) patch.targetAmount = update.targetAmount;
  if (update.targetDate !== null) patch.targetDate = update.targetDate;
  if (update.contributionAmount !== null) patch.currentAmount = matching.currentAmount + update.contributionAmount;
  return patch;
}

export async function applySavingsGoalUpdate(
  repository: SavingsGoalRepository,
  userId: string,
  update: SavingsGoalUpdate,
  existing: SavingsGoal[],
): Promise<string | null> {
  const matching = findMatchingSavingsGoal(update.title, existing);

  if (matching) {
    const updated = await repository.update(matching.id, buildPatch(update, matching));
    return `💰 ${updated.title}: ${describeProgress(updated)}`;
  }

  if (update.targetAmount === null) return null;

  const created = await repository.create({
    userId,
    title: update.title,
    targetAmount: update.targetAmount,
    targetDate: update.targetDate,
    currentAmount: update.contributionAmount ?? 0,
  });
  return `💰 Novo objetivo "${created.title}": ${describeProgress(created)}`;
}
