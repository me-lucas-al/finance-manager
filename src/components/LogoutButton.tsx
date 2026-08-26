'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/actions/auth';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      <LogOut className="h-5 w-5" />
      <span className="sr-only">Sair</span>
    </Button>
  );
}
