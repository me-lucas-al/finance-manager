import { ALL_OPTION, type StatementFilters } from '../models/statement-filters';
import type { LedgerEntry } from '../models/ledger-entry';
import { matchesTextSearch } from './match-text-search';

export function filterLedgerEntries(entries: LedgerEntry[], filters: StatementFilters): LedgerEntry[] {
  return entries.filter((entry) => {
    if (filters.type !== ALL_OPTION && entry.kind !== filters.type) return false;
    if (filters.category !== ALL_OPTION && entry.category !== filters.category) return false;
    return matchesTextSearch(entry, filters.query);
  });
}

export function categoriesOf(entries: LedgerEntry[]): string[] {
  return Array.from(new Set(entries.map((entry) => entry.category))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
