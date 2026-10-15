import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { isUuid } from '@/lib/is-uuid';
import { creditCards } from '@/db/schema';
import type { CreditCard } from '../domain/models/credit-card';
import type {
  CreditCardRepository,
  CreditCardUpdate,
  NewCreditCard,
} from '../domain/repositories/credit-card-repository';

type CreditCardRow = typeof creditCards.$inferSelect;

function toCreditCard(row: CreditCardRow): CreditCard {
  return { ...row, creditLimit: Number(row.creditLimit) };
}

export class DrizzleCreditCardRepository implements CreditCardRepository {
  async create(data: NewCreditCard): Promise<CreditCard> {
    const [inserted] = await db
      .insert(creditCards)
      .values({ ...data, creditLimit: String(data.creditLimit) })
      .returning();
    return toCreditCard(inserted);
  }

  async findById(userId: string, id: string): Promise<CreditCard | null> {
    if (!isUuid(id)) return null;
    const [found] = await db
      .select()
      .from(creditCards)
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .limit(1);
    return found ? toCreditCard(found) : null;
  }

  async findAllByUserId(userId: string): Promise<CreditCard[]> {
    const rows = await db
      .select()
      .from(creditCards)
      .where(eq(creditCards.userId, userId))
      .orderBy(asc(creditCards.createdAt), asc(creditCards.name));
    return rows.map(toCreditCard);
  }

  async update(userId: string, id: string, data: CreditCardUpdate): Promise<CreditCard> {
    if (!isUuid(id)) throw new Error('Credit card not found');
    const { creditLimit, ...rest } = data;
    const [updated] = await db
      .update(creditCards)
      .set({ ...rest, ...(creditLimit === undefined ? {} : { creditLimit: String(creditLimit) }), updatedAt: new Date() })
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .returning();
    if (!updated) throw new Error('Credit card not found');
    return toCreditCard(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    if (!isUuid(id)) return;
    await db.delete(creditCards).where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)));
  }
}
