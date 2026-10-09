export function parseCurrencyAmount(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/^r\$\s*/i, '')
    .trim();

  if (!cleaned) return null;

  let normalized: string;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    normalized = cleaned.replace(',', '.');
  } else {
    normalized = cleaned;
  }

  const num = Number(normalized);
  if (isNaN(num) || num <= 0) return null;
  return Math.round(num * 100) / 100;
}
