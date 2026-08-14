import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { incomes } from '../../../../db/schema/incomes';

export type Income = InferSelectModel<typeof incomes>;
export type NewIncome = InferInsertModel<typeof incomes>;

export interface IIncomeRepository {
  create(data: NewIncome): Promise<Income>;
  findById(id: string, userId: string): Promise<Income | null>;
  findByPeriodId(periodId: string, userId: string): Promise<Income[]>;
  update(id: string, userId: string, data: Partial<NewIncome>): Promise<Income>;
  delete(id: string, userId: string): Promise<void>;
}
