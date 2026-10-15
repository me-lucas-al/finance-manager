import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { notificationPreferences } from '@/db/schema';
import type { ReminderPreferences, ReminderPreferencesReader } from '../domain/ports/fixed-entry-messaging';

export class DrizzleReminderPreferencesReader implements ReminderPreferencesReader {
  async read(userId: string): Promise<ReminderPreferences> {
    const [stored] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return {
      expense: stored?.expenseNotificationsEnabled ?? true,
      general: stored?.generalNotificationsEnabled ?? true,
      push: stored?.pushNotificationsEnabled ?? false,
    };
  }
}
