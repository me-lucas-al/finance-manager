import { pgTable, text, timestamp, json, integer, numeric, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodStartDay: integer('period_start_day').default(15).notNull(),
  periodEndDay: integer('period_end_day').default(14).notNull(),
  maxExpensesPercentage: integer('max_expenses_percentage').default(80).notNull(),
  minInvestmentPercentage: integer('min_investment_percentage').default(20).notNull(),
  initialBalance: numeric('initial_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  expenseCategories: json('expense_categories').default([]).notNull().$type<string[]>(),
  investmentTypes: json('investment_types').default([]).notNull().$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: uniqueIndex('user_settings_user_id_idx').on(table.userId),
  };
});
