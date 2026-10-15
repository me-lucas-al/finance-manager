import { shiftMonth } from '@/lib/month';
import type { BillingCycle } from '../models/credit-card';

function daysInMonth(month: string): number {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

function closingDate(month: string, closingDay: number): string {
  const day = Math.min(closingDay, daysInMonth(month));
  return `${month}-${String(day).padStart(2, '0')}`;
}

function dayAfter(date: string): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

export function resolveBillingCycle(closingDay: number | null, today: string): BillingCycle {
  const month = today.slice(0, 7);
  if (closingDay === null) return { start: `${month}-01`, end: `${month}-${daysInMonth(month)}` };
  const thisClosing = closingDate(month, closingDay);
  if (today <= thisClosing) {
    return { start: dayAfter(closingDate(shiftMonth(month, -1), closingDay)), end: thisClosing };
  }
  return { start: dayAfter(thisClosing), end: closingDate(shiftMonth(month, 1), closingDay) };
}
