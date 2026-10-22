import { translateCategory } from './translate-category';
import { classifyTransaction, type ClassifiedTransactionType, type RawTransactionLike } from './classification';

export type PluggyTransactionLike = {
  id: string;
  date: Date | string;
  description: string;
  type: string;
  amount: number;
  category: string | null;
  status?: string | null;
  currencyCode?: string | null;
  paymentData?: RawTransactionLike['paymentData'];
};

export type PluggyLedgerEntry =
  | { kind: 'income'; externalId: string; amount: number; description: string; category: string; date: Date }
  | { kind: 'investment'; externalId: string; amount: number; description: string; type: string; date: Date }
  | { kind: 'expense'; externalId: string; amount: number; description: string; category: string; date: Date };

export type MappingContext = { isCreditCard: boolean; hasCreditCardPurchases?: boolean };

export function entryFromClassification(
  tx: PluggyTransactionLike,
  classification: ClassifiedTransactionType,
): PluggyLedgerEntry | null {
  const base = { externalId: tx.id, amount: Math.abs(tx.amount), description: tx.description, date: new Date(tx.date) };
  const category = translateCategory(tx.category);

  if (classification === 'INCOME') return { kind: 'income', ...base, category };
  if (classification === 'EXPENSE') return { kind: 'expense', ...base, category };
  const isOutflow = tx.type === 'DEBIT' || tx.amount < 0;
  if (classification === 'INVESTMENT' && isOutflow) return { kind: 'investment', ...base, type: 'Investimento' };
  return null;
}

export function mapPluggyTransaction(tx: PluggyTransactionLike, context: MappingContext): PluggyLedgerEntry | null {
  const classification = classifyTransaction(
    { ...tx, isCreditCard: context.isCreditCard },
    { hasCreditCardPurchases: context.hasCreditCardPurchases },
  );
  return entryFromClassification(tx, classification);
}
