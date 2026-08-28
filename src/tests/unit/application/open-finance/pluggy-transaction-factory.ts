import type { Transaction as PluggyTransaction } from 'pluggy-sdk';

export function makePluggyTransaction(overrides: Partial<PluggyTransaction> = {}): PluggyTransaction {
  return {
    id: 'txn-1',
    accountId: 'account-1',
    date: new Date('2026-08-10'),
    description: 'Supermercado',
    descriptionRaw: null,
    type: 'DEBIT',
    amount: -150.5,
    amountInAccountCurrency: null,
    balance: 4849.5,
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
