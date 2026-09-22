import { describe, it, expect } from 'vitest';
import {
  classifyTransaction,
  sanitizeTransactions,
  type RawTransactionLike,
} from '@/lib/transaction-classifier';

describe('Transaction Classifier & Sanitizer', () => {
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

  describe('sanitizeTransactions', () => {
    it('eliminates double counting of credit card payments and internal transfers', () => {
      const transactions: RawTransactionLike[] = [
        // Real salary
        {
          id: '1',
          amount: 5000,
          type: 'CREDIT',
          date: '2026-09-05',
          description: 'Salario',
          category: 'Salary',
          isCreditCard: false,
          bank: 'itau',
        },
        // Internal transfer: Itaú -> Nubank
        {
          id: '2',
          amount: -1500,
          type: 'DEBIT',
          date: '2026-09-06',
          description: 'Pix Enviado',
          category: 'Transfers',
          isCreditCard: false,
          bank: 'itau',
        },
        {
          id: '3',
          amount: 1500,
          type: 'CREDIT',
          date: '2026-09-06',
          description: 'Pix Recebido',
          category: 'Transfers',
          isCreditCard: false,
          bank: 'nubank',
        },
        // Real card purchases
        {
          id: '4',
          amount: -300,
          type: 'DEBIT',
          date: '2026-09-10',
          description: 'Supermercado',
          category: 'Groceries',
          isCreditCard: true,
          bank: 'nubank',
        },
        {
          id: '5',
          amount: -150,
          type: 'DEBIT',
          date: '2026-09-11',
          description: 'Restaurante',
          category: 'Eating out',
          isCreditCard: true,
          bank: 'nubank',
        },
        // Credit card invoice payment (on bank account)
        {
          id: '6',
          amount: -450,
          type: 'DEBIT',
          date: '2026-09-20',
          description: 'Pagamento de fatura Nubank',
          category: 'Transfers',
          isCreditCard: false,
          bank: 'itau',
        },
        // Credit card invoice payment (on card account)
        {
          id: '7',
          amount: 450,
          type: 'CREDIT',
          date: '2026-09-20',
          description: 'Pagamento recebido',
          category: 'Credit card payment',
          isCreditCard: true,
          bank: 'nubank',
        },
        // Investment deposit
        {
          id: '8',
          amount: -1000,
          type: 'DEBIT',
          date: '2026-09-21',
          description: 'Aplicação Caixinha RDB',
          category: 'Investments',
          isCreditCard: false,
          bank: 'nubank',
        },
      ];

      const { summary } = sanitizeTransactions(transactions);

      // Without sanitization:
      // totalIncome would be 5000 + 1500 + 450 = 6950!
      // totalExpenses would be 1500 + 300 + 150 + 450 + 1000 = 3400!
      //
      // With our sanitization:
      // totalIncome must be exactly 5000 (salary only)
      // totalExpenses must be exactly 450 (300 + 150, card purchases only, no double counting)
      expect(summary.totalIncome).toBe(5000);
      expect(summary.totalExpenses).toBe(450);
      expect(summary.categoryTotals['Groceries']).toBe(300);
      expect(summary.categoryTotals['Eating out']).toBe(150);
    });
  });
});
