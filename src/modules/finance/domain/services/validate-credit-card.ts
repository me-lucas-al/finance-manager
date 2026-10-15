import { EntryValidationError } from '../models/entry-errors';
import type { CreditCardChanges, NewCreditCardInput } from '../models/credit-card';

const LAST_DIGITS_PATTERN = /^\d{4}$/;

function assertName(name: string): void {
  if (name.trim() === '') throw new EntryValidationError('Nome do cartão não pode ficar vazio');
}

function assertLimit(limit: number): void {
  if (!(Number.isFinite(limit) && limit >= 0)) throw new EntryValidationError('Limite deve ser zero ou maior');
}

function assertLastDigits(digits: string | null): void {
  if (digits !== null && !LAST_DIGITS_PATTERN.test(digits)) {
    throw new EntryValidationError('Final do cartão deve ter 4 dígitos');
  }
}

function assertClosingDay(day: number | null): void {
  if (day !== null && !(Number.isInteger(day) && day >= 1 && day <= 31)) {
    throw new EntryValidationError('Dia de fechamento deve ficar entre 1 e 31');
  }
}

function validateFields(fields: CreditCardChanges): void {
  if (fields.name !== undefined) assertName(fields.name);
  if (fields.creditLimit !== undefined) assertLimit(fields.creditLimit);
  if (fields.lastDigits !== undefined) assertLastDigits(fields.lastDigits);
  if (fields.closingDay !== undefined) assertClosingDay(fields.closingDay);
}

export function validateNewCreditCard(input: NewCreditCardInput): void {
  validateFields(input);
}

export function validateCreditCardChanges(changes: CreditCardChanges): void {
  if (Object.values(changes).every((value) => value === undefined)) {
    throw new EntryValidationError('Nenhuma alteração informada');
  }
  validateFields(changes);
}
