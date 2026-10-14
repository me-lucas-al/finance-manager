import type { TransactionNecessity } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';
import { amountToMaskedInput } from './currency-mask';

export type EntryFormValues = {
  type: EntryType;
  amount: string;
  description: string;
  category: string;
  date: string;
  necessity: TransactionNecessity | '';
};

export type EditableEntry = {
  kind: EntryType;
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  necessity?: TransactionNecessity;
};

export function createEmptyEntryValues(type: EntryType, today: string): EntryFormValues {
  return { type, amount: '', description: '', category: '', date: today, necessity: '' };
}

export function valuesFromEntry(entry: EditableEntry): EntryFormValues {
  return {
    type: entry.kind,
    amount: amountToMaskedInput(entry.amount),
    description: entry.description,
    category: entry.category,
    date: entry.date,
    necessity: entry.necessity ?? '',
  };
}
