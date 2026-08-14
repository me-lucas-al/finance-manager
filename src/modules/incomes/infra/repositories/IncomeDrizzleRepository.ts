import { eq } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { incomes } from '../../../../db/schema/incomes';
import { IIncomeRepository, NewIncome, Income } from '../../domain/repositories/IIncomeRepository';

export class IncomeDrizzleRepository implements IIncomeRepository {
  async create(data: NewIncome): Promise<Income> {
    const [income] = await db.insert(incomes).values(data).returning();
    return income;
  }

  async findById(id: string): Promise<Income | null> {
    const [income] = await db.select().from(incomes).where(eq(incomes.id, id));
    return income || null;
  }

  async findByPeriodId(periodId: string): Promise<Income[]> {
    return db.select().from(incomes).where(eq(incomes.periodId, periodId));
  }

  async update(id: string, data: Partial<NewIncome>): Promise<Income> {
    const [income] = await db
      .update(incomes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(incomes.id, id))
      .returning();
    if (!income) throw new Error('Income not found');
    return income;
  }

  async delete(id: string): Promise<void> {
    await db.delete(incomes).where(eq(incomes.id, id));
  }
}
