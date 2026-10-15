import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import { formatFixedLaunchMessage } from '../application/fixed-entries/fixed-entry-message-formatter';
import type { FixedEntry } from '../domain/models/fixed-entry';
import type { FixedLaunchAnnouncer } from '../domain/ports/fixed-entry-messaging';

export class TelegramFixedLaunchAnnouncer implements FixedLaunchAnnouncer {
  constructor(private readonly messenger: Pick<TelegramMessenger, 'sendMessage'>) {}

  async announceLaunched(entry: FixedEntry): Promise<void> {
    await this.messenger.sendMessage(entry.userId, formatFixedLaunchMessage(entry));
  }
}
