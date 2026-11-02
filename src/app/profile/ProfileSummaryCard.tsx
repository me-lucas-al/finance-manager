import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { userRepository } from '@/composition/users';
import { ProfileHeader } from '@/app/settings/ProfileHeader';
import { SignOutButton } from './SignOutButton';
import { UnavailableCard } from './UnavailableCard';

async function loadUser(userId: string) {
  try {
    return await userRepository.findById(userId);
  } catch (error) {
    console.error('Failed to load the profile summary:', error);
    return null;
  }
}

export async function ProfileSummaryCard({ userId }: { userId: string }) {
  const user = await loadUser(userId);
  if (!user) return <UnavailableCard title="Perfil" />;

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <ProfileHeader name={user.name} createdAt={user.createdAt.toISOString()} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 text-xs text-zinc-400">
            <p>{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/settings" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <Settings className="h-4 w-4" />
              Editar perfil e configurações
            </Link>
            <SignOutButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
