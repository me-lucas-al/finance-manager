import { EntryValidationError } from '../models/entry-errors';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidEntryDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isValidMonthKey(value: string): boolean {
  return MONTH_PATTERN.test(value);
}

export function assertValidEntryDate(value: string): void {
  if (!isValidEntryDate(value)) throw new EntryValidationError(`Invalid entry date: ${value}`);
}
