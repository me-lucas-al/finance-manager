'use client';

import { useState, useTransition } from 'react';
import { chooseDataMode } from '@/app/actions/onboarding';
import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';

export function useChooseMode(currentMode: DataMode | null, onChosen: (mode: DataMode) => void) {
  const [selected, setSelected] = useState<DataMode | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const needsWarning = currentMode !== null && selected !== null && selected !== currentMode;
  const canSubmit = selected !== null && (!needsWarning || acknowledged);

  const submit = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      try {
        await chooseDataMode(selected);
        onChosen(selected);
      } catch (err) {
        console.error('Failed to choose data mode', err);
        setError('Não foi possível salvar sua escolha. Tente novamente.');
      }
    });
  };

  return { selected, setSelected, acknowledged, setAcknowledged, error, isPending, needsWarning, canSubmit, submit };
}
