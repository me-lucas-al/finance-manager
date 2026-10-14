import { cache } from 'react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { financialPeriods, userSettings } from '@/db/schema';

export const DEFAULT_START_DAY = 15;
export const DEFAULT_END_DAY = 14;

export const loadPeriods = cache((userId: string) =>
  db
    .select()
    .from(financialPeriods)
    .where(eq(financialPeriods.userId, userId))
    .orderBy(desc(financialPeriods.startDate)),
);

export const loadPeriodSettings = cache(async (userId: string) => {
  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
  return settings ?? null;
});

export type PeriodRecord = Awaited<ReturnType<typeof loadPeriods>>[number];

export function findCurrentPeriod(periods: PeriodRecord[]): PeriodRecord | undefined {
  return periods.find((period) => period.status === 'OPEN') ?? periods[0];
}
