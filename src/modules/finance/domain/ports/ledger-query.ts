import type { LedgerEntry, LedgerKind } from '../models/ledger-entry';
import type { CategoryTotal, LedgerTotals } from '../services/summarize-ledger';

export type LedgerScope = { periodId?: string; manualOnly: boolean };

export type LedgerSearch = LedgerScope & {
  kind?: LedgerKind;
  category?: string;
  text?: string;
  limit: number;
};

export interface LedgerQuery {
  totals(userId: string, scope: LedgerScope): Promise<LedgerTotals>;
  totalsByCategory(userId: string, kind: LedgerKind, scope: LedgerScope): Promise<CategoryTotal[]>;
  search(userId: string, filter: LedgerSearch): Promise<LedgerEntry[]>;
}
