import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { incomes } from '@/db/schema';

export type Income = InferSelectModel<typeof incomes>;
export type NewIncome = InferInsertModel<typeof incomes>;

export interface IncomeRepository {
  create(data: Omit<NewIncome, 'id'>): Promise<Income>;
  findById(id: string): Promise<Income | null>;
  findAllByUserId(userId: string): Promise<Income[]>;
  update(id: string, data: Partial<NewIncome>): Promise<Income>;
  delete(id: string): Promise<void>;
}
