import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { financialPeriods } from '@/db/schema';

export type Period = InferSelectModel<typeof financialPeriods>;
export type NewPeriod = InferInsertModel<typeof financialPeriods>;

export interface PeriodRepository {
  create(data: Omit<NewPeriod, 'id'>): Promise<Period>;
  findById(id: string): Promise<Period | null>;
  findOpenByUserId(userId: string): Promise<Period | null>;
  /**
   * Creates an OPEN period for the user unless one already exists (enforced by
   * a partial unique index), in which case the existing one is returned.
   * Safe under concurrent calls for the same user.
   */
  findOrCreateOpenPeriod(data: Omit<NewPeriod, 'id' | 'status'>): Promise<Period>;
  update(id: string, data: Partial<NewPeriod>): Promise<Period>;
  delete(id: string): Promise<void>;
}
