import { parseCurrencyAmount } from './parse-currency-amount';

export type EntryType = 'expense' | 'income' | 'investment';

export type ParsedEntry = {
  type: EntryType;
  category: string;
  description: string;
  amount: number;
};

const EXPENSE_SYNONYMS = new Set(['saida', 'saída', 'gasto', 'despesa', 'debito', 'débito']);
const INCOME_SYNONYMS = new Set(['entrada', 'receita', 'ganho', 'credito', 'crédito']);
const INVESTMENT_SYNONYMS = new Set(['investimento', 'aporte', 'invest']);

function resolveType(rawType: string): EntryType | null {
  const norm = rawType.toLowerCase().trim();
  if (EXPENSE_SYNONYMS.has(norm)) return 'expense';
  if (INCOME_SYNONYMS.has(norm)) return 'income';
  if (INVESTMENT_SYNONYMS.has(norm)) return 'investment';
  return null;
}

export function parseEntryMessage(text: string): ParsedEntry | null {
  const parts = text.split('|').map((p) => p.trim());
  if (parts.length !== 4) return null;

  const [rawType, rawCategory, rawDescription, rawAmount] = parts;
  const type = resolveType(rawType);
  if (!type) return null;
  if (!rawCategory || !rawDescription) return null;

  const amount = parseCurrencyAmount(rawAmount);
  if (!amount) return null;

  return {
    type,
    category: rawCategory,
    description: rawDescription,
    amount,
  };
}
