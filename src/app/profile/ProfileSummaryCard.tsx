import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { userRepository } from '@/composition/users';
import { dataModeStore } from '@/composition/onboarding';
import { ProfileHeader } from '@/app/settings/ProfileHeader';
import { DATA_MODE_LABELS } from '@/app/settings/data-mode-labels';
import { UnavailableCard } from './UnavailableCard';

async function loadSummary(userId: string) {
  try {
    const [user, { dataMode }] = await Promise.all([userRepository.findById(userId), dataModeStore.getState(userId)]);
    return user ? { user, dataMode } : null;
  } catch (error) {
    console.error('Failed to load the profile summary:', error);
    return null;
  }
}

export async function ProfileSummaryCard({ userId }: { userId: string }) {
  const summary = await loadSummary(userId);
  if (!summary) return <UnavailableCard title="Perfil" />;
  const { user, dataMode } = summary;

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <ProfileHeader name={user.name} createdAt={user.createdAt.toISOString()} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 text-xs text-zinc-400">
            <p>{user.email}</p>
            {dataMode ? <p>Fonte de dados: {DATA_MODE_LABELS[dataMode].name}</p> : null}
          </div>
          <Link href="/settings" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <Settings className="h-4 w-4" />
            Editar perfil e configurações
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
