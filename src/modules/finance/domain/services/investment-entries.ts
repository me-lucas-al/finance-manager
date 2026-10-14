import type { LedgerEntry } from '../models/ledger-entry';
import type { Portfolio } from '../models/portfolio';
import { entriesOfKind } from './summarize-ledger';

export function investmentEntriesOf(entries: LedgerEntry[], portfolio: Portfolio): LedgerEntry[] {
  if (portfolio.holdings.length > 0) return [];
  return entriesOfKind(entries, 'investment');
}
