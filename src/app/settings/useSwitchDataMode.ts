'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { switchDataMode } from '@/app/actions/onboarding';
import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';

const CONFIRMATION_WORD = 'APAGAR';

export function useSwitchDataMode(targetMode: DataMode) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmed = confirmation.trim().toUpperCase() === CONFIRMATION_WORD;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await switchDataMode(targetMode, confirmation);
        router.push('/onboarding');
      } catch (err) {
        console.error('Failed to switch data mode', err);
        setError('Não foi possível trocar a fonte de dados. Tente novamente.');
      }
    });
  };

  return { confirmation, setConfirmation, confirmed, error, isPending, submit };
}
