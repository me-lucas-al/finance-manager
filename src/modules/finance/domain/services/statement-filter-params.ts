import {
  ALL_OPTION,
  DEFAULT_STATEMENT_FILTERS,
  MAX_SEARCH_LENGTH,
  type StatementFilters,
  type StatementTypeFilter,
} from '../models/statement-filters';

export type RawParams = Record<string, string | string[] | undefined>;

const TYPE_VALUES: readonly string[] = ['income', 'expense', 'investment'];

function firstValue(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ?? '';
}

function parseType(raw: string): StatementTypeFilter {
  return TYPE_VALUES.includes(raw) ? (raw as StatementTypeFilter) : DEFAULT_STATEMENT_FILTERS.type;
}

function setOrDelete(params: URLSearchParams, key: string, value: string): void {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function parseStatementFilters(params: RawParams): StatementFilters {
  return {
    type: parseType(firstValue(params.type)),
    category: firstValue(params.category) || DEFAULT_STATEMENT_FILTERS.category,
    query: firstValue(params.q).slice(0, MAX_SEARCH_LENGTH),
  };
}

export function applyFiltersToParams(params: URLSearchParams, filters: StatementFilters): URLSearchParams {
  const next = new URLSearchParams(params);
  setOrDelete(next, 'type', filters.type === ALL_OPTION ? '' : filters.type);
  setOrDelete(next, 'category', filters.category === ALL_OPTION ? '' : filters.category);
  setOrDelete(next, 'q', filters.query);
  return next;
}
