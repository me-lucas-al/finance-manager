import { parseCurrencyAmount } from '@/modules/finance/domain/parsers/parse-currency-amount';
import { isValidEntryDate } from '@/modules/finance/domain/parsers/parse-entry-date';
import type { EntryFormValues } from './entry-form-values';

export type EntryFormField = 'amount' | 'description' | 'category' | 'date';
export type EntryFormErrors = Partial<Record<EntryFormField, string>>;

export function validateEntryValues(values: EntryFormValues): EntryFormErrors {
  const errors: EntryFormErrors = {};
  if (parseCurrencyAmount(values.amount) === null) errors.amount = 'Informe um valor maior que zero';
  if (values.description.trim() === '') errors.description = 'Informe a descrição';
  if (values.category.trim() === '') errors.category = 'Informe a categoria';
  if (!isValidEntryDate(values.date)) errors.date = 'Informe uma data válida';
  return errors;
}

export function hasErrors(errors: EntryFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
