import { toMonthStart } from '@/lib/month';
import type { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { entriesInMonth, totalsByCategory } from '@/modules/finance/domain/services/summarize-ledger';
import type { CategoryGoalDatum } from '@/types/report';

type GoalTarget = { category: string | null; targetAmount: number };

export function buildCategoryVsGoal(entries: LedgerEntry[], month: string, goals: GoalTarget[]): CategoryGoalDatum[] {
  const spendByCategory = new Map(
    totalsByCategory(entriesInMonth(entries, month), 'expense').map(({ category, total }) => [category, total])
  );
  const targetByCategory = new Map(
    goals.filter((goal) => goal.category !== null).map((goal) => [goal.category as string, goal.targetAmount])
  );
  const categories = new Set([...spendByCategory.keys(), ...targetByCategory.keys()]);

  return Array.from(categories, (category) => ({
    category,
    actual: spendByCategory.get(category) ?? 0,
    target: targetByCategory.get(category) ?? 0,
  }));
}

export async function loadGoalTargets(
  goals: Pick<GoalRepository, 'findAllByUserIdAndMonth'>,
  userId: string,
  month: string
): Promise<GoalTarget[]> {
  try {
    return await goals.findAllByUserIdAndMonth(userId, toMonthStart(month));
  } catch {
    return [];
  }
}
