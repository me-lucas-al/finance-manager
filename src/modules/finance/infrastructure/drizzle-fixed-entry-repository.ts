import { randomUUID } from 'crypto';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { fixedEntries } from '@/db/schema';
import type { FixedEntry } from '../domain/models/fixed-entry';
import type {
  FixedEntryRepository,
  FixedEntryUpdate,
  NewFixedEntry,
} from '../domain/repositories/fixed-entry-repository';

type FixedEntryRow = typeof fixedEntries.$inferSelect;

function toFixedEntry(row: FixedEntryRow): FixedEntry {
  return { ...row, amount: Number(row.amount) };
}

export class DrizzleFixedEntryRepository implements FixedEntryRepository {
  async create(data: NewFixedEntry): Promise<FixedEntry> {
    const [inserted] = await db
      .insert(fixedEntries)
      .values({ ...data, id: randomUUID(), amount: String(data.amount) })
      .returning();
    return toFixedEntry(inserted);
  }

  async findById(id: string): Promise<FixedEntry | null> {
    const [found] = await db.select().from(fixedEntries).where(eq(fixedEntries.id, id)).limit(1);
    return found ? toFixedEntry(found) : null;
  }

  async findAllByUserId(userId: string): Promise<FixedEntry[]> {
    const rows = await db
      .select()
      .from(fixedEntries)
      .where(eq(fixedEntries.userId, userId))
      .orderBy(asc(fixedEntries.dueDay), asc(fixedEntries.description));
    return rows.map(toFixedEntry);
  }

  async update(id: string, data: FixedEntryUpdate): Promise<FixedEntry> {
    const { amount, ...rest } = data;
    const [updated] = await db
      .update(fixedEntries)
      .set({ ...rest, ...(amount === undefined ? {} : { amount: String(amount) }), updatedAt: new Date() })
      .where(eq(fixedEntries.id, id))
      .returning();
    if (!updated) throw new Error('Fixed entry not found');
    return toFixedEntry(updated);
  }

  async delete(id: string): Promise<void> {
    await db.delete(fixedEntries).where(eq(fixedEntries.id, id));
  }
}
