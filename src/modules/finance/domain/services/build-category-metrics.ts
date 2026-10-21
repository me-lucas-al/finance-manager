import type { Goal } from '@/modules/open-finance/domain/repositories/goal-repository';
import type { CategoryMetric } from '../models/financial-snapshot';

export function buildCategoryMetrics(
  current: Record<string, number>,
  previous: Record<string, number>,
  goals: Goal[]
): CategoryMetric[] {
  return Array.from(new Set([...Object.keys(current), ...Object.keys(previous)])).map((category) => {
    const currentAmount = current[category] ?? 0;
    const previousAmount = previous[category] ?? 0;
    const goal = goals.find((item) => item.category?.toLowerCase() === category.toLowerCase());
    return {
      category,
      currentAmount,
      previousAmount,
      diffPercentage: previousAmount > 0 ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100) : 0,
      goalAmount: goal ? Number(goal.targetAmount) : undefined,
    };
  });
}
