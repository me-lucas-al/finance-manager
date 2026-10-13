'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { FixedEntryActionResult } from '@/app/actions/run-fixed-entry-action';

export function useFixedEntryActions() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<FixedEntryActionResult>, onDone?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone?.();
      router.refresh();
    });
  };

  return { pending, error, run, clearError: () => setError(null) };
}
