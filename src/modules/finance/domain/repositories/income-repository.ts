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

export interface IncomeRepository {
  findPageByUserId(userId: string, query: IncomeQuery): Promise<IncomePage>;
}
