import { useState } from 'react';
import type { CreditCard } from '@/modules/finance/domain/models/credit-card';

export type CreditCardDialogState =
  | { type: 'create' }
  | { type: 'edit'; card: CreditCard }
  | { type: 'delete'; card: CreditCard };

export function useCreditCardDialogs() {
  const [dialog, setDialog] = useState<CreditCardDialogState | null>(null);

  return {
    dialog,
    openCreate: () => setDialog({ type: 'create' }),
    openEdit: (card: CreditCard) => setDialog({ type: 'edit', card }),
    openDelete: (card: CreditCard) => setDialog({ type: 'delete', card }),
    close: () => setDialog(null),
  };
}
