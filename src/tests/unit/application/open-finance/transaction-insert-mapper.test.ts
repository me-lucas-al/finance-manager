import { describe, it, expect } from 'vitest';
import { buildTransactionInsert } from '@/modules/open-finance/infrastructure/transaction-insert-mapper';
import type { NewTransaction } from '@/modules/open-finance/domain/repositories/transaction-repository';

const base: NewTransaction = {
  userId: 'user-1',
  pluggyTransactionId: null,
  accountId: null,
  bank: 'Manual',
  amount: 10,
  description: 'Café',
  occurredAt: '2026-10-01',
  category: 'Alimentação',
  categorySuggested: null,
  reason: null,
  status: 'categorized',
  source: 'manual',
  necessity: null,
  telegramQuestionMessageId: null,
};

describe('buildTransactionInsert credit card column', () => {
  it('does not send credit_card_id without a card, staying compatible with the old schema', () => {
    expect(buildTransactionInsert(base)).not.toHaveProperty('credit_card_id');
    expect(buildTransactionInsert({ ...base, creditCardId: null })).not.toHaveProperty('credit_card_id');
  });

  it('sends credit_card_id when a card is linked', () => {
    expect(buildTransactionInsert({ ...base, creditCardId: 'card-1' })).toHaveProperty('credit_card_id', 'card-1');
  });
});
