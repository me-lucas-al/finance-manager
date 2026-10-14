import { isValidMonthKey, shiftMonth } from '@/lib/month';

export function resolveReportPeriod(requested: string | undefined, currentMonth: string): string {
  if (requested === 'all') return 'all';
  if (requested === 'last') return shiftMonth(currentMonth, -1);
  if (requested && isValidMonthKey(requested)) return requested;
  return currentMonth;
}
