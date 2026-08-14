'use server';

import { db } from '@/db/connection';
import { pushSubscriptions } from '@/db/schema/pushSubscriptions';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export async function saveSubscriptionAction(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { endpoint, keys } = subscription;

    // Check if it already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, session.userId),
        eq(pushSubscriptions.endpoint, endpoint)
      ))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(pushSubscriptions).values({
        userId: session.userId,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving subscription:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function removeSubscriptionAction(endpoint: string) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .delete(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, session.userId),
        eq(pushSubscriptions.endpoint, endpoint)
      ));

    return { success: true };
  } catch (error) {
    console.error('Error removing subscription:', error);
    return { success: false, error: 'Internal server error' };
  }
}
