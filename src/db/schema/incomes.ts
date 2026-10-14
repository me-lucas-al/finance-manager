import { pgTable, text, timestamp, numeric, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { financialPeriods } from './financial-periods';

export const incomes = pgTable('incomes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodId: text('period_id').notNull().references(() => financialPeriods.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  receivedAt: timestamp('received_at').notNull(),
  externalId: text('external_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('incomes_user_id_idx').on(table.userId),
    periodIdIdx: index('incomes_period_id_idx').on(table.periodId),
    externalIdIdx: uniqueIndex('incomes_user_external_id_idx').on(table.userId, table.externalId),
  };
});
