import { randomUUID } from 'crypto';
import { IncomeRepository, IncomeQuery, IncomePage, NewIncome, Income } from '../domain/repositories/income-repository';
import { db } from '../../../db';
import { incomes } from '../../../db/schema';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';

export class DrizzleIncomeRepository implements IncomeRepository {
  async create(data: NewIncome): Promise<Income> {
    const [inserted] = await db.insert(incomes).values({
      id: data.id ?? randomUUID(),
      userId: data.userId,
      periodId: data.periodId,
      description: data.description,
      amount: String(data.amount),
      category: data.category,
      receivedAt: data.receivedAt,
    }).returning();
    return inserted;
  }

  async findLatestByUserId(userId: string): Promise<Income | null> {
    const [latest] = await db
      .select()
      .from(incomes)
      .where(eq(incomes.userId, userId))
      .orderBy(desc(incomes.createdAt))
      .limit(1);
    return latest ?? null;
  }

  async delete(id: string): Promise<void> {
    await db.delete(incomes).where(eq(incomes.id, id));
  }

  async findPageByUserId(userId: string, query: IncomeQuery): Promise<IncomePage> {
    const conditions = [eq(incomes.userId, userId)];
    if (query.category) conditions.push(eq(incomes.category, query.category));
    if (query.search) conditions.push(ilike(incomes.description, `%${query.search}%`));
    const where = and(...conditions);

    const sortColumn = query.sort === 'description' ? incomes.description
      : query.sort === 'amount' ? incomes.amount
      : incomes.receivedAt;
    const orderFn = query.dir === 'asc' ? asc : desc;

    const [rows, totalResult] = await Promise.all([
      db.select().from(incomes).where(where).orderBy(orderFn(sortColumn)).limit(query.limit).offset(query.offset),
      db.select({ value: count() }).from(incomes).where(where),
    ]);
    return { rows, total: Number(totalResult[0]?.value ?? 0) };
  }
}
