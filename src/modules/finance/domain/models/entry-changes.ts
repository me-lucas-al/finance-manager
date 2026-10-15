import type { TransactionNecessity } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { EntryType } from '../parsers/parse-entry-message';
import { assertValidEntryDate } from '../parsers/parse-entry-date';
import { EntryValidationError } from './entry-errors';
import { isEntryNecessity } from './entry-necessity';

export type EntryRef = { kind: EntryType; id: string };

export type EntryChanges = {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  necessity?: TransactionNecessity;
};

export function validateEntryChanges(changes: EntryChanges): void {
  const provided = Object.values(changes).filter((value) => value !== undefined);
  if (provided.length === 0) throw new EntryValidationError('Nenhuma alteração informada');
  if (changes.amount !== undefined && !(Number.isFinite(changes.amount) && changes.amount > 0)) {
    throw new EntryValidationError('Valor deve ser maior que zero');
  }
  if (changes.description !== undefined && changes.description.trim() === '') {
    throw new EntryValidationError('Descrição não pode ficar vazia');
  }
  if (changes.necessity !== undefined && !isEntryNecessity(changes.necessity)) {
    throw new EntryValidationError('Necessidade inválida');
  }
  if (changes.date !== undefined) assertValidEntryDate(changes.date);
}
