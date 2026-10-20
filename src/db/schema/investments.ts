import { pgTable, text, timestamp, numeric, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { financialPeriods } from './financial-periods';

export const investments = pgTable('investments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodId: text('period_id').notNull().references(() => financialPeriods.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  type: text('type').notNull(),
  date: timestamp('date').notNull(),
  externalId: text('external_id'),
  referenceMonth: text('reference_month'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('investments_user_id_idx').on(table.userId),
    periodIdIdx: index('investments_period_id_idx').on(table.periodId),
    userPeriodDateIdx: index('investments_user_period_date_idx').on(table.userId, table.periodId, table.date.desc()),
    externalIdIdx: uniqueIndex('investments_user_external_id_idx').on(table.userId, table.externalId),
  };
});
