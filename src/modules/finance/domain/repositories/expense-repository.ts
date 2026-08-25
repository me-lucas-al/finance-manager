import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { expenses } from '@/db/schema';

export type Expense = InferSelectModel<typeof expenses>;
export type NewExpense = InferInsertModel<typeof expenses>;

export interface ExpenseRepository {
  create(data: Omit<NewExpense, 'id'>): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findAllByUserId(userId: string): Promise<Expense[]>;
  update(id: string, data: Partial<NewExpense>): Promise<Expense>;
  delete(id: string): Promise<void>;
}
