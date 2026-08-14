import { pgTable, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expenseNotificationsEnabled: boolean('expense_notifications_enabled').notNull().default(true),
  investmentNotificationsEnabled: boolean('investment_notifications_enabled').notNull().default(true),
  goalNotificationsEnabled: boolean('goal_notifications_enabled').notNull().default(true),
  closingNotificationsEnabled: boolean('closing_notifications_enabled').notNull().default(true),
  generalNotificationsEnabled: boolean('general_notifications_enabled').notNull().default(true),
  pushNotificationsEnabled: boolean('push_notifications_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
