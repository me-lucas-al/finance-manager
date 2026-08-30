import type { Transaction } from '../../domain/repositories/transaction-repository';

export type MonthlySpending = {
  totalSpent: number;
  spendByCategory: Map<string, number>;
};

// Reimplements the aggregation from supabase/functions/analyze-spending (a
// Deno Edge Function that can't import from src/) so the weekly Telegram
// goals summary can reuse the same "spend so far this month" logic.
export function aggregateMonthlySpending(transactions: Transaction[]): MonthlySpending {
  const spendByCategory = new Map<string, number>();
  let totalSpent = 0;
  for (const transaction of transactions) {
    const amount = Math.abs(transaction.amount);
    totalSpent += amount;
    const category = transaction.category ?? transaction.categorySuggested ?? 'Sem categoria';
    spendByCategory.set(category, (spendByCategory.get(category) ?? 0) + amount);
  }
  return { totalSpent, spendByCategory };
}
