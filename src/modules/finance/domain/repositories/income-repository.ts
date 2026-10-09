import type { InferSelectModel } from 'drizzle-orm';
import type { incomes } from '@/db/schema';

export type Income = InferSelectModel<typeof incomes>;

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

export type NewIncome = {
  id?: string;
  userId: string;
  periodId: string;
  description: string;
  amount: number | string;
  category: string;
  receivedAt: Date;
};

export interface IncomeRepository {
  create(data: NewIncome): Promise<Income>;
  findLatestByUserId(userId: string): Promise<Income | null>;
  delete(id: string): Promise<void>;
  findPageByUserId(userId: string, query: IncomeQuery): Promise<IncomePage>;
}
