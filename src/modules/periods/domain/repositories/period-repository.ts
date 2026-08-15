import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { financialPeriods } from '@/db/schema';

export type Period = InferSelectModel<typeof financialPeriods>;
export type NewPeriod = InferInsertModel<typeof financialPeriods>;

export interface PeriodRepository {
  create(data: Omit<NewPeriod, 'id'>): Promise<Period>;
  findById(id: string): Promise<Period | null>;
  update(id: string, data: Partial<NewPeriod>): Promise<Period>;
  delete(id: string): Promise<void>;
}
