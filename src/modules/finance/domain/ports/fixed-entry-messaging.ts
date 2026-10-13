import type { NotificationPayload } from '@/modules/notifications/domain/NotificationTypes';
import type { FixedEntry } from '../models/fixed-entry';

export interface FixedLaunchAnnouncer {
  announceLaunched(entry: FixedEntry, dueDate: string): Promise<void>;
}

export type ReminderPreferences = {
  expense: boolean;
  general: boolean;
  push: boolean;
};

export interface ReminderPreferencesReader {
  read(userId: string): Promise<ReminderPreferences>;
}

export interface FixedReminderDelivery {
  deliver(payload: NotificationPayload, pushEnabled: boolean): Promise<void>;
}

export interface FixedReminderLog {
  wasSent(reminderKey: string): Promise<boolean>;
  markSent(reminderKey: string, message: string): Promise<void>;
}
