import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { incomes } from '@/db/schema';

export type Income = InferSelectModel<typeof incomes>;
export type NewIncome = InferInsertModel<typeof incomes>;

export type IncomeSortField = 'date' | 'description' | 'amount';

export type IncomeQuery = {
  search?: string;
  category?: string;
  sort?: IncomeSortField;
  dir?: 'asc' | 'desc';
  limit: number;
  offset: number;
};

export type IncomePage = { rows: Income[]; total: number };

export interface IncomeRepository {
  create(data: Omit<NewIncome, 'id'>): Promise<Income>;
  findById(id: string): Promise<Income | null>;
  findAllByUserId(userId: string): Promise<Income[]>;
  findPageByUserId(userId: string, query: IncomeQuery): Promise<IncomePage>;
  update(id: string, data: Partial<NewIncome>): Promise<Income>;
  delete(id: string): Promise<void>;
}
