'use server';

import { db } from '@/db/connection';
import { notifications } from '@/db/schema';
import { eq, and, isNull, desc, count } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getUnreadCount() {
  const session = await getSession();
  if (!session?.userId) return 0;

  try {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.userId),
          isNull(notifications.readAt)
        )
      );
    
    return result.count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

export async function getNotifications({ 
  page = 1, 
  limit = 20, 
  unreadOnly = false 
}: { 
  page?: number; 
  limit?: number; 
  unreadOnly?: boolean; 
}) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: 'Unauthorized', data: [], total: 0 };
  }

  try {
    const offset = (page - 1) * limit;

    const conditions = [eq(notifications.userId, session.userId)];
    if (unreadOnly) {
      conditions.push(isNull(notifications.readAt));
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(whereClause);

    const data = await db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return { 
      success: true, 
      data, 
      total: totalResult.count,
      page,
      totalPages: Math.ceil(totalResult.count / limit)
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: 'Internal server error', data: [], total: 0 };
  }
}

export async function markAsRead(notificationId: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: 'Unauthorized' };

  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.userId)
        )
      );

    revalidatePath('/notifications', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error marking as read:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: 'Unauthorized' };

  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, session.userId),
          isNull(notifications.readAt)
        )
      );

    revalidatePath('/notifications', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error: 'Internal server error' };
  }
}
