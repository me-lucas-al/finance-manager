import { toLocalDateString } from '@/lib/month';
import { NotificationFactory } from '@/modules/notifications/domain/NotificationFactory';
import type { FixedEntry } from '../../domain/models/fixed-entry';
import type {
  FixedReminderDelivery,
  FixedReminderLog,
  ReminderPreferences,
  ReminderPreferencesReader,
} from '../../domain/ports/fixed-entry-messaging';
import type { FixedEntryRepository } from '../../domain/repositories/fixed-entry-repository';
import { nextDay } from '../../domain/services/resolve-due-date';
import { selectFixedEntriesDueTomorrow } from '../../domain/services/select-fixed-entries';

function isEnabledFor(rule: FixedEntry, preferences: ReminderPreferences): boolean {
  return rule.kind === 'expense' ? preferences.expense : preferences.general;
}

export class SendFixedEntryRemindersUseCase {
  constructor(
    private readonly rules: FixedEntryRepository,
    private readonly preferences: ReminderPreferencesReader,
    private readonly delivery: FixedReminderDelivery,
    private readonly log: FixedReminderLog,
    private readonly clock: () => Date = () => new Date()
  ) {}

  async execute(userId: string): Promise<number> {
    const today = toLocalDateString(this.clock());
    const dueTomorrow = selectFixedEntriesDueTomorrow(await this.rules.findAllByUserId(userId), today);
    if (dueTomorrow.length === 0) return 0;

    const preferences = await this.preferences.read(userId);
    const reminderDate = nextDay(today);
    let sent = 0;
    for (const rule of dueTomorrow) {
      if (!isEnabledFor(rule, preferences)) continue;
      if (await this.remind(rule, reminderDate, preferences.push)) sent += 1;
    }
    return sent;
  }

  private async remind(rule: FixedEntry, reminderDate: string, pushEnabled: boolean): Promise<boolean> {
    const reminderKey = `fixed-reminder:${rule.id}:${reminderDate}`;
    try {
      if (await this.log.wasSent(reminderKey)) return false;
      const payload = NotificationFactory.createFixedEntryReminder(rule);
      await this.delivery.deliver(payload, pushEnabled);
      await this.log.markSent(reminderKey, payload.message);
      return true;
    } catch (error) {
      console.error(`Fixed entry reminder ${rule.id} failed:`, error);
      return false;
    }
  }
}
