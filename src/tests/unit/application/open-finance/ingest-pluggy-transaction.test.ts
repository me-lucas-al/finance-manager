import { describe, it, expect } from 'vitest';
import type { Transaction as PluggyTransaction } from 'pluggy-sdk';
import { ingestPluggyTransaction } from '../../../../modules/open-finance/application/use-cases/ingest-pluggy-transaction';

function creditTransaction(overrides: Partial<PluggyTransaction> = {}): PluggyTransaction {
  return {
    id: 'txn-1',
    accountId: 'account-1',
    date: new Date('2026-08-10'),
    description: 'Salário',
    descriptionRaw: null,
    type: 'CREDIT',
    amount: 5000,
    amountInAccountCurrency: null,
    balance: 5000,
    currencyCode: 'BRL',
    category: null,
    creditCardMetadata: null,
    categoryId: null,
    operationType: null,
    operationTypeAdditionalInfo: null,
    providerId: null,
    createdAt: new Date('2026-08-10'),
    updatedAt: new Date('2026-08-10'),
    ...overrides,
  };
}

describe('ingestPluggyTransaction', () => {
  it('never stores CREDIT movements (incoming money is not spending)', async () => {
    const result = await ingestPluggyTransaction('user-1', 'item-1', 'account-1', creditTransaction());
    expect(result).toBeNull();
  });
});
