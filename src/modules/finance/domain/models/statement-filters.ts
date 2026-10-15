import type { LedgerKind } from './ledger-entry';

export const ALL_OPTION = 'all';
export const MAX_SEARCH_LENGTH = 100;

export type StatementTypeFilter = typeof ALL_OPTION | LedgerKind;

export type StatementFilters = {
  type: StatementTypeFilter;
  category: string;
  query: string;
};

export const DEFAULT_STATEMENT_FILTERS: StatementFilters = {
  type: ALL_OPTION,
  category: ALL_OPTION,
  query: '',
};
