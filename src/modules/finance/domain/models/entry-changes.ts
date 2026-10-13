import type { EntryType } from '../parsers/parse-entry-message';
import { assertValidEntryDate } from '../parsers/parse-entry-date';

export type EntryRef = { kind: EntryType; id: string };

export type EntryChanges = {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
};

export class EntryNotFoundError extends Error {
  constructor() {
    super('Lançamento não encontrado');
    this.name = 'EntryNotFoundError';
  }
}

export function validateEntryChanges(changes: EntryChanges): void {
  const provided = Object.values(changes).filter((value) => value !== undefined);
  if (provided.length === 0) throw new Error('Nenhuma alteração informada');
  if (changes.amount !== undefined && !(Number.isFinite(changes.amount) && changes.amount > 0)) {
    throw new Error('Valor deve ser maior que zero');
  }
  if (changes.description !== undefined && changes.description.trim() === '') {
    throw new Error('Descrição não pode ficar vazia');
  }
  if (changes.date !== undefined) assertValidEntryDate(changes.date);
}
