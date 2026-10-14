import type { LedgerEntry } from '../models/ledger-entry';
import type { Portfolio } from '../models/portfolio';
import { bankAccountsOf } from './account-kinds';
import { totalsOf } from './summarize-ledger';

const roundCents = (value: number): number => Math.round(value * 100) / 100;

export function computeBankBalance(entries: LedgerEntry[], portfolio: Portfolio): number {
  const bankAccounts = bankAccountsOf(portfolio.accounts);
  if (bankAccounts.length > 0) {
    return roundCents(bankAccounts.reduce((sum, account) => sum + account.balance, 0));
  }
  return roundCents(portfolio.initialBalance + totalsOf(entries).balance);
}
