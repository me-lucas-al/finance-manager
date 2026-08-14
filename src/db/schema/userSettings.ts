import { pgTable, integer, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodStartDay: integer('period_start_day').notNull().default(15),
  periodEndDay: integer('period_end_day').notNull().default(14),
  maxExpensesPercentage: integer('max_expenses_percentage').notNull().default(80),
  minInvestmentPercentage: integer('min_investment_percentage').notNull().default(20),
  expenseCategories: jsonb('expense_categories').notNull().default([]),
  investmentTypes: jsonb('investment_types').notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
