import { eq, and } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { expenses } from '../../../../db/schema/expenses';
import { IExpenseRepository, NewExpense, Expense } from '../../domain/repositories/IExpenseRepository';

export class ExpenseDrizzleRepository implements IExpenseRepository {
  async create(data: NewExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(data).returning();
    return expense;
  }

  async findById(id: string, userId: string): Promise<Expense | null> {
    const [expense] = await db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return expense || null;
  }

  async findByPeriodId(periodId: string, userId: string): Promise<Expense[]> {
    return db.select().from(expenses).where(and(eq(expenses.periodId, periodId), eq(expenses.userId, userId)));
  }

  async update(id: string, userId: string, data: Partial<NewExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    if (!expense) throw new Error('Expense not found or unauthorized');
    return expense;
  }

  async delete(id: string, userId: string): Promise<void> {
    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  }
}
