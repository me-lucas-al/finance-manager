import { toLocalDateString, toMonthKey } from '@/lib/month';

export type PeriodWindow = {
  id: string;
  referenceMonth: string;
  startDate: Date;
  endDate: Date;
};

const MS_PER_DAY = 86_400_000;

export function toPeriodWindow(period: { id: string; startDate: Date; endDate: Date }): PeriodWindow {
  return {
    id: period.id,
    referenceMonth: toMonthKey(period.startDate),
    startDate: period.startDate,
    endDate: period.endDate,
  };
}

export function daysLeftInPeriod(window: PeriodWindow, today: Date): number {
  const todayStart = Date.parse(`${toLocalDateString(today)}T00:00:00Z`);
  const endStart = Date.parse(`${toLocalDateString(window.endDate)}T00:00:00Z`);
  return Math.max(Math.round((endStart - todayStart) / MS_PER_DAY) + 1, 0);
}
