const MAX_DIGITS = 12;
const THOUSANDS_BOUNDARY = /\B(?=(\d{3})+(?!\d))/g;

export function maskCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, MAX_DIGITS).replace(/^0+/, '');
  if (digits === '') return '';
  const padded = digits.padStart(3, '0');
  const integerPart = padded.slice(0, -2).replace(THOUSANDS_BOUNDARY, '.');
  return `${integerPart},${padded.slice(-2)}`;
}

export function amountToMaskedInput(amount: number): string {
  return maskCurrencyInput(String(Math.round(amount * 100)));
}
