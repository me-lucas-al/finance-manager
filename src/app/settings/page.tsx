import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUserSettings } from '@/app/actions/users';
import { getNotificationPreferences } from '@/app/actions/notification-preferences';
import { SettingsForm } from './SettingsForm';
import { NotificationPreferencesForm } from './NotificationPreferencesForm';
import { PushNotificationButton } from './PushNotificationButton';
import { ChangePasswordForm } from './ChangePasswordForm';

export default async function SettingsPage() {
  const [settings, preferences] = await Promise.all([
    getUserSettings(),
    getNotificationPreferences(),
  ]);

  if (!settings) {
    return <div className="p-8">Configurações não encontradas.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Regras Financeiras</CardTitle>
            <CardDescription>Defina o ciclo do seu período e as metas de gastos e investimentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              periodStartDay={settings.periodStartDay}
              periodEndDay={settings.periodEndDay}
              maxExpensesPercentage={settings.maxExpensesPercentage}
              minInvestmentPercentage={settings.minInvestmentPercentage}
              expenseCategories={settings.expenseCategories ?? []}
              investmentTypes={settings.investmentTypes ?? []}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança e Senha</CardTitle>
            <CardDescription>Altere a sua senha de acesso de forma segura.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Escolha quais avisos você quer receber.</CardDescription>
          </CardHeader>
          <CardContent>
            {preferences ? (
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
            ) : (
              <p className="text-sm text-muted-foreground">Preferências de notificação não encontradas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
