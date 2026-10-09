import type { InferSelectModel } from 'drizzle-orm';
import type { investments } from '@/db/schema';

export type Investment = InferSelectModel<typeof investments>;

export type InvestmentSortField = 'date' | 'description' | 'amount';

export type InvestmentQuery = {
  search?: string;
  type?: string;
  sort?: InvestmentSortField;
  dir?: 'asc' | 'desc';
  limit: number;
  offset: number;
};

export type InvestmentPage = { rows: Investment[]; total: number };

export type NewInvestment = {
  id?: string;
  userId: string;
  periodId: string;
  description: string;
  amount: number | string;
  type: string;
  date: Date;
};

export interface InvestmentRepository {
  create(data: NewInvestment): Promise<Investment>;
  findLatestByUserId(userId: string): Promise<Investment | null>;
  delete(id: string): Promise<void>;
  findPageByUserId(userId: string, query: InvestmentQuery): Promise<InvestmentPage>;
}
