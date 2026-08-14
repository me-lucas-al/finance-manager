import { eq, and } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { investments } from '../../../../db/schema/investments';
import { IInvestmentRepository, NewInvestment, Investment } from '../../domain/repositories/IInvestmentRepository';

export class InvestmentDrizzleRepository implements IInvestmentRepository {
  async create(data: NewInvestment): Promise<Investment> {
    const [investment] = await db.insert(investments).values(data).returning();
    return investment;
  }

  async findById(id: string, userId: string): Promise<Investment | null> {
    const [investment] = await db.select().from(investments).where(and(eq(investments.id, id), eq(investments.userId, userId)));
    return investment || null;
  }

  async findByUserId(userId: string): Promise<Investment[]> {
    return db.select().from(investments).where(eq(investments.userId, userId));
  }

  async findByPeriodId(periodId: string, userId: string): Promise<Investment[]> {
    return db.select().from(investments).where(and(eq(investments.periodId, periodId), eq(investments.userId, userId)));
  }

  async update(id: string, userId: string, data: Partial<NewInvestment>): Promise<Investment> {
    const [investment] = await db
      .update(investments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(investments.id, id), eq(investments.userId, userId)))
      .returning();
    if (!investment) throw new Error('Investment not found or unauthorized');
    return investment;
  }

  async delete(id: string, userId: string): Promise<void> {
    await db.delete(investments).where(and(eq(investments.id, id), eq(investments.userId, userId)));
  }
}
