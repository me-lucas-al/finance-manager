import { and, eq } from 'drizzle-orm';
import { PeriodRepository, NewPeriod } from '../domain/repositories/period-repository';
import { db } from '../../../db';
import { financialPeriods } from '../../../db/schema';

export class DrizzlePeriodRepository implements PeriodRepository {
  async create(data: Omit<NewPeriod, 'id'>) {
    const [result] = await db.insert(financialPeriods).values({ ...data, id: crypto.randomUUID() }).returning();
    return result;
  }
  async findById(id: string) {
    const [result] = await db.select().from(financialPeriods).where(eq(financialPeriods.id, id));
    return result ?? null;
  }
  async findOpenByUserId(userId: string) {
    const [result] = await db.select().from(financialPeriods).where(
      and(eq(financialPeriods.userId, userId), eq(financialPeriods.status, 'OPEN'))
    );
    return result ?? null;
  }
  async update(id: string, data: Partial<NewPeriod>) {
    const [result] = await db.update(financialPeriods).set(data).where(eq(financialPeriods.id, id)).returning();
    return result;
  }
  async delete(id: string) {
    await db.delete(financialPeriods).where(eq(financialPeriods.id, id));
  }
}
