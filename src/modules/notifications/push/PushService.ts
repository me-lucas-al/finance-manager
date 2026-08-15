import webpush from 'web-push';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NotificationPayload } from '../domain/NotificationTypes';

// Configuração seria feita com variáveis de ambiente reais
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || 'dummy_public_key';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'dummy_private_key';

webpush.setVapidDetails(
  'mailto:contato@financemanager.com',
  publicVapidKey,
  privateVapidKey
);

export class PushService {
  static async sendNotificationToUser(userId: string, payload: NotificationPayload) {
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
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
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
