import { getEffectiveUserId } from '@/app/actions/require-session';
import { createLedgerService } from '../../infrastructure/ledger-factory';
import type { LedgerEntry } from '../../domain/models/ledger-entry';

export async function loadLedger(overrideUserId?: string): Promise<LedgerEntry[]> {
  const userId = overrideUserId ?? (await getEffectiveUserId());
  return createLedgerService().load(userId);
}
