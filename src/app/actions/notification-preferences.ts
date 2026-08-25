'use server';

import { z } from 'zod';
import { updateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { notificationPreferences } from '@/db/schema';
import { requireUserId } from './require-session';

// z.coerce.boolean() would turn the string "false" into `true` (any non-empty
// string is truthy), so checkboxes could never be turned off. Parse the exact
// "true"/"false" strings we send instead.
const booleanField = z.enum(['true', 'false']).transform((value) => value === 'true');

const updatePreferencesSchema = z.object({
  expenseNotificationsEnabled: booleanField,
  investmentNotificationsEnabled: booleanField,
  goalNotificationsEnabled: booleanField,
  closingNotificationsEnabled: booleanField,
  generalNotificationsEnabled: booleanField,
  pushNotificationsEnabled: booleanField,
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

  // Checkboxes only appear in FormData when checked, so default every field to "false" first.
  const rawData = {
    expenseNotificationsEnabled: 'false',
    investmentNotificationsEnabled: 'false',
    goalNotificationsEnabled: 'false',
    closingNotificationsEnabled: 'false',
    generalNotificationsEnabled: 'false',
    pushNotificationsEnabled: 'false',
    ...Object.fromEntries(formData.entries()),
  };
  const parsedData = updatePreferencesSchema.parse(rawData);

  await db.update(notificationPreferences)
    .set(parsedData)
    .where(eq(notificationPreferences.userId, userId));

  updateTag(`notification-preferences-${userId}`);
}
