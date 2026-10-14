import { pgTable, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { users } from './users';
import { financialPeriods } from './financial-periods';

export const periodSnapshots = pgTable('period_snapshots', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodId: text('period_id').notNull().unique().references(() => financialPeriods.id, { onDelete: 'cascade' }),
  totalIncomes: numeric('total_incomes', { precision: 12, scale: 2 }).notNull(),
  totalExpenses: numeric('total_expenses', { precision: 12, scale: 2 }).notNull(),
  totalInvestments: numeric('total_investments', { precision: 12, scale: 2 }).notNull(),
  balance: numeric('balance', { precision: 12, scale: 2 }).notNull(),
  expensePercentage: numeric('expense_percentage', { precision: 5, scale: 2 }).notNull(),
  investmentPercentage: numeric('investment_percentage', { precision: 5, scale: 2 }).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
