'use server';

import { requireUserId } from './require-session';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import type { TransactionSortField } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { PAGE_SIZE } from '@/components/entries/constants';

export type TransactionListParams = {
  month: string;
  search?: string;
  category?: string;
  sort?: TransactionSortField;
  dir?: 'asc' | 'desc';
  page: number;
};

async function fetchTransactionsPageCached(
  userId: string,
  params: { month: string; search: string; category: string; sort: TransactionSortField; dir: 'asc' | 'desc'; page: number }
) {
  'use cache';
  const { cacheTag, cacheLife } = await import('next/cache');
  cacheTag(`transactions-${userId}`);
  cacheLife('max');

  const repo = new SupabaseTransactionRepository();
  const filters = {
    month: params.month,
    category: params.category || undefined,
    search: params.search || undefined,
    sort: params.sort,
    dir: params.dir,
    limit: PAGE_SIZE,
    offset: (params.page - 1) * PAGE_SIZE,
  };
  try {
    const [rows, total] = await Promise.all([
      repo.findAllByUserId(userId, filters),
      repo.countByUserId(userId, { month: filters.month, category: filters.category, search: filters.search }),
    ]);
    return { rows, total };
  } catch {
    return { rows: [], total: 0 };
  }
}

export async function getTransactionsPage(params: TransactionListParams) {
  const userId = await requireUserId();
  return fetchTransactionsPageCached(userId, {
    month: params.month,
    search: params.search ?? '',
    category: params.category ?? '',
    sort: params.sort ?? 'date',
    dir: params.dir ?? 'desc',
    page: params.page,
  });
}
