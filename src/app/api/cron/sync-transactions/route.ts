import { NextResponse } from 'next/server';
import { pluggySync } from '@/composition/pluggy-sync';
import { accountRepository } from '@/composition/open-finance';
import { withCronAuth } from '../with-cron-auth';

export const GET = withCronAuth(async () => {
  try {
    const owners = await accountRepository.listItemOwners();
    const items = new Map(owners.map(({ pluggyItemId, userId }) => [pluggyItemId, userId]));

    let failed = 0;
    for (const [itemId, userId] of items) {
      try {
        await pluggySync.syncItem(userId, itemId);
      } catch (err) {
        failed++;
        console.error(`sync-transactions failed for item ${itemId}:`, err);
      }
    }
    return NextResponse.json({ ok: failed === 0, items: items.size, failed });
  } catch (error) {
    console.error('Error executing sync-transactions cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
