import { NextRequest, NextResponse } from 'next/server';
import type { WebhookEventPayload } from 'pluggy-sdk';
import { fetchItemOwner } from '@/lib/pluggy-items';
import { DrizzleDataModeStore } from '@/modules/onboarding/infrastructure/drizzle-data-mode-store';
import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { buildPluggySync } from '@/modules/pluggy-sync/application/build-pluggy-sync';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.PLUGGY_WEBHOOK_SECRET;
  if (!secret) return false;
  return req.nextUrl.searchParams.get('token') === secret;
}

async function resolveItemOwner(itemId: string): Promise<string | null> {
  const known = await new SupabaseAccountRepository().findAllByPluggyItemId(itemId);
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
      if ((await new DrizzleDataModeStore().getState(userId)).dataMode !== 'pluggy') {
        return NextResponse.json({ ok: true });
      }
      await buildPluggySync().syncItem(userId, itemId);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Pluggy webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
