import type { LedgerEntry } from '../models/ledger-entry';
import type { Portfolio } from '../models/portfolio';
import { investmentEntriesOf } from './investment-entries';

const roundCents = (value: number): number => Math.round(value * 100) / 100;

export function computeInvestmentTotal(entries: LedgerEntry[], portfolio: Portfolio): number {
  const holdingsTotal = portfolio.holdings.reduce((sum, holding) => sum + holding.balance, 0);
  const contributionsTotal = investmentEntriesOf(entries, portfolio).reduce((sum, entry) => sum + entry.amount, 0);
  return roundCents(holdingsTotal + contributionsTotal);
}
