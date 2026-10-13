const TIME_ZONE = 'America/Sao_Paulo';
const NOON_OFFSET = '-03:00';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function toLocalDateString(date: Date): string {
  return dateFormatter.format(date);
}

export function toMonthKey(date: Date): string {
  return toLocalDateString(date).slice(0, 7);
}

export function dateAtNoon(dateString: string): Date {
  return new Date(`${dateString}T12:00:00${NOON_OFFSET}`);
}

export function getCurrentMonth(): string {
  return toMonthKey(new Date());
}

export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split('-').map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
