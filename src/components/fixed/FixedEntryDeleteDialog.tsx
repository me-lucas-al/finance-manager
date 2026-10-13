'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { FixedEntryView } from '@/modules/finance/domain/models/fixed-entry';

type FixedEntryDeleteDialogProps = {
  entry: FixedEntryView;
  pending: boolean;
  error: string | null;
  onConfirm: (alsoDeleteCurrentMonth: boolean) => void;
  onClose: () => void;
};

export function FixedEntryDeleteDialog({ entry, pending, error, onConfirm, onClose }: FixedEntryDeleteDialogProps) {
  const [alsoDeleteCurrentMonth, setAlsoDeleteCurrentMonth] = useState(false);

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[#111216] border-zinc-800 text-zinc-100">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {entry.description}?</AlertDialogTitle>
          <AlertDialogDescription>
            O fixo deixa de ser lançado. Os lançamentos que já foram gerados continuam no Fluxo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {entry.status === 'launched' && (
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={alsoDeleteCurrentMonth} onChange={(event) => setAlsoDeleteCurrentMonth(event.target.checked)} />
            Excluir também o lançamento deste mês
          </label>
        )}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" disabled={pending} onClick={() => onConfirm(alsoDeleteCurrentMonth)}>
            {pending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
