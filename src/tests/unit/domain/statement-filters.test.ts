import { describe, it, expect } from 'vitest';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { DEFAULT_STATEMENT_FILTERS } from '@/modules/finance/domain/models/statement-filters';
import { categoriesOf, filterLedgerEntries } from '@/modules/finance/domain/services/filter-ledger-entries';

const entry = (overrides: Partial<LedgerEntry>): LedgerEntry => ({
  id: 'e',
  kind: 'expense',
  date: '2026-03-10',
  description: 'Padaria',
  category: 'Mercado',
  amount: 10,
  account: 'Manual',
  fixed: false,
  ...overrides,
});

const ledger = [
  entry({ id: '1', description: 'Padaria Central' }),
  entry({ id: '2', kind: 'income', description: 'Salário', category: 'Salário' }),
  entry({ id: '3', kind: 'investment', description: 'CDB', category: 'Renda Fixa' }),
  entry({ id: '4', description: 'Uber', category: 'Transporte', account: 'Nubank' }),
];

const idsOf = (entries: LedgerEntry[]) => entries.map((item) => item.id);

describe('filterLedgerEntries', () => {
  it('keeps everything with the default filters', () => {
    expect(idsOf(filterLedgerEntries(ledger, DEFAULT_STATEMENT_FILTERS))).toEqual(['1', '2', '3', '4']);
  });

  it('filters by type', () => {
    const filters = { ...DEFAULT_STATEMENT_FILTERS, type: 'income' as const };
    expect(idsOf(filterLedgerEntries(ledger, filters))).toEqual(['2']);
  });

  it('filters by exact category', () => {
    const filters = { ...DEFAULT_STATEMENT_FILTERS, category: 'Transporte' };
    expect(idsOf(filterLedgerEntries(ledger, filters))).toEqual(['4']);
  });

  it('searches description, category and account ignoring case', () => {
    const search = (query: string) => idsOf(filterLedgerEntries(ledger, { ...DEFAULT_STATEMENT_FILTERS, query }));
    expect(search('  PADARIA ')).toEqual(['1']);
    expect(search('renda')).toEqual(['3']);
    expect(search('nubank')).toEqual(['4']);
  });

  it('combines every filter', () => {
    const filters = { type: 'expense' as const, category: 'Mercado', query: 'central' };
    expect(idsOf(filterLedgerEntries(ledger, filters))).toEqual(['1']);
  });
});

describe('categoriesOf', () => {
  it('lists distinct categories alphabetically', () => {
    expect(categoriesOf(ledger)).toEqual(['Mercado', 'Renda Fixa', 'Salário', 'Transporte']);
  });
});
