import type { EditableEntry } from '@/components/entries/entry-form-values';
import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';

export function toEditableEntry(transaction: LiveTransactionItem): EditableEntry {
  return {
    kind: transaction.type,
    id: transaction.id,
    amount: transaction.amount,
    description: transaction.description,
    category: transaction.category,
    date: transaction.dateStr,
  };
}
