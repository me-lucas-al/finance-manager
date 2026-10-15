'use client';

import { useState } from 'react';
import { listCardOptionsAction } from '@/app/actions/entry-cards';
import type { CardOption } from '@/modules/finance/domain/models/credit-card';

export function useEntryCardOptions(): { cardOptions: CardOption[]; loadCardOptions: () => void } {
  const [cardOptions, setCardOptions] = useState<CardOption[]>([]);

  function loadCardOptions() {
    listCardOptionsAction()
      .then(setCardOptions)
      .catch(() => undefined);
  }

  return { cardOptions, loadCardOptions };
}
