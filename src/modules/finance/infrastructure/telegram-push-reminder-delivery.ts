import type { NotificationPayload } from '@/modules/notifications/domain/NotificationTypes';
import { PushService } from '@/modules/notifications/push/PushService';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import type { FixedReminderDelivery } from '../domain/ports/fixed-entry-messaging';

export class TelegramPushReminderDelivery implements FixedReminderDelivery {
  async deliver(payload: NotificationPayload, pushEnabled: boolean): Promise<void> {
    await TelegramService.sendMessage(`⏰ ${payload.title}: ${payload.message}`);
    if (!pushEnabled) return;
    await PushService.sendNotificationToUser(payload.userId, payload).catch((error) => {
      console.error('Fixed entry reminder push failed:', error);
    });
  }
}
