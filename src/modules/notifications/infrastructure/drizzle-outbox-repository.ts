import { randomUUID } from 'node:crypto';
import { eq, asc, sql } from 'drizzle-orm';
import { db } from '@/db/connection';
import { outboxMessages } from '@/db/schema/outbox';
import type {
  NewOutboxMessage,
  OutboxChannel,
  OutboxMessage,
  OutboxRepository,
  OutboxStatus,
} from '../domain/outbox-repository';

type DbOutboxRow = typeof outboxMessages.$inferSelect;

function toOutboxMessage(row: DbOutboxRow): OutboxMessage {
  return {
    id: row.id,
    userId: row.userId,
    channel: row.channel as OutboxChannel,
    eventType: row.eventType,
    payload: row.payload,
    status: row.status as OutboxStatus,
    attempts: row.attempts,
    lastError: row.lastError,
    createdAt: row.createdAt,
    sentAt: row.sentAt,
  };
}

export class DrizzleOutboxRepository implements OutboxRepository {
  async enqueue(data: NewOutboxMessage): Promise<OutboxMessage> {
    const id = data.id ?? randomUUID();
    const [row] = await db
      .insert(outboxMessages)
      .values({
        id,
        userId: data.userId,
        channel: data.channel,
        eventType: data.eventType,
        payload: data.payload,
        status: 'PENDING',
        attempts: 0,
      })
      .returning();
    return toOutboxMessage(row);
  }

  async findPending(limit = 20): Promise<OutboxMessage[]> {
    const rows = await db
      .select()
      .from(outboxMessages)
      .where(eq(outboxMessages.status, 'PENDING'))
      .orderBy(asc(outboxMessages.createdAt))
      .limit(limit);
    return rows.map(toOutboxMessage);
  }

  async markSent(id: string): Promise<void> {
    await db
      .update(outboxMessages)
      .set({ status: 'SENT', sentAt: new Date() })
      .where(eq(outboxMessages.id, id));
  }

  async markFailed(id: string, error: string): Promise<void> {
    await db
      .update(outboxMessages)
      .set({
        attempts: sql`${outboxMessages.attempts} + 1`,
        lastError: error,
        status: sql`CASE WHEN ${outboxMessages.attempts} + 1 >= 3 THEN 'FAILED' ELSE 'PENDING' END`,
      })
      .where(eq(outboxMessages.id, id));
  }
}
