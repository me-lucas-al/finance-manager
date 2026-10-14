import { describe, it, expect } from 'vitest';
import { classifyTransaction, type RawTransactionLike } from '@/modules/pluggy-sync/domain/classification';

describe('Investment classification', () => {
  it('classifies investment deposit or withdrawal as INVESTMENT', () => {
    const deposit: RawTransactionLike = {
      amount: -1000,
      type: 'DEBIT',
      date: '2026-09-05',
      description: 'Aplicação Caixinha Reserva',
      category: 'Investments',
      isCreditCard: false,
    };
    const withdrawal: RawTransactionLike = {
      amount: 500,
      type: 'CREDIT',
      date: '2026-09-20',
      description: 'Resgate CDB DI',
      category: 'Investments',
      isCreditCard: false,
    };
    expect(classifyTransaction(deposit)).toBe('INVESTMENT');
    expect(classifyTransaction(withdrawal)).toBe('INVESTMENT');

    const mpReserved: RawTransactionLike = {
      amount: -1097.21,
      type: 'DEBIT',
      date: '2026-09-02',
      description: 'Dinheiro reservado Cofrinho Mercado Livre',
      category: 'Transfers',
      isCreditCard: false,
    };
    const mpWithdrawn: RawTransactionLike = {
      amount: 550,
      type: 'CREDIT',
      date: '2026-09-05',
      description: 'Dinheiro retirado Cofrinho Mercado Livre',
      category: 'Transfers',
      isCreditCard: false,
    };
    expect(classifyTransaction(mpReserved)).toBe('INVESTMENT');
    expect(classifyTransaction(mpWithdrawn)).toBe('INVESTMENT');
  });
});
