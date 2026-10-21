import { toLocalDateString } from '@/lib/month';

export type PeriodWindow = {
  id: string;
  referenceMonth: string;
  startDate: Date;
  endDate: Date;
};

const MS_PER_DAY = 86_400_000;

const twoDigits = (value: number): string => String(value).padStart(2, '0');

export function wallMonthKey(date: Date): string {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}`;
}

export function wallDateString(date: Date): string {
  return `${wallMonthKey(date)}-${twoDigits(date.getDate())}`;
}

export function toPeriodWindow(period: { id: string; startDate: Date; endDate: Date }): PeriodWindow {
  return {
    id: period.id,
    referenceMonth: wallMonthKey(period.startDate),
    startDate: period.startDate,
    endDate: period.endDate,
  };
}

export function daysLeftInPeriod(window: PeriodWindow, today: Date): number {
  const todayStart = Date.parse(`${toLocalDateString(today)}T00:00:00Z`);
  const endStart = Date.parse(`${wallDateString(window.endDate)}T00:00:00Z`);
  return Math.max(Math.round((endStart - todayStart) / MS_PER_DAY) + 1, 0);
}
