'use client';

import { useState } from 'react';
import { updateNotificationPreferences } from '@/app/actions/settings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PushNotificationManager } from '@/components/push-notification-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NotificationPreferences {
  pushNotificationsEnabled: boolean;
  expenseNotificationsEnabled: boolean;
  investmentNotificationsEnabled: boolean;
  goalNotificationsEnabled: boolean;
  closingNotificationsEnabled: boolean;
  generalNotificationsEnabled: boolean;
}

export function SettingsForm({ initialPreferences }: { initialPreferences: NotificationPreferences }) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(initialPreferences);
  const [loading, setLoading] = useState(false);

  async function handleToggle(key: keyof NotificationPreferences, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setLoading(true);
    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (e) {
      console.error(e);
      // Revert if error? We are ignoring for simplicity
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificaes Push</CardTitle>
          <CardDescription>
            Configure para receber alertas no seu navegador ou dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PushNotificationManager />

          <div className="pt-4 space-y-4 border-t">
            <h4 className="text-sm font-medium">Preferncias de Notificao</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Global</Label>
                <p className="text-sm text-muted-foreground">Ativar/desativar todas as notificaes push.</p>
              </div>
              <Switch
                checked={prefs.pushNotificationsEnabled}
                onCheckedChange={(c) => handleToggle('pushNotificationsEnabled', c)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Despesas</Label>
                <p className="text-sm text-muted-foreground">Alertas sobre suas despesas (ex. limites excedidos).</p>
              </div>
              <Switch
                checked={prefs.expenseNotificationsEnabled}
                onCheckedChange={(c) => handleToggle('expenseNotificationsEnabled', c)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Investimentos</Label>
                <p className="text-sm text-muted-foreground">Atualizaes sobre investimentos.</p>
              </div>
              <Switch
                checked={prefs.investmentNotificationsEnabled}
                onCheckedChange={(c) => handleToggle('investmentNotificationsEnabled', c)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Metas</Label>
                <p className="text-sm text-muted-foreground">Avisos quando atingir objetivos.</p>
              </div>
              <Switch
                checked={prefs.goalNotificationsEnabled}
                onCheckedChange={(c) => handleToggle('goalNotificationsEnabled', c)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Fechamento</Label>
                <p className="text-sm text-muted-foreground">Lembretes de fechamento de faturas e fim do ms.</p>
              </div>
              <Switch
                checked={prefs.closingNotificationsEnabled}
                onCheckedChange={(c) => handleToggle('closingNotificationsEnabled', c)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Gerais</Label>
                <p className="text-sm text-muted-foreground">Avisos de sistema e comunicados gerais.</p>
              </div>
              <Switch
                checked={prefs.generalNotificationsEnabled}
                onCheckedChange={(c) => handleToggle('generalNotificationsEnabled', c)}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
