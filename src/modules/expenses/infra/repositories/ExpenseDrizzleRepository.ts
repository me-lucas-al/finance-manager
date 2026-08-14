import { eq } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { expenses } from '../../../../db/schema/expenses';
import { IExpenseRepository, NewExpense, Expense } from '../../domain/repositories/IExpenseRepository';

export class ExpenseDrizzleRepository implements IExpenseRepository {
  async create(data: NewExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(data).returning();
    return expense;
  }

  async findById(id: string): Promise<Expense | null> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || null;
  }

  async findByPeriodId(periodId: string): Promise<Expense[]> {
    return db.select().from(expenses).where(eq(expenses.periodId, periodId));
  }

  async update(id: string, data: Partial<NewExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    if (!expense) throw new Error('Expense not found');
    return expense;
  }

  async delete(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }
}
