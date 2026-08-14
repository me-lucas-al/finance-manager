import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { investments } from '../../../../db/schema/investments';

export type Investment = InferSelectModel<typeof investments>;
export type NewInvestment = InferInsertModel<typeof investments>;

export interface IInvestmentRepository {
  create(data: NewInvestment): Promise<Investment>;
  findById(id: string, userId: string): Promise<Investment | null>;
  findByUserId(userId: string): Promise<Investment[]>;
  findByPeriodId(periodId: string, userId: string): Promise<Investment[]>;
  update(id: string, userId: string, data: Partial<NewInvestment>): Promise<Investment>;
  delete(id: string, userId: string): Promise<void>;
}
