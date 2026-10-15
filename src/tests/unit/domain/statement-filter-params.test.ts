import { describe, it, expect } from 'vitest';
import { DEFAULT_STATEMENT_FILTERS } from '@/modules/finance/domain/models/statement-filters';
import { applyFiltersToParams, parseStatementFilters } from '@/modules/finance/domain/services/statement-filter-params';

describe('parseStatementFilters', () => {
  it('reads valid params', () => {
    expect(parseStatementFilters({ type: 'income', category: 'Salário', q: ' abc ' })).toEqual({
      type: 'income',
      category: 'Salário',
      query: 'abc',
    });
  });

  it('falls back to defaults for invalid or missing values', () => {
    expect(parseStatementFilters({ type: 'bogus' })).toEqual(DEFAULT_STATEMENT_FILTERS);
    expect(parseStatementFilters({})).toEqual(DEFAULT_STATEMENT_FILTERS);
  });

  it('uses the first value of repeated params and caps the search length', () => {
    expect(parseStatementFilters({ type: ['expense', 'income'] }).type).toBe('expense');
    expect(parseStatementFilters({ q: 'a'.repeat(500) }).query).toHaveLength(100);
  });
});

describe('applyFiltersToParams', () => {
  it('writes active filters and drops defaults without touching other params', () => {
    const params = new URLSearchParams('month=2026-03&type=income&q=old');
    const next = applyFiltersToParams(params, { type: 'all', category: 'Mercado', query: '' });
    expect(next.toString()).toBe('month=2026-03&category=Mercado');
  });

  it('round-trips through parseStatementFilters', () => {
    const filters = { type: 'expense' as const, category: 'Mercado & Casa', query: 'pão' };
    const params = applyFiltersToParams(new URLSearchParams(), filters);
    expect(parseStatementFilters(Object.fromEntries(params))).toEqual(filters);
  });
});
