import { KNOWN_BANK_NAMES } from '@/lib/bank-names';
import type { LiveOverviewData } from '../models/financial-types';
import type { Portfolio } from '../models/portfolio';
import { bankAccountsOf } from './account-kinds';

type BankAccounts = LiveOverviewData['bankAccounts'];

const bankLabel = (bank: string): string => KNOWN_BANK_NAMES[bank] ?? bank;

export function buildBankAccounts(portfolio: Portfolio, bankTotal: number): BankAccounts {
  const reported = bankAccountsOf(portfolio.accounts);
  if (reported.length === 0) {
    return [{ id: 'primary', bank: 'manual', name: 'Saldo Disponível', countText: 'Principal', amount: bankTotal }];
  }
  return reported.map((account) => ({
    id: account.id,
    bank: account.bank,
    name: bankLabel(account.bank),
    countText: account.accountType === 'SAVINGS_ACCOUNT' ? 'Poupança' : 'Conta corrente',
    amount: account.balance,
  }));
}
