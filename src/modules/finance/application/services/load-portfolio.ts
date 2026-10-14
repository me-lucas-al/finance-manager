import { cacheLife, cacheTag } from 'next/cache';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { createPortfolioService } from '../../infrastructure/portfolio-factory';
import type { Portfolio } from '../../domain/models/portfolio';
import { ledgerCacheTag } from './ledger-cache-tag';

async function loadCachedPortfolio(userId: string): Promise<Portfolio> {
  'use cache';
  cacheTag(ledgerCacheTag(userId));
  cacheLife('minutes');
  return createPortfolioService().load(userId);
}

export async function loadPortfolio(overrideUserId?: string): Promise<Portfolio> {
  const userId = overrideUserId ?? (await getEffectiveUserId());
  return loadCachedPortfolio(userId);
}
