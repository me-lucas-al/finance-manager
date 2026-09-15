import {
  SupabaseTransactionRepository,
  SupabaseGoalRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';
import type { CategoryGoalDatum } from './charts';

// The Supabase project (Open Finance data) may not be configured yet — this
// chart degrades to its own empty state instead of failing the whole page.
export async function loadCategoryVsGoalData(userId: string): Promise<CategoryGoalDatum[]> {
  try {
    const now = new Date();
    const monthFilter = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [monthTransactions, goals] = await Promise.all([
      new SupabaseTransactionRepository().findAllByUserId(userId, { month: monthFilter }),
      new SupabaseGoalRepository().findAllByUserIdAndMonth(userId, `${monthFilter}-01`),
    ]);

    const spendByCategory = new Map<string, number>();
    for (const transaction of monthTransactions) {
      const category = transaction.category ?? transaction.categorySuggested ?? 'Sem categoria';
      spendByCategory.set(category, (spendByCategory.get(category) ?? 0) + Math.abs(transaction.amount));
    }

    const targetByCategory = new Map(
      goals.filter((goal) => goal.category !== null).map((goal) => [goal.category as string, goal.targetAmount]),
    );

    const categories = new Set([...spendByCategory.keys(), ...targetByCategory.keys()]);
    return Array.from(categories).map((category) => ({
      category,
      actual: spendByCategory.get(category) ?? 0,
      target: targetByCategory.get(category) ?? 0,
    }));
  } catch {
    return [];
  }
}
