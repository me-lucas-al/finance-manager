'use server';

import { requireUserId } from './require-session';
import { DrizzleIncomeRepository, DrizzleInvestmentRepository } from '../../modules/finance/infrastructure/repositories';
import type { IncomeSortField } from '../../modules/finance/domain/repositories/income-repository';
import type { InvestmentSortField } from '../../modules/finance/domain/repositories/investment-repository';
import { PAGE_SIZE } from '../../components/entries/constants';

export type EntryListParams = {
  search?: string;
  category?: string;
  sort?: 'date' | 'description' | 'amount';
  dir?: 'asc' | 'desc';
  page: number;
};

function normalizeParams(params: EntryListParams) {
  return {
    search: params.search ?? '',
    category: params.category ?? '',
    sort: params.sort ?? 'date',
    dir: params.dir ?? 'desc',
    page: params.page,
  };
}

async function fetchIncomesPageCached(
  userId: string,
  params: { search: string; category: string; sort: IncomeSortField; dir: 'asc' | 'desc'; page: number }
) {
  'use cache';
  const { cacheTag, cacheLife } = await import('next/cache');
  cacheTag(`incomes-${userId}`);
  cacheLife('max');

  const repo = new DrizzleIncomeRepository();
  return repo.findPageByUserId(userId, {
    search: params.search || undefined,
    category: params.category || undefined,
    sort: params.sort,
    dir: params.dir,
    limit: PAGE_SIZE,
    offset: (params.page - 1) * PAGE_SIZE,
  });
}

export async function getIncomesPage(params: EntryListParams) {
  const userId = await requireUserId();
  return fetchIncomesPageCached(userId, normalizeParams(params));
}

async function fetchInvestmentsPageCached(
  userId: string,
  params: { search: string; category: string; sort: InvestmentSortField; dir: 'asc' | 'desc'; page: number }
) {
  'use cache';
  const { cacheTag, cacheLife } = await import('next/cache');
  cacheTag(`investments-${userId}`);
  cacheLife('max');

  const repo = new DrizzleInvestmentRepository();
  return repo.findPageByUserId(userId, {
    search: params.search || undefined,
    type: params.category || undefined,
    sort: params.sort,
    dir: params.dir,
    limit: PAGE_SIZE,
    offset: (params.page - 1) * PAGE_SIZE,
  });
}

export async function getInvestmentsPage(params: EntryListParams) {
  const userId = await requireUserId();
  return fetchInvestmentsPageCached(userId, normalizeParams(params));
}
