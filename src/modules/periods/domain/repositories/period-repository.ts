import type { NewPeriod, Period } from '../models/period';

export type { NewPeriod, Period };

export interface PeriodRepository {
  create(data: Omit<NewPeriod, 'id'>): Promise<Period>;
  findById(id: string): Promise<Period | null>;
  findOpenByUserId(userId: string): Promise<Period | null>;
  findByStartMonth(userId: string, month: string): Promise<Period | null>;
  findContaining(userId: string, date: Date): Promise<Period | null>;
  findOpenEndedBefore(date: Date): Promise<Period[]>;
  findOrCreateOpenPeriod(data: Omit<NewPeriod, 'id' | 'status'>): Promise<Period>;
  update(id: string, data: Partial<NewPeriod>): Promise<Period>;
  delete(id: string): Promise<void>;
}
