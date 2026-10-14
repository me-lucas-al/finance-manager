'use server';

import { z } from 'zod';
import { updateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { notificationPreferences } from '@/db/schema';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';

const exactBooleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const UNCHECKED_PREFERENCES = {
  expenseNotificationsEnabled: 'false',
  investmentNotificationsEnabled: 'false',
  goalNotificationsEnabled: 'false',
  closingNotificationsEnabled: 'false',
  generalNotificationsEnabled: 'false',
  pushNotificationsEnabled: 'false',
};

const updatePreferencesSchema = z.object({
  expenseNotificationsEnabled: exactBooleanString,
  investmentNotificationsEnabled: exactBooleanString,
  goalNotificationsEnabled: exactBooleanString,
  closingNotificationsEnabled: exactBooleanString,
  generalNotificationsEnabled: exactBooleanString,
  pushNotificationsEnabled: exactBooleanString,
});

async function fetchPreferencesCached(userId: string) {
  'use cache';
  const { cacheTag } = await import('next/cache');
  cacheTag(`notification-preferences-${userId}`);

  const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  return prefs ?? null;
}

export async function getNotificationPreferences() {
  const userId = await requireUserId();
  return fetchPreferencesCached(userId);
}

export async function updateNotificationPreferences(formData: FormData) {
  const userId = await requireUserId();

  const parsedData = updatePreferencesSchema.parse({
    ...UNCHECKED_PREFERENCES,
    ...Object.fromEntries(formData.entries()),
  });

  await db.update(notificationPreferences)
    .set(parsedData)
    .where(eq(notificationPreferences.userId, userId));

  updateTag(`notification-preferences-${userId}`);
}
