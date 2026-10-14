import { describe, expect, it } from 'vitest';
import { matchesTextSearch } from '@/modules/finance/domain/services/match-text-search';

const entry = { description: 'Mercado Livre', category: 'Compras', account: 'Nubank' };

describe('matchesTextSearch', () => {
  it('matches the description, category or account ignoring case', () => {
    expect(matchesTextSearch(entry, 'mercado')).toBe(true);
    expect(matchesTextSearch(entry, 'COMPRAS')).toBe(true);
    expect(matchesTextSearch(entry, 'nubank')).toBe(true);
  });

  it('matches everything when the query is blank', () => {
    expect(matchesTextSearch(entry, '   ')).toBe(true);
  });

  it('rejects entries without the text in any field', () => {
    expect(matchesTextSearch(entry, 'uber')).toBe(false);
  });
});
