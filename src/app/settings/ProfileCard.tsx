import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { userRepository } from '@/composition/users';
import { ProfileForm } from './ProfileForm';

export async function ProfileCard({ userId }: { userId: string }) {
  const user = await userRepository.findById(userId);

  return (
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
          initialName={user?.name ?? ''}
          email={user?.email ?? ''}
          createdAt={user?.createdAt.toISOString()}
        />
      </CardContent>
    </Card>
  );
}
