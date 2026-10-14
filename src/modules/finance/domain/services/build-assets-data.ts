import type { LedgerEntry } from '../models/ledger-entry';
import type { LiveAssetItem, LiveInvestmentsData } from '../models/financial-types';
import { EMPTY_PORTFOLIO, type Portfolio } from '../models/portfolio';
import { computeInvestmentTotal } from './compute-investment-total';
import { investmentEntriesOf } from './investment-entries';

const percentageOf = (amount: number, total: number): number => (total > 0 ? Math.round((amount / total) * 100) : 0);

export function buildAssetsData(entries: LedgerEntry[], portfolio: Portfolio = EMPTY_PORTFOLIO): LiveInvestmentsData {
  const total = computeInvestmentTotal(entries, portfolio);

  const manualAssets: LiveAssetItem[] = investmentEntriesOf(entries, portfolio).map((investment) => ({
    id: investment.id,
    name: investment.description,
    bank: 'manual',
    bankName: 'Manual',
    type: investment.category,
    amount: investment.amount,
    percentage: percentageOf(investment.amount, total),
  }));

  const syncedAssets: LiveAssetItem[] = portfolio.holdings.map((holding) => ({
    id: holding.id,
    name: holding.name,
    bank: 'pluggy',
    bankName: 'Open Finance',
    type: holding.type,
    amount: holding.balance,
    percentage: percentageOf(holding.balance, total),
  }));

  return { total, assets: [...syncedAssets, ...manualAssets] };
}
