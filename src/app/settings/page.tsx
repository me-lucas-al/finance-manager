import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUserSettings } from '@/app/actions/users';
import { getNotificationPreferences } from '@/app/actions/notification-preferences';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SettingsForm } from './SettingsForm';
import { NotificationPreferencesForm } from './NotificationPreferencesForm';
import { PushNotificationButton } from './PushNotificationButton';
import { ChangePasswordForm } from './ChangePasswordForm';
import { ProfileForm } from './ProfileForm';

export default async function SettingsPage() {
  const [settings, preferences, userId] = await Promise.all([
    getUserSettings(),
    getNotificationPreferences(),
    getEffectiveUserId(),
  ]);

  const { data: dbUser } = await getSupabaseAdmin()
    .from('users')
    .select('id, name, email, created_at')
    .eq('id', userId)
    .maybeSingle();

  const userName = dbUser?.name || 'Lucas Almeida de Souza';
  const userEmail = dbUser?.email || 'lucasalsouza2006@gmail.com';
  const userCreatedAt = dbUser?.created_at;

  if (!settings) {
    return <div className="p-8 text-zinc-400">Configurações não encontradas.</div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Meu Perfil & Configurações</h1>
            <p className="text-xs text-zinc-400 mt-1">Gerencie suas informações pessoais, preferências e conexões</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Card */}
          <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl md:col-span-2 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-semibold text-white">Perfil do Titular</CardTitle>
              </div>
              <CardDescription className="text-xs text-zinc-400">
                Seus dados cadastrais vinculados à conta do Finance Manager.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialName={userName}
                email={userEmail}
                createdAt={userCreatedAt}
              />
            </CardContent>
          </Card>
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Integração de Bancos (Open Finance)</CardTitle>
            <CardDescription>Conecte contas bancárias para importação automática de transações via Pluggy.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/connections" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              Gerenciar bancos conectados
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
}
