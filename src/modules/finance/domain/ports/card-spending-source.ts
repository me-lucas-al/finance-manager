import type { CardExpense } from '../models/credit-card';

export type DateRange = { from: string; to: string };

export interface CardSpendingSource {
  listCardExpenses(userId: string, range: DateRange): Promise<CardExpense[]>;
}
