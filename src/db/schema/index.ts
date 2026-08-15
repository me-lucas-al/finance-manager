import { pgTable, text, timestamp, boolean, json, integer, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodStartDay: integer('period_start_day').default(15).notNull(),
  periodEndDay: integer('period_end_day').default(14).notNull(),
  maxExpensesPercentage: integer('max_expenses_percentage').default(80).notNull(),
  minInvestmentPercentage: integer('min_investment_percentage').default(20).notNull(),
  expenseCategories: json('expense_categories').default([]).notNull().$type<string[]>(),
  investmentTypes: json('investment_types').default([]).notNull().$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: uniqueIndex('user_settings_user_id_idx').on(table.userId),
  };
});

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
  };
});

export const incomes = pgTable('incomes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodId: text('period_id').notNull().references(() => financialPeriods.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  receivedAt: timestamp('received_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('incomes_user_id_idx').on(table.userId),
    periodIdIdx: index('incomes_period_id_idx').on(table.periodId),
  };
});

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

export const investments = pgTable('investments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodId: text('period_id').notNull().references(() => financialPeriods.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  type: text('type').notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('investments_user_id_idx').on(table.userId),
    periodIdIdx: index('investments_period_id_idx').on(table.periodId),
  };
});

export const notificationPreferences = pgTable('notification_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expenseNotificationsEnabled: boolean('expense_notifications_enabled').default(true).notNull(),
  investmentNotificationsEnabled: boolean('investment_notifications_enabled').default(true).notNull(),
  goalNotificationsEnabled: boolean('goal_notifications_enabled').default(true).notNull(),
  closingNotificationsEnabled: boolean('closing_notifications_enabled').default(true).notNull(),
  generalNotificationsEnabled: boolean('general_notifications_enabled').default(true).notNull(),
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: uniqueIndex('notification_preferences_user_id_idx').on(table.userId),
  };
});

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userEndpointIdx: uniqueIndex('push_subscriptions_user_id_endpoint_idx').on(table.userId, table.endpoint),
  };
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
  };
});

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
