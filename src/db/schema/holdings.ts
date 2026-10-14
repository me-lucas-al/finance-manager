import { pgTable, text, timestamp, numeric, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const holdings = pgTable('holdings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemId: text('item_id').notNull(),
  externalId: text('external_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  balance: numeric('balance', { precision: 12, scale: 2 }).notNull(),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('holdings_user_id_idx').on(table.userId),
    externalIdIdx: uniqueIndex('holdings_user_external_id_idx').on(table.userId, table.externalId),
  };
});
