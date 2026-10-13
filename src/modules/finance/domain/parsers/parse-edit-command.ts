import type { EntryChanges } from '../models/entry-changes';
import { parseCurrencyAmount } from './parse-currency-amount';
import { parseEditDate } from './parse-edit-date';

export const EDIT_USAGE_MESSAGE = `✏️ Para corrigir o último lançamento:
• /editar valor 45,90
• /editar descricao almoço com a equipe
• /editar categoria Mercado
• /editar data 2026-03-10 (ou 10/03)`;

export type ParsedEditCommand = { ok: true; changes: EntryChanges } | { ok: false; message: string };

const FIELD_ALIASES: Record<string, 'amount' | 'description' | 'category' | 'date'> = {
  valor: 'amount',
  descricao: 'description',
  desc: 'description',
  categoria: 'category',
  cat: 'category',
  data: 'date',
};

function normalizeField(rawField: string): string {
  return rawField.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function failure(message: string): ParsedEditCommand {
  return { ok: false, message };
}

export function parseEditCommand(argumentsText: string, today: string): ParsedEditCommand {
  const [rawField = '', ...rest] = argumentsText.trim().split(/\s+/);
  const field = FIELD_ALIASES[normalizeField(rawField)];
  const value = rest.join(' ').trim();
  if (!field || value === '') return failure(EDIT_USAGE_MESSAGE);

  if (field === 'amount') {
    const amount = parseCurrencyAmount(value);
    return amount === null ? failure('Valor inválido. Exemplo: /editar valor 45,90') : { ok: true, changes: { amount } };
  }
  if (field === 'date') {
    const date = parseEditDate(value, today);
    return date === null ? failure('Data inválida. Use AAAA-MM-DD ou DD/MM.') : { ok: true, changes: { date } };
  }
  return { ok: true, changes: field === 'description' ? { description: value } : { category: value } };
}
