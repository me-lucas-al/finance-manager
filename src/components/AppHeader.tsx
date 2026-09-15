import { Navigation } from '@/components/Navigation';
import { Logo } from '@/components/Logo';
import { HeaderControls } from '@/components/HeaderControls';
import { auth } from '@/auth';

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#09090b]/95 backdrop-blur supports-[backdrop-filter]:bg-[#09090b]/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6 md:gap-10">
          <Logo />
          <Navigation />
        </div>
        <HeaderControls
          user={{
            name: session?.user?.name,
            email: session?.user?.email,
            image: session?.user?.image,
          }}
        />
      </div>
    </header>
  );
}
