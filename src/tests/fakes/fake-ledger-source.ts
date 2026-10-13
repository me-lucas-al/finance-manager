import type { LedgerSource } from '@/modules/finance/domain/ports/ledger-source';
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
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const sampleLedgerSource: LedgerSource = {
  findAllTransactions: async () => [
    transaction('e1', '2026-02-10', 1200.1, 'Mercado'),
    transaction('e2', '2026-03-02', 300.2, null),
    transaction('e3', '2026-03-05', 99.9, 'Mercado'),
  ],
  findAllIncomes: async () => [
    income('i1', '2026-02-05T15:00:00Z', '5000.00'),
    income('i2', '2026-03-01T02:00:00Z', '1000.00'),
    income('i3', '2026-03-05T15:00:00Z', '5000.00'),
  ],
  findAllInvestments: async () => [investment('v1', '2026-03-03T15:00:00Z', '800.00')],
};
