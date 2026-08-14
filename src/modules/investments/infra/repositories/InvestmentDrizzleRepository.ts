import { eq } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { investments } from '../../../../db/schema/investments';
import { IInvestmentRepository, NewInvestment, Investment } from '../../domain/repositories/IInvestmentRepository';

export class InvestmentDrizzleRepository implements IInvestmentRepository {
  async create(data: NewInvestment): Promise<Investment> {
    const [investment] = await db.insert(investments).values(data).returning();
    return investment;
  }

  async findById(id: string): Promise<Investment | null> {
    const [investment] = await db.select().from(investments).where(eq(investments.id, id));
    return investment || null;
  }

  async findByUserId(userId: string): Promise<Investment[]> {
    return db.select().from(investments).where(eq(investments.userId, userId));
  }

  async update(id: string, data: Partial<NewInvestment>): Promise<Investment> {
    const [investment] = await db
      .update(investments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(investments.id, id))
      .returning();
    if (!investment) throw new Error('Investment not found');
    return investment;
  }

  async delete(id: string): Promise<void> {
    await db.delete(investments).where(eq(investments.id, id));
  }
}
