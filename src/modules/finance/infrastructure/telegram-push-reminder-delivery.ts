import type { NotificationPayload } from '@/modules/notifications/domain/notification-types';
import { PushService } from '@/modules/notifications/push/push-service';
import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import type { FixedReminderDelivery } from '../domain/ports/fixed-entry-messaging';

export class TelegramPushReminderDelivery implements FixedReminderDelivery {
  constructor(private readonly messenger: Pick<TelegramMessenger, 'sendMessage'>) {}

  async deliver(payload: NotificationPayload, pushEnabled: boolean): Promise<void> {
    await this.messenger.sendMessage(payload.userId, `⏰ ${payload.title}: ${payload.message}`);
    if (!pushEnabled) return;
    await PushService.sendNotificationToUser(payload.userId, payload).catch((error) => {
      console.error('Fixed entry reminder push failed:', error);
    });
  }
}
