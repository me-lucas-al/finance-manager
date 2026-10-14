import { describe, expect, it } from 'vitest';
import type { PluggyTransactionLike } from '@/modules/pluggy-sync/domain/map-pluggy-transaction';
import { mapPluggyTransactions, type TransactionSource } from '@/modules/pluggy-sync/domain/map-pluggy-transactions';

const tx = (overrides: Partial<PluggyTransactionLike>): PluggyTransactionLike => ({
  id: 'tx',
  date: '2026-10-05',
  description: 'Mercado',
  type: 'DEBIT',
  amount: -50,
  category: 'Groceries',
  ...overrides,
});

const source = (transaction: PluggyTransactionLike, isCreditCard = false): TransactionSource<string> => ({
  tx: transaction,
  isCreditCard,
  origin: isCreditCard ? 'card' : 'bank',
});

describe('mapPluggyTransactions', () => {
  it('skips pending and foreign currency transactions', () => {
    const mapped = mapPluggyTransactions(
      [source(tx({ id: 'a', status: 'PENDING' })), source(tx({ id: 'b', currencyCode: 'USD' })), source(tx({ id: 'c' }))],
      false,
    );
    expect(mapped.map(({ entry }) => entry.externalId)).toEqual(['c']);
  });

  it('drops paired transfers between own accounts', () => {
    const out = tx({ id: 'out', description: 'Transferência enviada', category: 'Transfers', amount: -300 });
    const incoming = tx({ id: 'in', description: 'Transferência recebida', category: 'Transfers', type: 'CREDIT', amount: 300 });
    expect(mapPluggyTransactions([source(out), source(incoming)], false)).toEqual([]);
  });

  it('does not count the card bill paid from the bank when card purchases are tracked', () => {
    const bill = tx({ id: 'bill', description: 'Pagamento de fatura', category: 'Credit card payment', amount: -900 });
    expect(mapPluggyTransactions([source(bill)], true)).toEqual([]);
    expect(mapPluggyTransactions([source(bill)], false)).toHaveLength(1);
  });

  it('keeps the origin of each mapped entry', () => {
    const purchase = tx({ id: 'p', amount: -20 });
    const [mapped] = mapPluggyTransactions([source(purchase, true)], true);
    expect(mapped.origin).toBe('card');
    expect(mapped.entry).toMatchObject({ kind: 'expense', amount: 20 });
  });
});
