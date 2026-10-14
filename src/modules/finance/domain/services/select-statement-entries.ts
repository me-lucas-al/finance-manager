import type { LedgerEntry } from '../models/ledger-entry';
import type { StatementFilters } from '../models/statement-filters';
import { filterLedgerEntries } from './filter-ledger-entries';
import { entriesInMonth } from './summarize-ledger';

export function selectStatementEntries(entries: LedgerEntry[], month: string, filters: StatementFilters): LedgerEntry[] {
  return filterLedgerEntries(entriesInMonth(entries, month), filters);
}
