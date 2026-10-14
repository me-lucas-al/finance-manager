import { describe, it, expect } from 'vitest';
import {
  classifyTransaction,
  type RawTransactionLike,
} from '@/modules/pluggy-sync/domain/classification';

describe('Transaction Classifier', () => {
  describe('classifyTransaction', () => {
    it('classifies credit card purchases as EXPENSE', () => {
      const tx: RawTransactionLike = {
        amount: -120.5,
        type: 'DEBIT',
        date: '2026-09-10',
        description: 'Supermercado Pao de Acucar',
        category: 'Groceries',
        isCreditCard: true,
      };
      expect(classifyTransaction(tx)).toBe('EXPENSE');
    });

    it('classifies credit card invoice payment on card account as CREDIT_CARD_PAYMENT and not INCOME', () => {
      const tx: RawTransactionLike = {
        amount: 2500,
        type: 'CREDIT',
        date: '2026-09-15',
        description: 'Pagamento recebido',
        category: 'Credit card payment',
        isCreditCard: true,
      };
      expect(classifyTransaction(tx)).toBe('CREDIT_CARD_PAYMENT');
    });

    it('classifies credit card refund as REFUND', () => {
      const tx: RawTransactionLike = {
        amount: 89.9,
        type: 'CREDIT',
        date: '2026-09-16',
        description: 'Estorno compra Mercado Livre',
        category: 'Shopping',
        isCreditCard: true,
      };
      expect(classifyTransaction(tx)).toBe('REFUND');
    });

    it('classifies bank account credit card invoice payment as CREDIT_CARD_PAYMENT when card transactions exist', () => {
      const tx: RawTransactionLike = {
        amount: -2500,
        type: 'DEBIT',
        date: '2026-09-15',
        description: 'Pagamento de fatura Nubank',
        category: 'Transfers',
        isCreditCard: false,
      };
      expect(classifyTransaction(tx, { hasCreditCardPurchases: true })).toBe('CREDIT_CARD_PAYMENT');
    });

    it('classifies internal transfer with same CPF as INTERNAL_TRANSFER', () => {
      const tx: RawTransactionLike = {
        amount: 1500,
        type: 'CREDIT',
        date: '2026-09-12',
        description: 'Pix recebido',
        category: 'Transfers',
        isCreditCard: false,
        paymentData: {
          payer: { name: 'Lucas Silva', documentNumber: { value: '123.456.789-00' } },
          receiver: { name: 'Lucas Silva', documentNumber: { value: '12345678900' } },
        },
      };
      expect(classifyTransaction(tx)).toBe('INTERNAL_TRANSFER');
    });

    it('classifies real salary as INCOME', () => {
      const tx: RawTransactionLike = {
        amount: 5000,
        type: 'CREDIT',
        date: '2026-09-05',
        description: 'TED Salario Empresa ABC',
        category: 'Salary',
        isCreditCard: false,
      };
      expect(classifyTransaction(tx)).toBe('INCOME');
    });

    it('classifies regular utility bill as EXPENSE', () => {
      const tx: RawTransactionLike = {
        amount: -250,
        type: 'DEBIT',
        date: '2026-09-10',
        description: 'Pagamento boleto Enel Energia',
        category: 'Utilities',
        isCreditCard: false,
      };
      expect(classifyTransaction(tx)).toBe('EXPENSE');
    });
  });
});
