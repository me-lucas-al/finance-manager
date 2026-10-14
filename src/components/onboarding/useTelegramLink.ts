'use client';

import { useCallback, useState, useTransition } from 'react';
import { generateTelegramLinkCode } from '@/app/actions/onboarding';
import { useTelegramLinkPolling } from './useTelegramLinkPolling';

export function useTelegramLink(initiallyLinked: boolean, onLinked?: () => void) {
  const [linked, setLinked] = useState(initiallyLinked);
  const [code, setCode] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const generate = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateTelegramLinkCode();
        setCode(result.code);
        setExpired(false);
        setBotUsername(result.botUsername);
      } catch (err) {
        console.error('Failed to generate Telegram code', err);
        setError('Não foi possível gerar o código. Tente novamente.');
      }
    });
  }, []);

  useTelegramLinkPolling({
    code,
    linked,
    onLinked: () => {
      setLinked(true);
      onLinked?.();
    },
    onExpired: () => setExpired(true),
  });

  return { linked, code, botUsername, expired, error, isPending, generate };
}
