import { classifyTransaction } from '@/lib/transaction-classifier';

export type PluggyTransactionLike = {
  id: string;
  date: Date | string;
  description: string;
  type: string;
  amount: number;
  category: string | null;
};

export type LedgerEntry =
  | { kind: 'income'; externalId: string; amount: number; description: string; category: string; date: Date }
  | { kind: 'investment'; externalId: string; amount: number; description: string; type: string; date: Date }
  | { kind: 'expense'; externalId: string; amount: number; description: string; category: string; date: Date };

export function mapPluggyTransaction(
  tx: PluggyTransactionLike,
  context: { isCreditCard: boolean },
): LedgerEntry | null {
  const classification = classifyTransaction({
    id: tx.id,
    amount: tx.amount,
    type: tx.type,
    date: tx.date,
    description: tx.description,
    category: tx.category,
    isCreditCard: context.isCreditCard,
  });

  const amount = Math.abs(tx.amount);
  const date = new Date(tx.date);
  const base = { externalId: tx.id, amount, description: tx.description, date };

  switch (classification) {
    case 'INCOME':
      return { kind: 'income', ...base, category: tx.category || 'Outros' };
    case 'EXPENSE':
      return { kind: 'expense', ...base, category: tx.category || 'Outros' };
    case 'INVESTMENT':
      return tx.type === 'DEBIT' || tx.amount < 0 ? { kind: 'investment', ...base, type: 'Investimento' } : null;
    default:
      return null;
  }
}
