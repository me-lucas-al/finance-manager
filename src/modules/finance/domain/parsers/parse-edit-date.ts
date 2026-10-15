import { isValidEntryDate } from './parse-entry-date';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MONTH_YEAR = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/;

function pad(value: string): string {
  return value.padStart(2, '0');
}

export function parseEditDate(raw: string, today: string): string | null {
  const text = raw.trim();
  if (ISO_DATE.test(text)) return isValidEntryDate(text) ? text : null;
  const match = DAY_MONTH_YEAR.exec(text);
  if (!match) return null;
  const [, day, month, year] = match;
  const candidate = `${year ?? today.slice(0, 4)}-${pad(month)}-${pad(day)}`;
  return isValidEntryDate(candidate) ? candidate : null;
}
