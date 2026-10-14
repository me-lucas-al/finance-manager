import type { FakeTransactionRepository } from './fake-transaction-repository';

export const seedManualExpense = (transactionRepo: FakeTransactionRepository) =>
  transactionRepo.create({
    userId: 'user-1',
    pluggyTransactionId: null,
    accountId: null,
    bank: 'Manual',
    amount: 50,
    description: 'Almoço',
    occurredAt: '2026-03-01',
    category: 'Alimentação',
    categorySuggested: null,
    reason: null,
    status: 'categorized',
    source: 'manual',
    necessity: 'importante',
    telegramQuestionMessageId: null,
  });
