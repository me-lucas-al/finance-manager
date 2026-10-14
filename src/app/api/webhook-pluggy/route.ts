import { NextRequest, NextResponse } from 'next/server';
import type { WebhookEventPayload } from 'pluggy-sdk';
import { fetchItemOwner } from '@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import { accountRepository } from '@/composition/open-finance';
import { pluggySync } from '@/composition/pluggy-sync';
import { isPluggyMode } from '../pluggy-mode';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.PLUGGY_WEBHOOK_SECRET;
  if (!secret) return false;
  return req.nextUrl.searchParams.get('token') === secret;
}

async function resolveItemOwner(itemId: string): Promise<string | null> {
  const known = await accountRepository.findAllByPluggyItemId(itemId);
  if (known[0]) return known[0].userId;
  return fetchItemOwner(itemId).catch(() => null);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: WebhookEventPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!payload?.event || !payload?.eventId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const itemId = 'itemId' in payload ? payload.itemId : undefined;
    if (itemId && (payload.event === 'transactions/created' || payload.event === 'item/updated')) {
      const userId = await resolveItemOwner(itemId);
      if (!userId) {
        return NextResponse.json({ ok: true });
      }
      if (!(await isPluggyMode(userId))) {
        return NextResponse.json({ ok: true });
      }
      await pluggySync.syncItem(userId, itemId);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Pluggy webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
