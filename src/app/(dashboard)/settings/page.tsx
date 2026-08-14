import { getNotificationPreferences } from '@/app/actions/settings';
import { SettingsForm } from './settings-form';

export const metadata = {
  title: 'Configuraes | Finance Manager',
};

export default async function SettingsPage() {
  const { data: prefs, error } = await getNotificationPreferences();

  if (error || !prefs) {
    return <div>Erro ao carregar configuraes.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuraes</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferncias de notificao e configurações da conta.
        </p>
      </div>
      
      <SettingsForm initialPreferences={prefs} />
    </div>
  );
}
