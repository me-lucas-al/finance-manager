import { describe, it, expect } from 'vitest';
import { mapPluggyTransaction } from '@/modules/pluggy-sync/domain/map-pluggy-transaction';

const base = { id: 'tx-1', date: '2026-10-05', description: 'Mercado', category: 'Groceries' };

describe('mapPluggyTransaction', () => {
  it('maps bank debits to expenses using the absolute amount', () => {
    const entry = mapPluggyTransaction({ ...base, type: 'DEBIT', amount: -50 }, { isCreditCard: false });

    expect(entry).toMatchObject({ kind: 'expense', externalId: 'tx-1', amount: 50, category: 'Groceries' });
  });

  it('maps bank credits to incomes', () => {
    const entry = mapPluggyTransaction(
      { ...base, description: 'Salario empresa', type: 'CREDIT', amount: 3000, category: 'Salary' },
      { isCreditCard: false },
    );

    expect(entry).toMatchObject({ kind: 'income', amount: 3000, category: 'Salary' });
  });

  it('maps investment contributions to investments', () => {
    const entry = mapPluggyTransaction(
      { ...base, description: 'Aplicação CDB', type: 'DEBIT', amount: -200, category: null },
      { isCreditCard: false },
    );

    expect(entry).toMatchObject({ kind: 'investment', amount: 200 });
  });

  it('ignores investment redemptions', () => {
    const entry = mapPluggyTransaction(
      { ...base, description: 'Resgate CDB', type: 'CREDIT', amount: 200, category: null },
      { isCreditCard: false },
    );

    expect(entry).toBeNull();
  });

  it('ignores credit-card bill payments to avoid double counting', () => {
    const entry = mapPluggyTransaction(
      { ...base, description: 'Pagamento de fatura Nubank', type: 'DEBIT', amount: -900, category: null },
      { isCreditCard: false },
    );

    expect(entry).toBeNull();
  });

  it('ignores transfers between own accounts', () => {
    const entry = mapPluggyTransaction(
      { ...base, description: 'Transferência mesma titularidade', type: 'DEBIT', amount: -100, category: null },
      { isCreditCard: false },
    );

    expect(entry).toBeNull();
  });

  it('keeps credit-card purchases as expenses', () => {
    const entry = mapPluggyTransaction({ ...base, type: 'DEBIT', amount: -80 }, { isCreditCard: true });

    expect(entry).toMatchObject({ kind: 'expense', amount: 80 });
  });
});
