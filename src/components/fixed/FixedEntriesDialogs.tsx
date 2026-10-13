'use client';

import { createFixedEntryAction, deleteFixedEntryAction, updateFixedEntryAction } from '@/app/actions/fixed-entries';
import { FixedEntryDeleteDialog } from './FixedEntryDeleteDialog';
import { FixedEntryDialog, type FixedEntrySubmission } from './FixedEntryDialog';
import type { FixedEntryDialogState } from './useFixedEntryDialogs';
import { useFixedEntryActions } from './useFixedEntryActions';

type FixedEntriesDialogsProps = {
  dialog: FixedEntryDialogState | null;
  onClose: () => void;
};

export function FixedEntriesDialogs({ dialog, onClose }: FixedEntriesDialogsProps) {
  const { pending, error, run, clearError } = useFixedEntryActions();

  if (!dialog) return null;

  const close = () => {
    clearError();
    onClose();
  };

  const submit = ({ payload, options }: FixedEntrySubmission) => {
    if (dialog.type === 'create') {
      run(() => createFixedEntryAction({ kind: dialog.kind, ...payload, launchThisMonth: options.launchThisMonth }), close);
      return;
    }
    if (dialog.type === 'edit') {
      run(
        () => updateFixedEntryAction({ id: dialog.entry.id, ...payload, applyToCurrentMonth: options.applyToCurrentMonth }),
        close
      );
    }
  };

  if (dialog.type === 'delete') {
    return (
      <FixedEntryDeleteDialog
        entry={dialog.entry}
        pending={pending}
        error={error}
        onClose={close}
        onConfirm={(alsoDeleteCurrentMonth) =>
          run(() => deleteFixedEntryAction({ id: dialog.entry.id, alsoDeleteCurrentMonth }), close)
        }
      />
    );
  }

  const dialogKey = dialog.type === 'edit' ? dialog.entry.id : dialog.kind;
  return <FixedEntryDialog key={dialogKey} state={dialog} pending={pending} error={error} onSubmit={submit} onClose={close} />;
}
