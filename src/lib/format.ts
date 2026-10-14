const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

const MAX_INITIALS = 2;

export function toInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, MAX_INITIALS)
    .join('')
    .toUpperCase();
}
