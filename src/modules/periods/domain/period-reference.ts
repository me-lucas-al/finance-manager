import { wallMonthKey } from './period-window';

export type PeriodReference = { periodId: string; referenceMonth: string };

export function toPeriodReference(period: { id: string; startDate: Date }): PeriodReference {
  return { periodId: period.id, referenceMonth: wallMonthKey(period.startDate) };
}
