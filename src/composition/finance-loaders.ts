import { cacheLife, cacheTag } from 'next/cache';
import { ledgerCacheTag } from '@/modules/finance/application/services/ledger-cache-tag';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import type { Portfolio } from '@/modules/finance/domain/models/portfolio';
import { ledgerService, portfolioService } from './finance';

export async function loadLedger(userId: string): Promise<LedgerEntry[]> {
  'use cache';
  cacheTag(ledgerCacheTag(userId));
  cacheLife('minutes');
  return ledgerService.load(userId);
}

export async function loadPortfolio(userId: string): Promise<Portfolio> {
  'use cache';
  cacheTag(ledgerCacheTag(userId));
  cacheLife('minutes');
  return portfolioService.load(userId);
}
