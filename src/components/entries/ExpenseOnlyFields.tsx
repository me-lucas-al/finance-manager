'use client';

import type { CardOption } from '@/modules/finance/domain/models/credit-card';
import { CreditCardField } from './CreditCardField';
import type { EntryFormValues } from './entry-form-values';
import { NecessityField } from './NecessityField';

type ExpenseOnlyFieldsProps = {
  values: EntryFormValues;
  cardOptions: CardOption[];
  onChange: <Field extends keyof EntryFormValues>(field: Field, value: EntryFormValues[Field]) => void;
};

export function ExpenseOnlyFields({ values, cardOptions, onChange }: ExpenseOnlyFieldsProps) {
  if (values.type !== 'expense') return null;
  return (
    <>
      <NecessityField value={values.necessity} onChange={(necessity) => onChange('necessity', necessity)} />
      {cardOptions.length > 0 && (
        <CreditCardField value={values.creditCardId} options={cardOptions} onChange={(card) => onChange('creditCardId', card)} />
      )}
    </>
  );
}
