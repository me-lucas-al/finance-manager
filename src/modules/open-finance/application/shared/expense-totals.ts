import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';

export type ExpenseBreakdown = { total: number; byCategory: Record<string, number> };

export async function getExpenseBreakdown(
  userId: string,
  from?: Date,
  to?: Date,
): Promise<ExpenseBreakdown> {
  const transactions = await new SupabaseTransactionRepository().findAllByUserId(userId, { dateFrom: from, dateTo: to });

  const byCategory: Record<string, number> = {};
  for (const transaction of transactions) {
    if (transaction.amount >= 0) continue;
    const category = transaction.category ?? transaction.categorySuggested ?? 'Sem categoria';
    byCategory[category] = (byCategory[category] ?? 0) + Math.abs(transaction.amount);
  }

  const total = Object.values(byCategory).reduce((acc, value) => acc + value, 0);
  return { total, byCategory };
}
