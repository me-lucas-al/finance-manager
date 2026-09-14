import { IncomeRepository, IncomeQuery, IncomePage, NewIncome } from '../domain/repositories/income-repository';
import { ExpenseRepository, NewExpense } from '../domain/repositories/expense-repository';
import { InvestmentRepository, InvestmentQuery, InvestmentPage, NewInvestment } from '../domain/repositories/investment-repository';
import { db } from '../../../db';
import { incomes, expenses, investments } from '../../../db/schema';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';

export class DrizzleIncomeRepository implements IncomeRepository {
  async create(data: Omit<NewIncome, 'id'>) {
    const [result] = await db.insert(incomes).values({ ...data, id: crypto.randomUUID() }).returning();
    return result;
  }
  async findById(id: string) {
    const [result] = await db.select().from(incomes).where(eq(incomes.id, id));
    return result ?? null;
  }
  async findAllByUserId(userId: string) {
    return await db.select().from(incomes).where(eq(incomes.userId, userId)).orderBy(incomes.receivedAt);
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
  async update(id: string, data: Partial<NewIncome>) {
    const [result] = await db.update(incomes).set(data).where(eq(incomes.id, id)).returning();
    return result;
  }
  async delete(id: string) {
    await db.delete(incomes).where(eq(incomes.id, id));
  }
}

export class DrizzleExpenseRepository implements ExpenseRepository {
  async create(data: Omit<NewExpense, 'id'>) {
    const [result] = await db.insert(expenses).values({ ...data, id: crypto.randomUUID() }).returning();
    return result;
  }
  async findById(id: string) {
    const [result] = await db.select().from(expenses).where(eq(expenses.id, id));
    return result ?? null;
  }
  async findAllByUserId(userId: string) {
    return await db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(expenses.date);
  }
  async update(id: string, data: Partial<NewExpense>) {
    const [result] = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning();
    return result;
  }
  async delete(id: string) {
    await db.delete(expenses).where(eq(expenses.id, id));
  }
}

export class DrizzleInvestmentRepository implements InvestmentRepository {
  async create(data: Omit<NewInvestment, 'id'>) {
    const [result] = await db.insert(investments).values({ ...data, id: crypto.randomUUID() }).returning();
    return result;
  }
  async findById(id: string) {
    const [result] = await db.select().from(investments).where(eq(investments.id, id));
    return result ?? null;
  }
  async findAllByUserId(userId: string) {
    return await db.select().from(investments).where(eq(investments.userId, userId)).orderBy(investments.date);
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
  async update(id: string, data: Partial<NewInvestment>) {
    const [result] = await db.update(investments).set(data).where(eq(investments.id, id)).returning();
    return result;
  }
  async delete(id: string) {
    await db.delete(investments).where(eq(investments.id, id));
  }
}
