import type { DateRange } from '../models/date-range';
import type { LedgerEntry } from '../models/ledger-entry';
import type { StatementFilters } from '../models/statement-filters';
import { filterLedgerEntries } from './filter-ledger-entries';
import { entriesInRange } from './summarize-ledger';

export function selectStatementEntries(entries: LedgerEntry[], range: DateRange, filters: StatementFilters): LedgerEntry[] {
  return filterLedgerEntries(entriesInRange(entries, range), filters);
}
