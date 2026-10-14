import { pgTable, text, timestamp, numeric, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { financialPeriods } from './financial-periods';

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodId: text('period_id').notNull().references(() => financialPeriods.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('expenses_user_id_idx').on(table.userId),
    periodIdIdx: index('expenses_period_id_idx').on(table.periodId),
  };
});
