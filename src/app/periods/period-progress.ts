import { differenceInDays } from 'date-fns';

interface PeriodRange {
  startDate: Date | string;
  endDate: Date | string;
}

export function daysRemainingIn(period: PeriodRange, today: Date): number {
  return Math.max(0, differenceInDays(new Date(period.endDate), today));
}

export function progressPercentage(period: PeriodRange, today: Date): number {
  const totalDays = differenceInDays(new Date(period.endDate), new Date(period.startDate));
  const elapsedDays = differenceInDays(today, new Date(period.startDate));
  return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
}
