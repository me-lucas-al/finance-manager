import { randomUUID } from 'crypto';
import { IncomeRepository, IncomeQuery, IncomePage, IncomeUpdate, NewIncome, Income } from '../domain/repositories/income-repository';
import { db } from '../../../db';
import { incomes } from '../../../db/schema';
import { and, asc, desc, eq, ilike, isNull } from 'drizzle-orm';
import { totalOverWindow, toPageWithTotal } from './page-with-total';
import { DuplicateFixedLaunchError } from '../domain/models/fixed-launch-errors';
import { isUniqueViolation } from './is-unique-violation';

export class DrizzleIncomeRepository implements IncomeRepository {
  async create(data: NewIncome): Promise<Income> {
    try {
      const [inserted] = await db.insert(incomes).values({
        id: data.id ?? randomUUID(),
        userId: data.userId,
        periodId: data.periodId,
        description: data.description,
        amount: String(data.amount),
        category: data.category,
        receivedAt: data.receivedAt,
        fixedEntryId: data.fixedEntryId ?? null,
        fixedReferenceMonth: data.fixedReferenceMonth ?? null,
      }).returning();
      return inserted;
    } catch (error) {
      if (data.fixedEntryId && isUniqueViolation(error)) throw new DuplicateFixedLaunchError();
      throw error;
    }
  }

  async findById(id: string): Promise<Income | null> {
    const [found] = await db.select().from(incomes).where(eq(incomes.id, id)).limit(1);
    return found ?? null;
  }

  async update(id: string, data: IncomeUpdate): Promise<Income> {
    const { amount, ...rest } = data;
    const [updated] = await db
      .update(incomes)
      .set({ ...rest, ...(amount === undefined ? {} : { amount: String(amount) }), updatedAt: new Date() })
      .where(eq(incomes.id, id))
      .returning();
    if (!updated) throw new Error('Income not found');
    return updated;
  }

  async findLatestEditableByUserId(userId: string): Promise<Income | null> {
    const [latest] = await db
      .select()
      .from(incomes)
      .where(
        and(eq(incomes.userId, userId), isNull(incomes.externalId), isNull(incomes.fixedReferenceMonth))
      )
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

    const rowsWithTotal = await db
      .select({ row: incomes, total: totalOverWindow })
      .from(incomes)
      .where(where)
      .orderBy(orderFn(sortColumn))
      .limit(query.limit)
      .offset(query.offset);
    return toPageWithTotal(rowsWithTotal);
  }
}
