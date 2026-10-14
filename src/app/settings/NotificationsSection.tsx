import { getNotificationPreferences } from '@/app/actions/notification-preferences';
import { SettingsNotificationsCard } from './SettingsNotificationsCard';

export async function NotificationsSection() {
  return <SettingsNotificationsCard preferences={await getNotificationPreferences()} />;
}
