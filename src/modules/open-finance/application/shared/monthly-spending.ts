import type { Transaction } from '../../domain/repositories/transaction-repository';

export type MonthlySpending = {
  totalSpent: number;
  spendByCategory: Map<string, number>;
};

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
