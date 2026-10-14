'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/app/actions/onboarding';

export function useFinishOnboarding() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const finish = () =>
    startTransition(async () => {
      const result = await completeOnboarding();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push('/');
      router.refresh();
    });

  return { finish, error, isPending };
}
