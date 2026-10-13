import { parseCurrencyAmount } from '@/modules/finance/domain/parsers/parse-currency-amount';
import type { FixedEntryView } from '@/modules/finance/domain/models/fixed-entry';

export type FixedEntryFormValues = {
  description: string;
  amount: string;
  category: string;
  dueDay: string;
  launchThisMonth: boolean;
  applyToCurrentMonth: boolean;
};

export type FixedEntryFormPayload = {
  description: string;
  amount: number;
  category: string;
  dueDay: number;
};

export type ParsedFixedEntryForm = { payload: FixedEntryFormPayload } | { error: string };

export function initialFixedEntryFormValues(entry?: FixedEntryView): FixedEntryFormValues {
  return {
    description: entry?.description ?? '',
    amount: entry ? String(entry.amount).replace('.', ',') : '',
    category: entry?.category ?? '',
    dueDay: entry ? String(entry.dueDay) : '',
    launchThisMonth: true,
    applyToCurrentMonth: false,
  };
}

export function parseFixedEntryForm(values: FixedEntryFormValues): ParsedFixedEntryForm {
  const amount = parseCurrencyAmount(values.amount);
  const dueDay = Number(values.dueDay);
  if (!values.description.trim()) return { error: 'Informe a descrição.' };
  if (amount === null) return { error: 'Informe um valor maior que zero.' };
  if (!values.category.trim()) return { error: 'Informe a categoria.' };
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) return { error: 'O dia do vencimento vai de 1 a 31.' };
  return { payload: { description: values.description.trim(), amount, category: values.category.trim(), dueDay } };
}
