import { classifyTransaction } from './classify-transaction';
import { pairInternalTransfers } from './pair-internal-transfers';
import type {
  ClassificationOptions,
  ClassifiedTransactionType,
  RawTransactionLike,
  SanitizedSummary,
  SanitizedTransaction,
} from './types';

const roundCents = (value: number): number => Math.round(value * 100) / 100;

const isCardPurchase = (tx: RawTransactionLike): boolean =>
  Boolean(tx.isCreditCard) && (tx.type === 'DEBIT' || Number(tx.amount) < 0);

function addToSummary(
  summary: SanitizedSummary,
  classification: ClassifiedTransactionType,
  amount: number,
  category: string,
): void {
  if (classification === 'INCOME') summary.totalIncome += amount;
  if (classification === 'EXPENSE') {
    summary.totalExpenses += amount;
    summary.categoryTotals[category] = (summary.categoryTotals[category] || 0) + amount;
  }
  if (classification === 'REFUND') {
    summary.totalExpenses = Math.max(0, summary.totalExpenses - amount);
    if (summary.categoryTotals[category]) {
      summary.categoryTotals[category] = Math.max(0, summary.categoryTotals[category] - amount);
    }
  }
}

export function sanitizeTransactions<T extends RawTransactionLike>(
  transactions: T[],
  options: ClassificationOptions = {},
): { sanitized: SanitizedTransaction<T>[]; summary: SanitizedSummary } {
  const hasCreditCardPurchases = options.hasCreditCardPurchases ?? transactions.some(isCardPurchase);
  const pairedTransfers = pairInternalTransfers(transactions);
  const summary: SanitizedSummary = { totalIncome: 0, totalExpenses: 0, categoryTotals: {} };

  const sanitized = transactions.map((tx, index): SanitizedTransaction<T> => {
    const classification = pairedTransfers.has(index)
      ? 'INTERNAL_TRANSFER'
      : classifyTransaction(tx, { hasCreditCardPurchases });
    const effectiveAmount = Math.abs(Number(tx.amount));
    addToSummary(summary, classification, effectiveAmount, tx.category || 'Outros');
    return { raw: tx, classification, effectiveAmount };
  });

  return {
    sanitized,
    summary: {
      totalIncome: roundCents(summary.totalIncome),
      totalExpenses: roundCents(summary.totalExpenses),
      categoryTotals: summary.categoryTotals,
    },
  };
}
