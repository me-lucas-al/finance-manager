import { toLocalDateString } from '@/lib/month';
import type { Transaction } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { Income } from '../repositories/income-repository';
import type { Investment } from '../repositories/investment-repository';
import type { LedgerEntry } from '../models/ledger-entry';

export const UNCATEGORIZED = 'Outros';
const MANUAL_ACCOUNT = 'Manual';

export function expenseToEntry(transaction: Transaction): LedgerEntry {
  return {
    id: transaction.id,
    kind: 'expense',
    date: transaction.occurredAt.slice(0, 10),
    description: transaction.description,
    category: transaction.category || transaction.categorySuggested || UNCATEGORIZED,
    amount: Number(transaction.amount),
    account: transaction.bank || MANUAL_ACCOUNT,
    ...(transaction.necessity && { necessity: transaction.necessity }),
    ...(transaction.source !== 'manual' && { imported: true as const }),
    ...(transaction.creditCardId && { creditCardId: transaction.creditCardId }),
    fixed: Boolean(transaction.fixedReferenceMonth),
  };
}

export function incomeToEntry(income: Income): LedgerEntry {
  return {
    id: income.id,
    kind: 'income',
    date: toLocalDateString(income.receivedAt),
    description: income.description,
    category: income.category || UNCATEGORIZED,
    amount: Number(income.amount),
    account: MANUAL_ACCOUNT,
    ...(income.externalId && { imported: true as const }),
    fixed: Boolean(income.fixedReferenceMonth),
  };
}

export function investmentToEntry(investment: Investment): LedgerEntry {
  return {
    id: investment.id,
    kind: 'investment',
    date: toLocalDateString(investment.date),
    description: investment.description,
    category: investment.type || UNCATEGORIZED,
    amount: Number(investment.amount),
    account: MANUAL_ACCOUNT,
    fixed: false,
  };
}

export function sortNewestFirst(entries: LedgerEntry[]): LedgerEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
