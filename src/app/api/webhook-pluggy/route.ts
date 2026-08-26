import { NextRequest, NextResponse } from 'next/server';
import type { WebhookEventPayload } from 'pluggy-sdk';
import { fetchNewTransactions } from '@/lib/pluggy';
import { ingestPluggyTransaction } from '@/modules/open-finance/application/use-cases/ingest-pluggy-transaction';
import { askForTransactionReason } from '@/modules/open-finance/application/use-cases/ask-transaction-reason';

// Pluggy has no webhook signing mechanism (confirmed against docs.pluggy.ai/docs/webhooks),
// so authenticity relies on registering an unguessable URL with the Pluggy dashboard
// (mirrors the CRON_SECRET pattern already used by /api/cron/closing) — set
// PLUGGY_WEBHOOK_SECRET and register the webhook URL as .../api/webhook-pluggy?token=<secret>.
// Financial data itself is never trusted from the payload: it only carries ids/links,
// and we always re-fetch the authoritative record via our own Pluggy API credentials.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.PLUGGY_WEBHOOK_SECRET;
  if (!secret) return true;
  return req.nextUrl.searchParams.get('token') === secret;
}

// This app supports NextAuth login, but Open Finance sync is set up by a single
// person — FINANCE_OWNER_USER_ID is that user's id (from the `users` table),
// used to attribute auto-synced transactions since Pluggy has no concept of it.
function getOwnerUserId(): string {
  const userId = process.env.FINANCE_OWNER_USER_ID;
  if (!userId) throw new Error('FINANCE_OWNER_USER_ID is not configured.');
  return userId;
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
    if (payload.event === 'transactions/created') {
      const userId = getOwnerUserId();
      const newTransactions = await fetchNewTransactions(payload.accountId, payload.transactionsCreatedAtFrom);
      for (const transaction of newTransactions) {
        const stored = await ingestPluggyTransaction(userId, payload.itemId, payload.accountId, transaction);
        if (!stored.categorySuggested) {
          await askForTransactionReason(stored);
        }
      }
    }
    // Other Pluggy event types (item/*, transactions/updated, transactions/deleted, ...)
    // are acknowledged with 2xx but not processed by this integration yet.
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Pluggy webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
