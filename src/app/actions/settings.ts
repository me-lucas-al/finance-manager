'use server';

import { db } from '@/db/connection';
import { notificationPreferences } from '@/db/schema/notificationPreferences';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export async function getNotificationPreferences() {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, session.userId))
    .limit(1);

  if (!prefs) {
    // Create default
    const [newPrefs] = await db.insert(notificationPreferences).values({
      userId: session.userId,
    }).returning();
    return { success: true, data: newPrefs };
  }

  return { success: true, data: prefs };
}

export async function updateNotificationPreferences(data: {
  expenseNotificationsEnabled?: boolean;
  investmentNotificationsEnabled?: boolean;
  goalNotificationsEnabled?: boolean;
  closingNotificationsEnabled?: boolean;
  generalNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
}) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, session.userId))
      .limit(1);

    if (!prefs) {
      await db.insert(notificationPreferences).values({
        userId: session.userId,
        ...data,
      });
    } else {
      await db
        .update(notificationPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, session.userId));
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating preferences:', error);
    return { success: false, error: 'Internal server error' };
  }
}
