import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { expenses } from '../../../../db/schema/expenses';

export type Expense = InferSelectModel<typeof expenses>;
export type NewExpense = InferInsertModel<typeof expenses>;

export interface IExpenseRepository {
  create(data: NewExpense): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findByPeriodId(periodId: string): Promise<Expense[]>;
  update(id: string, data: Partial<NewExpense>): Promise<Expense>;
  delete(id: string): Promise<void>;
}
