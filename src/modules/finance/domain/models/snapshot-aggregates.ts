import type { CategoryTotal, LedgerTotals } from '../services/summarize-ledger';

export type SnapshotAggregates = {
  current: LedgerTotals;
  previous: LedgerTotals;
  twoAgo: LedgerTotals;
  currentCategories: CategoryTotal[];
  previousCategories: CategoryTotal[];
  allTime: LedgerTotals;
};
