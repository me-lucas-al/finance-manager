export type ClassifiedTransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'CREDIT_CARD_PAYMENT'
  | 'INTERNAL_TRANSFER'
  | 'INVESTMENT'
  | 'REFUND';

type PaymentParty = {
  name?: string;
  documentNumber?: { value?: string; type?: string };
};

export interface RawTransactionLike {
  id?: string;
  amount: number;
  type?: 'DEBIT' | 'CREDIT' | string;
  date: Date | string;
  description?: string | null;
  category?: string | null;
  isCreditCard?: boolean;
  bank?: string;
  accountId?: string;
  paymentData?: { payer?: PaymentParty; receiver?: PaymentParty } | null;
}

export interface SanitizedTransaction<T extends RawTransactionLike = RawTransactionLike> {
  raw: T;
  classification: ClassifiedTransactionType;
  effectiveAmount: number;
}

export interface SanitizedSummary {
  totalIncome: number;
  totalExpenses: number;
  categoryTotals: Record<string, number>;
}

export type ClassificationOptions = { hasCreditCardPurchases?: boolean };
