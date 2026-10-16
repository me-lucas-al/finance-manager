import { pgTable, text, timestamp, numeric, smallint, uuid, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const creditCards = pgTable('credit_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  lastDigits: text('last_digits'),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }).default('0').notNull(),
  closingDay: smallint('closing_day'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('credit_cards_user_id_idx').on(table.userId),
    idUserIdKey: unique('credit_cards_id_user_id_key').on(table.id, table.userId),
  };
});
