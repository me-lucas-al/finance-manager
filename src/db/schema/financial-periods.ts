import { pgTable, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const financialPeriods = pgTable('financial_periods', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status').notNull(),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('financial_periods_user_id_idx').on(table.userId),
    statusIdx: index('financial_periods_status_idx').on(table.status),
    oneOpenPeriodPerUserIdx: uniqueIndex('financial_periods_one_open_per_user_idx')
      .on(table.userId)
      .where(sql`${table.status} = 'OPEN'`),
  };
});
