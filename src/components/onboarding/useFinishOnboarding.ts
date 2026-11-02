'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/app/actions/onboarding';

const FINISH_FAILURE_MESSAGE = 'Não foi possível concluir a configuração. Tente novamente.';

export function useFinishOnboarding() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const finish = () =>
    startTransition(async () => {
      try {
        await completeOnboarding();
        router.push('/');
        router.refresh();
      } catch (err) {
        console.error('Failed to complete onboarding', err);
        setError(FINISH_FAILURE_MESSAGE);
      }
    });

  return { finish, error, isPending };
}
