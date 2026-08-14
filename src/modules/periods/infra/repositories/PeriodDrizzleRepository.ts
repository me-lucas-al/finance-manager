import { eq, and } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { financialPeriods } from '../../../../db/schema/financialPeriods';
import { IPeriodRepository, NewFinancialPeriod, FinancialPeriod } from '../../domain/repositories/IPeriodRepository';

export class PeriodDrizzleRepository implements IPeriodRepository {
  async create(data: NewFinancialPeriod): Promise<FinancialPeriod> {
    const [period] = await db.insert(financialPeriods).values(data).returning();
    return period;
  }

  async findById(id: string, userId?: string): Promise<FinancialPeriod | null> {
    const whereClause = userId ? and(eq(financialPeriods.id, id), eq(financialPeriods.userId, userId)) : eq(financialPeriods.id, id);
    const [period] = await db.select().from(financialPeriods).where(whereClause);
    return period || null;
  }

  async findByUserId(userId: string): Promise<FinancialPeriod[]> {
    return db.select().from(financialPeriods).where(eq(financialPeriods.userId, userId));
  }

  async findByExactDates(userId: string, startDate: Date, endDate: Date): Promise<FinancialPeriod | null> {
    const { and } = await import('drizzle-orm');
    const [period] = await db.select().from(financialPeriods).where(
      and(
        eq(financialPeriods.userId, userId),
        eq(financialPeriods.startDate, startDate),
        eq(financialPeriods.endDate, endDate)
      )
    );
    return period || null;
  }

  async update(id: string, data: Partial<NewFinancialPeriod>, userId?: string): Promise<FinancialPeriod> {
    const whereClause = userId ? and(eq(financialPeriods.id, id), eq(financialPeriods.userId, userId)) : eq(financialPeriods.id, id);
    const [period] = await db
      .update(financialPeriods)
      .set({ ...data, updatedAt: new Date() })
      .where(whereClause)
      .returning();
    if (!period) throw new Error('Financial period not found or unauthorized');
    return period;
  }

  async delete(id: string, userId?: string): Promise<void> {
    const whereClause = userId ? and(eq(financialPeriods.id, id), eq(financialPeriods.userId, userId)) : eq(financialPeriods.id, id);
    await db.delete(financialPeriods).where(whereClause);
  }

  async findEndedOpenPeriods(currentDate: Date): Promise<FinancialPeriod[]> {
    const { and, lte } = await import('drizzle-orm');
    return db.select().from(financialPeriods).where(
      and(
        eq(financialPeriods.status, 'open'),
        lte(financialPeriods.endDate, currentDate)
      )
    );
  }
  async closePeriodAndCreateNext(periodId: string, nextPeriodData: NewFinancialPeriod): Promise<FinancialPeriod> {
    return db.transaction(async (tx) => {
      const [period] = await tx
        .update(financialPeriods)
        .set({ status: 'closed', closedAt: new Date(), updatedAt: new Date() })
        .where(eq(financialPeriods.id, periodId))
        .returning();

      if (!period) throw new Error('Financial period not found');

      const { and } = await import('drizzle-orm');

      const [existing] = await tx.select().from(financialPeriods).where(
         and(
           eq(financialPeriods.userId, nextPeriodData.userId),
           eq(financialPeriods.startDate, nextPeriodData.startDate),
           eq(financialPeriods.endDate, nextPeriodData.endDate)
         )
      );

      if (!existing) {
         await tx.insert(financialPeriods).values(nextPeriodData);
      }

      return period;
    });
  }
}
