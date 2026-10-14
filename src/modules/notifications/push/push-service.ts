import webpush from 'web-push';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NotificationPayload } from '../domain/NotificationTypes';

// VAPID keys are read and applied lazily so a missing/incomplete config never
// crashes module import (e.g. during build or in environments without push set up).
function configureWebPush(): boolean {
  const publicKey = process.env.PUSH_PUBLIC_KEY;
  const privateKey = process.env.PUSH_PRIVATE_KEY;
  const subject = process.env.PUSH_SUBJECT;

  if (!publicKey || !privateKey || !subject) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export class PushService {
  static async sendNotificationToUser(userId: string, payload: NotificationPayload) {
    if (!configureWebPush()) {
      console.warn('Push notifications are not configured (missing PUSH_PUBLIC_KEY/PUSH_PRIVATE_KEY/PUSH_SUBJECT); skipping.');
      return;
    }

    const subscriptions = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));

    const pushPayload = JSON.stringify({
      title: payload.title,
      message: payload.message,
      type: payload.type,
    });

    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, pushPayload);
      } catch (error) {
        const statusCode = error instanceof webpush.WebPushError ? error.statusCode : undefined;
        if (statusCode === 404 || statusCode === 410) {
          console.log('Subscription has expired or is no longer valid: ', error);
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        } else {
          console.error('Error sending push notification:', error);
        }
      }
    });

    await Promise.allSettled(promises);
  }
}
