import { eq, and } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { incomes } from '../../../../db/schema/incomes';
import { IIncomeRepository, NewIncome, Income } from '../../domain/repositories/IIncomeRepository';

export class IncomeDrizzleRepository implements IIncomeRepository {
  async create(data: NewIncome): Promise<Income> {
    const [income] = await db.insert(incomes).values(data).returning();
    return income;
  }

  async findById(id: string, userId: string): Promise<Income | null> {
    const [income] = await db.select().from(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
    return income || null;
  }

  async findByPeriodId(periodId: string, userId: string): Promise<Income[]> {
    return db.select().from(incomes).where(and(eq(incomes.periodId, periodId), eq(incomes.userId, userId)));
  }

  async update(id: string, userId: string, data: Partial<NewIncome>): Promise<Income> {
    const [income] = await db
      .update(incomes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(incomes.id, id), eq(incomes.userId, userId)))
      .returning();
    if (!income) throw new Error('Income not found or unauthorized');
    return income;
  }

  async delete(id: string, userId: string): Promise<void> {
    await db.delete(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
  }
}
