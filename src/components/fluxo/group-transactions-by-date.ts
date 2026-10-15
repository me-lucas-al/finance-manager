import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';

export function groupTransactionsByDate(transactions: LiveTransactionItem[]): Array<[string, LiveTransactionItem[]]> {
  const byDate = new Map<string, LiveTransactionItem[]>();
  for (const transaction of transactions) {
    byDate.set(transaction.dateStr, [...(byDate.get(transaction.dateStr) ?? []), transaction]);
  }
  return Array.from(byDate.entries());
}
