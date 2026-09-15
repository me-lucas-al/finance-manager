import { IncomeRepository, IncomeQuery, IncomePage } from '../domain/repositories/income-repository';
import { InvestmentRepository, InvestmentQuery, InvestmentPage } from '../domain/repositories/investment-repository';
import { db } from '../../../db';
import { incomes, investments } from '../../../db/schema';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';

export class DrizzleIncomeRepository implements IncomeRepository {
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

export class DrizzleInvestmentRepository implements InvestmentRepository {
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
