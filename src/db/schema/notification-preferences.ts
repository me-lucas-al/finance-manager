import { pgTable, text, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

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
