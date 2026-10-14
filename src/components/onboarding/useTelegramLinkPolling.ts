'use client';

import { useEffect, useEffectEvent } from 'react';
import { getTelegramLinkStatus } from '@/app/actions/onboarding';

const POLL_INTERVAL_MS = 3000;
const CODE_LIFETIME_MS = 15 * 60 * 1000;

type PollingOptions = {
  code: string | null;
  linked: boolean;
  onLinked: () => void;
  onExpired: () => void;
};

export function useTelegramLinkPolling({ code, linked, onLinked, onExpired }: PollingOptions): void {
  const handleLinked = useEffectEvent(onLinked);
  const handleExpired = useEffectEvent(onExpired);

  useEffect(() => {
    if (!code || linked) return;
    const expiryTimer = setTimeout(handleExpired, CODE_LIFETIME_MS);
    const pollTimer = setInterval(async () => {
      try {
        const status = await getTelegramLinkStatus();
        if (status.linked) handleLinked();
      } catch {
        return;
      }
    }, POLL_INTERVAL_MS);
    return () => {
      clearInterval(pollTimer);
      clearTimeout(expiryTimer);
    };
  }, [code, linked]);
}
