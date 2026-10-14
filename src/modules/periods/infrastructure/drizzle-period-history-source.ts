import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { financialPeriods, incomes, investments, periodSnapshots } from '@/db/schema';
import type { PeriodHistorySource } from '../domain/ports/period-history-source';
import type { PeriodEntryRef, PeriodSnapshotRecord } from '../domain/models/period-records';

type SnapshotRow = typeof periodSnapshots.$inferSelect;

function toSnapshotRecord(row: SnapshotRow): PeriodSnapshotRecord {
  return {
    periodId: row.periodId,
    totalIncomes: Number(row.totalIncomes),
    totalExpenses: Number(row.totalExpenses),
    totalInvestments: Number(row.totalInvestments),
    balance: Number(row.balance),
    expensePercentage: Number(row.expensePercentage),
    investmentPercentage: Number(row.investmentPercentage),
    status: row.status,
  };
}

export class DrizzlePeriodHistorySource implements PeriodHistorySource {
  findPeriods(userId: string) {
    return db.select().from(financialPeriods).where(eq(financialPeriods.userId, userId));
  }

  async findSnapshots(userId: string) {
    const rows = await db.select().from(periodSnapshots).where(eq(periodSnapshots.userId, userId));
    return rows.map(toSnapshotRecord);
  }

  async findEntryRefs(userId: string): Promise<PeriodEntryRef[]> {
    const [incomeRows, investmentRows] = await Promise.all([
      db.select({ id: incomes.id, periodId: incomes.periodId }).from(incomes).where(eq(incomes.userId, userId)),
      db
        .select({ id: investments.id, periodId: investments.periodId })
        .from(investments)
        .where(eq(investments.userId, userId)),
    ]);
    return [
      ...incomeRows.map((row) => ({ ...row, kind: 'income' as const })),
      ...investmentRows.map((row) => ({ ...row, kind: 'investment' as const })),
    ];
  }
}
