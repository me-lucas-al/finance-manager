import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { financialPeriods } from '../../../../db/schema/financialPeriods';

export type FinancialPeriod = InferSelectModel<typeof financialPeriods>;
export type NewFinancialPeriod = InferInsertModel<typeof financialPeriods>;

export interface IPeriodRepository {
  create(data: NewFinancialPeriod): Promise<FinancialPeriod>;
  findById(id: string): Promise<FinancialPeriod | null>;
  findByExactDates(userId: string, startDate: Date, endDate: Date): Promise<FinancialPeriod | null>;
  findByUserId(userId: string): Promise<FinancialPeriod[]>;
  update(id: string, data: Partial<NewFinancialPeriod>): Promise<FinancialPeriod>;
  delete(id: string): Promise<void>;
  closePeriodAndCreateNext?(periodId: string, nextPeriodData: NewFinancialPeriod): Promise<FinancialPeriod>;
  findEndedOpenPeriods?(currentDate: Date): Promise<FinancialPeriod[]>;
}
