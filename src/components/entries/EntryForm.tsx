'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CategoriesByType } from './entry-category-options';
import { hasErrors, validateEntryValues, type EntryFormErrors } from './entry-form-validation';
import type { EntryFormValues } from './entry-form-values';
import { CategoryField } from './CategoryField';
import { CurrencyField } from './CurrencyField';
import { EntryTypeTabs } from './EntryTypeTabs';
import { FormField } from './FormField';
import { NecessityField } from './NecessityField';

export type EntryFormProps = {
  mode: 'create' | 'edit';
  initialValues: EntryFormValues;
  categoriesByType: CategoriesByType;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: EntryFormValues) => void;
  onCancel: () => void;
};

export function EntryForm({ mode, initialValues, categoriesByType, isPending, error, onSubmit, onCancel }: EntryFormProps) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<EntryFormErrors>({});
  const isEditing = mode === 'edit';

  function changeField<Field extends keyof EntryFormValues>(field: Field, value: EntryFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function changeType(type: EntryFormValues['type']) {
    setValues((current) => ({ ...current, type, category: '', necessity: '' }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateEntryValues(values);
    setFieldErrors(found);
    if (!hasErrors(found)) onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {!isEditing && <EntryTypeTabs value={values.type} onChange={changeType} />}
      <CurrencyField value={values.amount} error={fieldErrors.amount} onChange={(amount) => changeField('amount', amount)} />
      <FormField label="Descrição" htmlFor="entry-description" error={fieldErrors.description}>
        <Input
          id="entry-description"
          autoComplete="off"
          value={values.description}
          aria-invalid={fieldErrors.description !== undefined}
          onChange={(event) => changeField('description', event.target.value)}
          className="h-9"
        />
      </FormField>
      <CategoryField
        type={values.type}
        value={values.category}
        options={categoriesByType[values.type]}
        error={fieldErrors.category}
        onChange={(category) => changeField('category', category)}
      />
      <FormField label="Data" htmlFor="entry-date" error={fieldErrors.date}>
        <Input
          id="entry-date"
          type="date"
          value={values.date}
          aria-invalid={fieldErrors.date !== undefined}
          onChange={(event) => changeField('date', event.target.value)}
          className="h-9"
        />
      </FormField>
      {values.type === 'expense' && (
        <NecessityField
          value={values.necessity}
          emptyLabel={isEditing ? 'Manter atual' : 'Automática'}
          onChange={(necessity) => changeField('necessity', necessity)}
        />
      )}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar lançamento'}
        </Button>
      </div>
    </form>
  );
}
