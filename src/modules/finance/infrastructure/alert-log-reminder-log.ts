import type { AlertLogRepository } from '@/modules/open-finance/domain/repositories/alert-log-repository';
import type { FixedReminderLog } from '../domain/ports/fixed-entry-messaging';

const NEVER = new Date(0);

export class AlertLogReminderLog implements FixedReminderLog {
  constructor(private readonly alertLog: AlertLogRepository) {}

  wasSent(reminderKey: string): Promise<boolean> {
    return this.alertLog.hasSentSince(reminderKey, NEVER);
  }

  async markSent(reminderKey: string, message: string): Promise<void> {
    await this.alertLog.create({ alertType: reminderKey, message });
  }
}
