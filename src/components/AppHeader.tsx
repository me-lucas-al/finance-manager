import { Navigation } from '@/components/Navigation';
import { Logo } from '@/components/Logo';
import { HeaderControls } from '@/components/HeaderControls';
import { auth } from '@/auth';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function AppHeader() {
  const session = await auth();
  let userName = session?.user?.name;
  let userEmail = session?.user?.email;
  const userImage = session?.user?.image;

  if (!userEmail) {
    try {
      const effectiveId = await getEffectiveUserId();
      const { data } = await getSupabaseAdmin()
        .from('users')
        .select('name, email')
        .eq('id', effectiveId)
        .maybeSingle();
      if (data) {
        userName = data.name || userName || 'Lucas Almeida';
        userEmail = data.email || userEmail || 'lucasalsouza2006@gmail.com';
      }
    } catch {
      userName = userName || 'Lucas Almeida';
      userEmail = userEmail || 'lucasalsouza2006@gmail.com';
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#09090b]/95 backdrop-blur supports-[backdrop-filter]:bg-[#09090b]/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6 md:gap-10">
          <Logo />
          <Navigation />
        </div>
        <HeaderControls
          user={{
            name: userName || 'Lucas Almeida',
            email: userEmail || 'lucasalsouza2006@gmail.com',
            image: userImage,
          }}
        />
      </div>
    </header>
  );
}
