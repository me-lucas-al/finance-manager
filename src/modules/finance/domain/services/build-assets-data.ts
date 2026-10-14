import type { LedgerEntry } from '../models/ledger-entry';
import type { LiveInvestmentsData } from '../models/financial-types';
import { entriesOfKind, totalsOf } from './summarize-ledger';

export function buildAssetsData(entries: LedgerEntry[]): LiveInvestmentsData {
  const investments = entriesOfKind(entries, 'investment');
  const total = totalsOf(investments).investments;

  return {
    total,
    assets: investments.map((investment) => ({
      id: investment.id,
      name: investment.description,
      bank: 'manual',
      bankName: 'Manual',
      type: investment.category,
      amount: investment.amount,
      percentage: total > 0 ? Math.round((investment.amount / total) * 100) : 0,
    })),
  };
}
