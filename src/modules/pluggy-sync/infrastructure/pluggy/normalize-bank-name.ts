const BANK_ALIASES: [alias: string, bank: string][] = [
  ['itau', 'itau'],
  ['click', 'itau'],
  ['nubank', 'nubank'],
  ['nu pagamentos', 'nubank'],
  ['inter', 'inter'],
  ['mercado pago', 'mercadopago'],
  ['mercadopago', 'mercadopago'],
  ['mercado livre', 'mercadopago'],
];

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function normalizeBankName(name: string): string {
  const normalized = stripAccents(name).toLowerCase();
  const match = BANK_ALIASES.find(([alias]) => normalized.includes(alias));
  return match?.[1] ?? name;
}
