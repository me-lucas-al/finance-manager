'use client';

import { deleteEntryAction } from '@/app/actions/entries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { EditableEntry } from './entry-form-values';
import { useEntryAction } from './useEntryAction';

type DeleteEntryAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: EditableEntry;
};

export function DeleteEntryAlert({ open, onOpenChange, entry }: DeleteEntryAlertProps) {
  const action = useEntryAction(() => onOpenChange(false));

  function handleOpenChange(next: boolean) {
    action.clearError();
    onOpenChange(next);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{entry.description}&quot; será removido e os totais serão recalculados. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {action.error && (
          <p role="alert" className="text-sm text-red-400">
            {action.error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={action.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={action.isPending}
            onClick={() => void action.run(() => deleteEntryAction({ kind: entry.kind, id: entry.id }), 'Lançamento excluído')}
          >
            {action.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
