import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { financialPeriods } from './financialPeriods';

export const incomes = pgTable('incomes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodId: uuid('period_id').notNull().references(() => financialPeriods.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: integer('amount').notNull(), // Amount in cents
  category: text('category').notNull(),
  receivedAt: timestamp('received_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
