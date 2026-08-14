import { eq } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { financialPeriods } from '../../../../db/schema/financialPeriods';
import { IPeriodRepository, NewFinancialPeriod, FinancialPeriod } from '../../domain/repositories/IPeriodRepository';

export class PeriodDrizzleRepository implements IPeriodRepository {
  async create(data: NewFinancialPeriod): Promise<FinancialPeriod> {
    const [period] = await db.insert(financialPeriods).values(data).returning();
    return period;
  }

  async findById(id: string): Promise<FinancialPeriod | null> {
    const [period] = await db.select().from(financialPeriods).where(eq(financialPeriods.id, id));
    return period || null;
  }

  async findByUserId(userId: string): Promise<FinancialPeriod[]> {
    return db.select().from(financialPeriods).where(eq(financialPeriods.userId, userId));
  }

  async update(id: string, data: Partial<NewFinancialPeriod>): Promise<FinancialPeriod> {
    const [period] = await db
      .update(financialPeriods)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(financialPeriods.id, id))
      .returning();
    if (!period) throw new Error('Financial period not found');
    return period;
  }

  async delete(id: string): Promise<void> {
    await db.delete(financialPeriods).where(eq(financialPeriods.id, id));
  }
}
