import type { LedgerSource } from '@/modules/finance/domain/ports/ledger-source';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { expenseToEntry, incomeToEntry, investmentToEntry, sortNewestFirst } from '@/modules/finance/domain/services/ledger-mapper';
import type { Transaction } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { Income } from '@/modules/finance/domain/repositories/income-repository';
import type { Investment } from '@/modules/finance/domain/repositories/investment-repository';

export const transaction = (id: string, occurredAt: string, amount: number, category: string | null): Transaction => ({
  id,
  userId: 'u',
  pluggyTransactionId: null,
  accountId: null,
  bank: 'Manual',
  amount,
  description: id,
  occurredAt,
  category,
  categorySuggested: null,
  reason: null,
  status: 'categorized',
  source: 'manual',
  necessity: null,
  telegramQuestionMessageId: null,
  fixedEntryId: null,
  fixedReferenceMonth: null,
  creditCardId: null,
  periodId: null,
  referenceMonth: null,
  createdAt: '2026-01-01T00:00:00Z',
});

export const income = (id: string, receivedAt: string, amount: string): Income => ({
  id,
  userId: 'u',
  periodId: 'p',
  description: id,
  amount,
  category: 'Salário',
  receivedAt: new Date(receivedAt),
  externalId: null,
  fixedEntryId: null,
  fixedReferenceMonth: null,
  referenceMonth: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const investment = (id: string, date: string, amount: string): Investment => ({
  id,
  userId: 'u',
  periodId: 'p',
  description: id,
  amount,
  type: 'CDB',
  date: new Date(date),
  externalId: null,
  referenceMonth: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const sampleTransactions = [
  transaction('e1', '2026-02-10', 1200.1, 'Mercado'),
  transaction('e2', '2026-03-02', 300.2, null),
  transaction('e3', '2026-03-05', 99.9, 'Mercado'),
];
const sampleIncomes = [
  income('i1', '2026-02-05T15:00:00Z', '5000.00'),
  income('i2', '2026-03-01T02:00:00Z', '1000.00'),
  income('i3', '2026-03-05T15:00:00Z', '5000.00'),
];
const sampleInvestments = [investment('v1', '2026-03-03T15:00:00Z', '800.00')];

export const sampleLedgerSource: LedgerSource = {
  findAllTransactions: async () => sampleTransactions,
  findAllIncomes: async () => sampleIncomes,
  findAllInvestments: async () => sampleInvestments,
};

export const sampleLedgerEntries: LedgerEntry[] = sortNewestFirst([
  ...sampleTransactions.map(expenseToEntry),
  ...sampleIncomes.map(incomeToEntry),
  ...sampleInvestments.map(investmentToEntry),
]);
