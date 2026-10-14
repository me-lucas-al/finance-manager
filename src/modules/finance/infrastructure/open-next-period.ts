import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { financialPeriods } from '@/db/schema';
import { getFinancialPeriod } from '@/modules/periods/domain/financial-period';

type PeriodWindow = { endDate: Date };
type PeriodDays = { periodStartDay?: number; periodEndDay?: number } | undefined;

export async function openNextPeriodIfMissing(userId: string, closed: PeriodWindow, settings: PeriodDays) {
  const existingOpenPeriods = await db.select().from(financialPeriods).where(
    and(eq(financialPeriods.userId, userId), eq(financialPeriods.status, 'OPEN'))
  );
  if (existingOpenPeriods.length > 0) return false;

  const nextReferenceDate = new Date(closed.endDate);
  nextReferenceDate.setDate(nextReferenceDate.getDate() + 1);

  const { start, end } = getFinancialPeriod(
    nextReferenceDate,
    settings?.periodStartDay ?? 15,
    settings?.periodEndDay ?? 14
  );

  await db.insert(financialPeriods).values({
    id: crypto.randomUUID(),
    userId,
    startDate: start,
    endDate: end,
    status: 'OPEN',
  });
  return true;
}
