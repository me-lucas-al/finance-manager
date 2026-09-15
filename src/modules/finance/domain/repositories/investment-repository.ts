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

export interface InvestmentRepository {
  findPageByUserId(userId: string, query: InvestmentQuery): Promise<InvestmentPage>;
}
