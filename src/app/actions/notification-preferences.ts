'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { notificationPreferences } from '@/db/schema';
import { requireUserId } from './require-session';

const updatePreferencesSchema = z.object({
  expenseNotificationsEnabled: z.coerce.boolean(),
  investmentNotificationsEnabled: z.coerce.boolean(),
  goalNotificationsEnabled: z.coerce.boolean(),
  closingNotificationsEnabled: z.coerce.boolean(),
  generalNotificationsEnabled: z.coerce.boolean(),
  pushNotificationsEnabled: z.coerce.boolean(),
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

  revalidateTag(`notification-preferences-${userId}`, 'max');
}
