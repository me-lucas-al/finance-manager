import { useState } from 'react';
import type { FixedEntryKind, FixedEntryView } from '@/modules/finance/domain/models/fixed-entry';

export type FixedEntryDialogState =
  | { type: 'create'; kind: FixedEntryKind }
  | { type: 'edit'; entry: FixedEntryView }
  | { type: 'delete'; entry: FixedEntryView };

export function useFixedEntryDialogs() {
  const [dialog, setDialog] = useState<FixedEntryDialogState | null>(null);

  return {
    dialog,
    openCreate: (kind: FixedEntryKind) => setDialog({ type: 'create', kind }),
    openEdit: (entry: FixedEntryView) => setDialog({ type: 'edit', entry }),
    openDelete: (entry: FixedEntryView) => setDialog({ type: 'delete', entry }),
    close: () => setDialog(null),
  };
}
