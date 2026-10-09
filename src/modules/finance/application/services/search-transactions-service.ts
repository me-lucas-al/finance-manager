import { getEffectiveUserId } from '@/app/actions/require-session';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';

export async function searchLiveTransactions(
  query: string,
  limit: number = 10,
  overrideUserId?: string
): Promise<LiveTransactionItem[]> {
  const userId = overrideUserId ?? (await getEffectiveUserId());
  const repo = new SupabaseTransactionRepository();
  const txs = await repo.findAllByUserId(userId, { search: query, limit });

  return txs.map((tx) => ({
    id: tx.id,
    dateStr: tx.occurredAt,
    rawDate: new Date(tx.occurredAt),
    type: 'expense' as const,
    description: tx.description,
    account: tx.bank,
    category: tx.category || 'Outros',
    amount: Number(tx.amount),
    bank: tx.bank,
    isCreditCard: false,
  }));
}
