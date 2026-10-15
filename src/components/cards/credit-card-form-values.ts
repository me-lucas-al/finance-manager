import { parseCurrencyAmount } from '@/modules/finance/domain/parsers/parse-currency-amount';
import type { CreditCard } from '@/modules/finance/domain/models/credit-card';

export type CreditCardFormValues = {
  name: string;
  lastDigits: string;
  limit: string;
  closingDay: string;
};

export type CreditCardFormPayload = {
  name: string;
  lastDigits: string | null;
  creditLimit: number;
  closingDay: number | null;
};

export type ParsedCreditCardForm = { payload: CreditCardFormPayload } | { error: string };

export function initialCreditCardFormValues(card?: CreditCard): CreditCardFormValues {
  return {
    name: card?.name ?? '',
    lastDigits: card?.lastDigits ?? '',
    limit: card && card.creditLimit > 0 ? String(card.creditLimit).replace('.', ',') : '',
    closingDay: card?.closingDay ? String(card.closingDay) : '',
  };
}

function parseLimit(raw: string): number | null {
  if (raw.trim() === '') return 0;
  return parseCurrencyAmount(raw);
}

function parseClosingDay(raw: string): number | null | undefined {
  if (raw.trim() === '') return null;
  const day = Number(raw);
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : undefined;
}

export function parseCreditCardForm(values: CreditCardFormValues): ParsedCreditCardForm {
  const lastDigits = values.lastDigits.trim();
  const creditLimit = parseLimit(values.limit);
  const closingDay = parseClosingDay(values.closingDay);
  if (!values.name.trim()) return { error: 'Informe o nome do cartão.' };
  if (lastDigits !== '' && !/^\d{4}$/.test(lastDigits)) return { error: 'O final do cartão tem 4 dígitos.' };
  if (creditLimit === null) return { error: 'Informe um limite válido ou deixe em branco.' };
  if (closingDay === undefined) return { error: 'O dia de fechamento vai de 1 a 31.' };
  return {
    payload: { name: values.name.trim(), lastDigits: lastDigits === '' ? null : lastDigits, creditLimit, closingDay },
  };
}
