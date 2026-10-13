'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EntryActionResult } from '@/modules/finance/application/services/entry-action-service';
import { notifyEntrySaved } from './entry-toasts';

const CONNECTION_FAILURE_MESSAGE = 'Não foi possível salvar. Verifique sua conexão e tente novamente.';

export function useEntryAction(onSuccess: () => void) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(perform: () => Promise<EntryActionResult>, successTitle: string) {
    setIsPending(true);
    setError(null);
    const result = await perform().catch((): EntryActionResult => ({ ok: false, error: CONNECTION_FAILURE_MESSAGE }));
    setIsPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    notifyEntrySaved(successTitle, result.alerts);
    router.refresh();
    onSuccess();
  }

  return { isPending, error, run, clearError: () => setError(null) };
}
