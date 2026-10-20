import { toMonthKey } from '@/lib/month';

export type PeriodReference = { periodId: string; referenceMonth: string };

export function toPeriodReference(period: { id: string; startDate: Date }): PeriodReference {
  return { periodId: period.id, referenceMonth: toMonthKey(period.startDate) };
}
