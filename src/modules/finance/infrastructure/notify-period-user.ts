import { db } from '@/db';
import { notifications } from '@/db/schema';
import type { NotificationPayload } from '@/modules/notifications/domain/notification-types';
import { PushService } from '@/modules/notifications/push/push-service';

export async function notifyPeriodUser(payload: NotificationPayload, pushEnabled: boolean) {
  await db.insert(notifications).values({
    id: crypto.randomUUID(),
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
  });

  if (!pushEnabled) return;

  await PushService.sendNotificationToUser(payload.userId, payload).catch((error) => {
    console.error('Failed to send push notification:', error);
  });
}
