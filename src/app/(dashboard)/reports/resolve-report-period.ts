import { shiftMonth } from '@/lib/month';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function resolveReportPeriod(requested: string | undefined, currentMonth: string): string {
  if (requested === 'all') return 'all';
  if (requested === 'last') return shiftMonth(currentMonth, -1);
  if (requested && MONTH_PATTERN.test(requested)) return requested;
  return currentMonth;
}
