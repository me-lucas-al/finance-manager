import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const outboxMessages = pgTable(
  'outbox_messages',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    channel: text('channel').notNull(),
    eventType: text('event_type').notNull(),
    payload: text('payload').notNull(),
    status: text('status').default('PENDING').notNull(),
    attempts: integer('attempts').default(0).notNull(),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    sentAt: timestamp('sent_at'),
  },
  (table) => ({
    statusIdx: index('outbox_messages_status_idx').on(table.status),
    userIdIdx: index('outbox_messages_user_id_idx').on(table.userId),
  })
);
