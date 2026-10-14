import type { TransactionRepository } from '../../domain/repositories/transaction-repository';

export type ExpenseBreakdown = { total: number; byCategory: Record<string, number> };

export type ExpenseBreakdownReader = (userId: string, from?: Date, to?: Date) => Promise<ExpenseBreakdown>;

export function createExpenseBreakdownReader(
  transactions: Pick<TransactionRepository, 'findAllByUserId'>,
): ExpenseBreakdownReader {
  return async (userId, from, to) => {
    const rows = await transactions.findAllByUserId(userId, { dateFrom: from, dateTo: to });

    const byCategory: Record<string, number> = {};
    for (const transaction of rows) {
      const category = transaction.category ?? transaction.categorySuggested ?? 'Sem categoria';
      byCategory[category] = (byCategory[category] ?? 0) + Math.abs(transaction.amount);
    }

    const total = Object.values(byCategory).reduce((acc, value) => acc + value, 0);
    return { total, byCategory };
  };
}
