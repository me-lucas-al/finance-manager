const pad = (value: number): string => String(value).padStart(2, '0');

export function toPeriodDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatIsoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function formatPeriodRange(startDate: string, endDate: string): string {
  return `${formatIsoDate(startDate)} a ${formatIsoDate(endDate)}`;
}
