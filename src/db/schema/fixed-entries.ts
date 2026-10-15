import { pgTable, text, timestamp, boolean, integer, numeric, index, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const fixedEntries = pgTable('fixed_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull().$type<'expense' | 'income'>(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  dueDay: integer('due_day').notNull(),
  active: boolean('active').default(true).notNull(),
  startsOn: date('starts_on', { mode: 'string' }).default(sql`current_date`).notNull(),
  lastLaunchedMonth: text('last_launched_month'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('fixed_entries_user_id_idx').on(table.userId),
  };
});
