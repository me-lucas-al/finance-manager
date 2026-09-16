const MONTH_ABBREVIATIONS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export function formatMonthLabel(month: string): string {
  const [, mon] = month.split('-').map(Number);
  const year = month.slice(2, 4);
  return `${MONTH_ABBREVIATIONS[mon - 1]}/${year}`;
}
