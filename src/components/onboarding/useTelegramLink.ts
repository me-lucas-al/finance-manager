'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { generateTelegramLinkCode, getTelegramLinkStatus } from '@/app/actions/onboarding';

const POLL_INTERVAL_MS = 3000;
const CODE_LIFETIME_MS = 15 * 60 * 1000;

export function useTelegramLink(initiallyLinked: boolean, onLinked?: () => void) {
  const [linked, setLinked] = useState(initiallyLinked);
  const [code, setCode] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onLinkedRef = useRef(onLinked);
  useEffect(() => {
    onLinkedRef.current = onLinked;
  }, [onLinked]);

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

  useEffect(() => {
    if (!code || linked) return;
    const expiryTimer = setTimeout(() => setExpired(true), CODE_LIFETIME_MS);
    const pollTimer = setInterval(async () => {
      try {
        const status = await getTelegramLinkStatus();
        if (!status.linked) return;
        setLinked(true);
        onLinkedRef.current?.();
      } catch {
        return;
      }
    }, POLL_INTERVAL_MS);
    return () => {
      clearInterval(pollTimer);
      clearTimeout(expiryTimer);
    };
  }, [code, linked]);

  return { linked, code, botUsername, expired, error, isPending, generate };
}
