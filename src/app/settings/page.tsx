import { Suspense } from 'react';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { SectionSkeleton } from '@/components/shared/SectionSkeleton';
import { IntegrationsSection } from './IntegrationsSection';
import { NotificationsSection } from './NotificationsSection';
import { ProfileCard } from './ProfileCard';
import { RulesCard } from './RulesCard';
import { SecurityCard } from './SecurityCard';

export default async function SettingsPage() {
  const userId = await requireUserId();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Meu Perfil & Configurações</h1>
          <p className="text-xs text-zinc-400 mt-1">Gerencie suas informações pessoais e preferências</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<SectionSkeleton height="h-64 md:col-span-2" />}>
            <ProfileCard userId={userId} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <RulesCard />
          </Suspense>
          <SecurityCard />
          <Suspense fallback={<SectionSkeleton height="h-48 md:col-span-2" />}>
            <NotificationsSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton height="h-40" />}>
            <IntegrationsSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
