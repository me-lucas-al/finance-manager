import { Suspense } from 'react';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { SectionSkeleton } from '@/components/shared/SectionSkeleton';
import { ConnectionsCard } from './ConnectionsCard';
import { PeriodSummaryCard } from './PeriodSummaryCard';
import { ProfileSummaryCard } from './ProfileSummaryCard';

export default async function ProfilePage() {
  const userId = await requireUserId();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Meu Perfil</h1>
          <p className="text-xs text-zinc-400 mt-1">Seus dados, conexões e o resumo do período atual</p>
        </div>

        <Suspense fallback={<SectionSkeleton height="h-40" />}>
          <ProfileSummaryCard userId={userId} />
        </Suspense>
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<SectionSkeleton height="h-64" />}>
            <ConnectionsCard />
          </Suspense>
          <Suspense fallback={<SectionSkeleton height="h-64" />}>
            <PeriodSummaryCard userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
