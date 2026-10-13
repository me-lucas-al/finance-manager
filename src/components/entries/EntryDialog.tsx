'use client';

import { createEntryAction, updateEntryAction } from '@/app/actions/entries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toLocalDateString } from '@/lib/month';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';
import { toCreateInput, toUpdateInput } from './entry-form-payload';
import { createEmptyEntryValues, valuesFromEntry, type EditableEntry, type EntryFormValues } from './entry-form-values';
import { EntryForm } from './EntryForm';
import { useEntryAction } from './useEntryAction';
import { useEntryCategories } from './useEntryCategories';

type EntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: EditableEntry;
  initialType?: EntryType;
};

export function EntryDialog({ open, onOpenChange, entry, initialType = 'expense' }: EntryDialogProps) {
  const categoriesByType = useEntryCategories(open);
  const action = useEntryAction(() => onOpenChange(false));
  const isEditing = entry !== undefined;
  const initialValues = entry ? valuesFromEntry(entry) : createEmptyEntryValues(initialType, toLocalDateString(new Date()));

  function handleOpenChange(next: boolean) {
    action.clearError();
    onOpenChange(next);
  }

  function handleSubmit(values: EntryFormValues) {
    if (entry) {
      void action.run(() => updateEntryAction(toUpdateInput(entry, values)), 'Lançamento atualizado');
      return;
    }
    void action.run(() => createEntryAction(toCreateInput(values)), 'Lançamento salvo');
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar lançamento' : 'Novo lançamento'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os dados do lançamento.' : 'Registre uma despesa, receita ou investimento.'}
          </DialogDescription>
        </DialogHeader>
        <EntryForm
          mode={isEditing ? 'edit' : 'create'}
          initialValues={initialValues}
          categoriesByType={categoriesByType}
          isPending={action.isPending}
          error={action.error}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
