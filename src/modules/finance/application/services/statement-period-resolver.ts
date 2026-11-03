import { monthLabel } from '@/lib/month';
import { wallDateString, type PeriodWindow } from '@/modules/periods/domain/period-window';
import { monthRange, type DateRange } from '../../domain/models/date-range';

export type StatementPeriod = { range: DateRange; label: string };

export type StatementPeriodResolver = (userId: string, month: string) => Promise<StatementPeriod>;

export type PeriodWindowFinder = {
  windowForMonth(userId: string, month: string): Promise<PeriodWindow | null>;
};

const dayAndMonth = (date: string): string => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

export function createStatementPeriodResolver(periods: PeriodWindowFinder): StatementPeriodResolver {
  return async (userId, month) => {
    const window = await periods.windowForMonth(userId, month);
    if (!window) return { range: monthRange(month), label: monthLabel(month) };
    const range = { from: wallDateString(window.startDate), to: wallDateString(window.endDate) };
    return { range, label: `${monthLabel(month)} · ${dayAndMonth(range.from)} a ${dayAndMonth(range.to)}` };
  };
}
