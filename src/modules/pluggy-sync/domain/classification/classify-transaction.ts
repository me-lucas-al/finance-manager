import * as pattern from './patterns';
import { areSamePerson } from './same-person';
import type { ClassificationOptions, ClassifiedTransactionType, RawTransactionLike } from './types';

function classifyCardTransaction(isCredit: boolean, description: string): ClassifiedTransactionType {
  if (!isCredit) return 'EXPENSE';
  return pattern.REFUND.test(description) ? 'REFUND' : 'CREDIT_CARD_PAYMENT';
}

function classifyBankDebit(
  description: string,
  category: string,
  options: ClassificationOptions,
): ClassifiedTransactionType {
  const isBillPayment =
    pattern.CREDIT_CARD_PAYMENT_CATEGORY.test(category) || pattern.CREDIT_CARD_PAYMENT_DESCRIPTION.test(description);
  return isBillPayment && options.hasCreditCardPurchases !== false ? 'CREDIT_CARD_PAYMENT' : 'EXPENSE';
}

export function classifyTransaction(
  tx: RawTransactionLike,
  options: ClassificationOptions = {},
): ClassifiedTransactionType {
  const amount = Number(tx.amount);
  const isCredit = tx.type === 'CREDIT' || amount > 0;
  const description = tx.description || '';
  const category = tx.category || '';

  if (tx.isCreditCard) return classifyCardTransaction(isCredit, description);
  if (areSamePerson(tx.paymentData?.payer, tx.paymentData?.receiver)) return 'INTERNAL_TRANSFER';
  if (pattern.INTERNAL_TRANSFER_DESCRIPTION.test(description)) return 'INTERNAL_TRANSFER';
  if (pattern.INVESTMENT_CATEGORY.test(category) || pattern.INVESTMENT_DESCRIPTION.test(description)) {
    return 'INVESTMENT';
  }
  if (!isCredit) return classifyBankDebit(description, category, options);
  return pattern.REFUND.test(description) ? 'REFUND' : 'INCOME';
}
