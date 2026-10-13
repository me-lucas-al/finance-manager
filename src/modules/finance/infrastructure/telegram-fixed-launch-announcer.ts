import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import { formatFixedLaunchMessage } from '../application/fixed-entries/fixed-entry-message-formatter';
import type { FixedEntry } from '../domain/models/fixed-entry';
import type { FixedLaunchAnnouncer } from '../domain/ports/fixed-entry-messaging';

export class TelegramFixedLaunchAnnouncer implements FixedLaunchAnnouncer {
  async announceLaunched(entry: FixedEntry): Promise<void> {
    await TelegramService.sendMessage(formatFixedLaunchMessage(entry));
  }
}
