import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { investments } from '@/db/schema';

export type Investment = InferSelectModel<typeof investments>;
export type NewInvestment = InferInsertModel<typeof investments>;

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
  create(data: Omit<NewInvestment, 'id'>): Promise<Investment>;
  findById(id: string): Promise<Investment | null>;
  findAllByUserId(userId: string): Promise<Investment[]>;
  findPageByUserId(userId: string, query: InvestmentQuery): Promise<InvestmentPage>;
  update(id: string, data: Partial<NewInvestment>): Promise<Investment>;
  delete(id: string): Promise<void>;
}
