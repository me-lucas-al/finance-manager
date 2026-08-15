'use server';

import { revalidateTag } from 'next/cache';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { requireUserId } from './require-session';

async function fetchNotificationsCached(userId: string) {
  'use cache';
  const { cacheTag } = await import('next/cache');
  cacheTag(`notifications-${userId}`);

  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

export async function getNotifications() {
  const userId = await requireUserId();
  return fetchNotificationsCached(userId);
}

export async function markNotificationAsRead(id: string) {
  const userId = await requireUserId();
  await db.update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  revalidateTag(`notifications-${userId}`, 'max');
}

export async function markAllNotificationsAsRead() {
  const userId = await requireUserId();
  await db.update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  revalidateTag(`notifications-${userId}`, 'max');
}

export async function clearAllNotifications() {
  const userId = await requireUserId();
  await db.delete(notifications).where(eq(notifications.userId, userId));
  revalidateTag(`notifications-${userId}`, 'max');
}
