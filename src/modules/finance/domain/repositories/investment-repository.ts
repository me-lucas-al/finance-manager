import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { investments } from '@/db/schema';

export type Investment = InferSelectModel<typeof investments>;
export type NewInvestment = InferInsertModel<typeof investments>;

export interface InvestmentRepository {
  create(data: Omit<NewInvestment, 'id'>): Promise<Investment>;
  findById(id: string): Promise<Investment | null>;
  findAllByUserId(userId: string): Promise<Investment[]>;
  update(id: string, data: Partial<NewInvestment>): Promise<Investment>;
  delete(id: string): Promise<void>;
}
