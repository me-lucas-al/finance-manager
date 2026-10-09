import { randomUUID } from 'crypto';
import {
  InvestmentRepository,
  InvestmentQuery,
  InvestmentPage,
  NewInvestment,
  Investment,
} from '../domain/repositories/investment-repository';
import { db } from '../../../db';
import { investments } from '../../../db/schema';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';

export class DrizzleInvestmentRepository implements InvestmentRepository {
  async create(data: NewInvestment): Promise<Investment> {
    const [inserted] = await db.insert(investments).values({
      id: data.id ?? randomUUID(),
      userId: data.userId,
      periodId: data.periodId,
      description: data.description,
      amount: String(data.amount),
      type: data.type,
      date: data.date,
    }).returning();
    return inserted;
  }

  async findLatestByUserId(userId: string): Promise<Investment | null> {
    const [latest] = await db
      .select()
      .from(investments)
      .where(eq(investments.userId, userId))
      .orderBy(desc(investments.createdAt))
      .limit(1);
    return latest ?? null;
  }

  async delete(id: string): Promise<void> {
    await db.delete(investments).where(eq(investments.id, id));
  }

  async findPageByUserId(userId: string, query: InvestmentQuery): Promise<InvestmentPage> {
    const conditions = [eq(investments.userId, userId)];
    if (query.type) conditions.push(eq(investments.type, query.type));
    if (query.search) conditions.push(ilike(investments.description, `%${query.search}%`));
    const where = and(...conditions);

    const sortColumn = query.sort === 'description' ? investments.description
      : query.sort === 'amount' ? investments.amount
      : investments.date;
    const orderFn = query.dir === 'asc' ? asc : desc;

    const [rows, totalResult] = await Promise.all([
      db.select().from(investments).where(where).orderBy(orderFn(sortColumn)).limit(query.limit).offset(query.offset),
      db.select({ value: count() }).from(investments).where(where),
    ]);
    return { rows, total: Number(totalResult[0]?.value ?? 0) };
  }
}
