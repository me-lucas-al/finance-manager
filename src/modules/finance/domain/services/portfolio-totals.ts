import type { Portfolio } from '../models/portfolio';
import { bankAccountsOf } from './account-kinds';
import type { LedgerTotals } from './summarize-ledger';

const roundCents = (value: number): number => Math.round(value * 100) / 100;

export function bankBalanceFromTotals(allTime: LedgerTotals, portfolio: Portfolio): number {
  const bankAccounts = bankAccountsOf(portfolio.accounts);
  if (bankAccounts.length > 0) return roundCents(bankAccounts.reduce((sum, account) => sum + account.balance, 0));
  return roundCents(portfolio.initialBalance + allTime.balance);
}

export function investedTotalFromTotals(allTime: LedgerTotals, portfolio: Portfolio): number {
  const holdingsTotal = portfolio.holdings.reduce((sum, holding) => sum + holding.balance, 0);
  const contributions = portfolio.holdings.length > 0 ? 0 : allTime.investments;
  return roundCents(holdingsTotal + contributions);
}
