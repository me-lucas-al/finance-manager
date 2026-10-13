const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidEntryDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function assertValidEntryDate(value: string): void {
  if (!isValidEntryDate(value)) throw new Error(`Invalid entry date: ${value}`);
}
