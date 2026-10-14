'use client';

import { createEntryAction, updateEntryAction } from '@/app/actions/entries';
import { toLocalDateString } from '@/lib/month';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';
import { toCreateInput, toUpdateInput } from './entry-form-payload';
import { createEmptyEntryValues, valuesFromEntry, type EditableEntry, type EntryFormValues } from './entry-form-values';
import { EntryForm } from './EntryForm';
import { useEntryAction } from './useEntryAction';
import { useEntryCategories } from './useEntryCategories';

type EntryDialogFormProps = {
  entry?: EditableEntry;
  initialType: EntryType;
  onClose: () => void;
};

export function EntryDialogForm({ entry, initialType, onClose }: EntryDialogFormProps) {
  const categoriesByType = useEntryCategories();
  const action = useEntryAction(onClose);

  function handleSubmit(values: EntryFormValues) {
    if (entry) {
      void action.run(() => updateEntryAction(toUpdateInput(entry, values)), 'Lançamento atualizado');
      return;
    }
    void action.run(() => createEntryAction(toCreateInput(values)), 'Lançamento salvo');
  }

  return (
    <EntryForm
      mode={entry ? 'edit' : 'create'}
      initialValues={entry ? valuesFromEntry(entry) : createEmptyEntryValues(initialType, toLocalDateString(new Date()))}
      categoriesByType={categoriesByType}
      isPending={action.isPending}
      error={action.error}
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  );
}
