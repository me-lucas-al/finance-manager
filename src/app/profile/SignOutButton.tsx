'use client';

import { useTransition } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/actions/auth';

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={() => startTransition(() => signOut())}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sair da conta
    </Button>
  );
}
