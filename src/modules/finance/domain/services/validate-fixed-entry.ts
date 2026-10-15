import { EntryValidationError } from '../models/entry-errors';
import type { FixedEntryChanges, NewFixedEntryInput } from '../models/fixed-entry';

const FIXED_ENTRY_KINDS = ['expense', 'income'];

function assertPositiveAmount(amount: number): void {
  if (!(Number.isFinite(amount) && amount > 0)) throw new EntryValidationError('Valor deve ser maior que zero');
}

function assertDueDay(dueDay: number): void {
  if (!(Number.isInteger(dueDay) && dueDay >= 1 && dueDay <= 31)) {
    throw new EntryValidationError('Dia de vencimento deve ficar entre 1 e 31');
  }
}

function assertFilled(value: string, label: string): void {
  if (value.trim() === '') throw new EntryValidationError(`${label} não pode ficar vazio`);
}

export function validateFixedEntryChanges(changes: FixedEntryChanges): void {
  if (Object.values(changes).every((value) => value === undefined)) {
    throw new EntryValidationError('Nenhuma alteração informada');
  }
  if (changes.amount !== undefined) assertPositiveAmount(changes.amount);
  if (changes.dueDay !== undefined) assertDueDay(changes.dueDay);
  if (changes.description !== undefined) assertFilled(changes.description, 'Descrição');
  if (changes.category !== undefined) assertFilled(changes.category, 'Categoria');
}

export function validateNewFixedEntry(input: NewFixedEntryInput): void {
  if (!FIXED_ENTRY_KINDS.includes(input.kind)) throw new EntryValidationError('Tipo deve ser despesa ou receita');
  assertPositiveAmount(input.amount);
  assertDueDay(input.dueDay);
  assertFilled(input.description, 'Descrição');
  assertFilled(input.category, 'Categoria');
}
