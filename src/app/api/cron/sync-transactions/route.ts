import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPluggySync } from '@/modules/pluggy-sync/application/build-pluggy-sync';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await getSupabaseAdmin().from('accounts').select('user_id, pluggy_item_id');
    if (error) throw new Error(error.message);

    const items = new Map<string, string>();
    for (const row of data ?? []) items.set(row.pluggy_item_id as string, row.user_id as string);

    const sync = buildPluggySync();
    let failed = 0;
    for (const [itemId, userId] of items) {
      try {
        await sync.syncItem(userId, itemId);
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
}
