import { cacheLife, cacheTag } from 'next/cache';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { createLedgerService } from '../../infrastructure/ledger-factory';
import type { LedgerEntry } from '../../domain/models/ledger-entry';
import { ledgerCacheTag } from './ledger-cache-tag';

async function loadCachedLedger(userId: string): Promise<LedgerEntry[]> {
  'use cache';
  cacheTag(ledgerCacheTag(userId));
  cacheLife('minutes');
  return createLedgerService().load(userId);
}

export async function loadLedger(overrideUserId?: string): Promise<LedgerEntry[]> {
  const userId = overrideUserId ?? (await getEffectiveUserId());
  return loadCachedLedger(userId);
}
