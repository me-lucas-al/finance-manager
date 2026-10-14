import type { RawTransactionLike } from '@/modules/pluggy-sync/domain/classification';

const transaction = (
  id: string,
  amount: number,
  date: string,
  description: string,
  category: string,
  isCreditCard: boolean,
  bank: string
): RawTransactionLike => ({
  id,
  amount,
  type: amount < 0 ? 'DEBIT' : 'CREDIT',
  date,
  description,
  category,
  isCreditCard,
  bank,
});

export const mixedBankTransactions: RawTransactionLike[] = [
  transaction('1', 5000, '2026-09-05', 'Salario', 'Salary', false, 'itau'),
  transaction('2', -1500, '2026-09-06', 'Pix Enviado', 'Transfers', false, 'itau'),
  transaction('3', 1500, '2026-09-06', 'Pix Recebido', 'Transfers', false, 'nubank'),
  transaction('4', -300, '2026-09-10', 'Supermercado', 'Groceries', true, 'nubank'),
  transaction('5', -150, '2026-09-11', 'Restaurante', 'Eating out', true, 'nubank'),
  transaction('6', -450, '2026-09-20', 'Pagamento de fatura Nubank', 'Transfers', false, 'itau'),
  transaction('7', 450, '2026-09-20', 'Pagamento recebido', 'Credit card payment', true, 'nubank'),
  transaction('8', -1000, '2026-09-21', 'Aplicação Caixinha RDB', 'Investments', false, 'nubank'),
];
