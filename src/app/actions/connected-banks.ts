'use server';

import { listConnectedBanks } from '@/composition/open-finance';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import type { ConnectedBank } from '@/modules/open-finance/domain/connected-bank';

export async function getConnectedBanks(): Promise<ConnectedBank[] | null> {
  const userId = await requireUserId();
  try {
    return await listConnectedBanks.execute(userId);
  } catch (error) {
    console.error('Failed to load the connected banks:', error);
    return null;
  }
}
