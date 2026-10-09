import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NotificationPreferencesForm } from './NotificationPreferencesForm';
import { PushNotificationButton } from './PushNotificationButton';

interface SettingsNotificationsCardProps {
  preferences: {
    expenseNotificationsEnabled: boolean;
    investmentNotificationsEnabled: boolean;
    goalNotificationsEnabled: boolean;
    closingNotificationsEnabled: boolean;
    generalNotificationsEnabled: boolean;
    pushNotificationsEnabled: boolean;
  } | null;
}

export function SettingsNotificationsCard({ preferences }: SettingsNotificationsCardProps) {
  if (!preferences) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Escolha quais avisos você quer receber.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Preferências de notificação não encontradas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Escolha quais avisos você quer receber.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <NotificationPreferencesForm
            expenseNotificationsEnabled={preferences.expenseNotificationsEnabled}
            investmentNotificationsEnabled={preferences.investmentNotificationsEnabled}
            goalNotificationsEnabled={preferences.goalNotificationsEnabled}
            closingNotificationsEnabled={preferences.closingNotificationsEnabled}
            generalNotificationsEnabled={preferences.generalNotificationsEnabled}
            pushNotificationsEnabled={preferences.pushNotificationsEnabled}
          />
          <div className="border-t pt-4">
            <PushNotificationButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
