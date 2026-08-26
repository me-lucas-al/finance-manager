import { NextRequest, NextResponse } from 'next/server';
import { recordTransactionReason } from '@/modules/open-finance/application/use-cases/record-transaction-reason';

// Telegram signs webhook requests with the secret_token passed to setWebhook,
// delivered back as this header (https://core.telegram.org/bots/api#setwebhook).
// Fails closed until TELEGRAM_WEBHOOK_SECRET is set — this route rewrites
// transaction category/reason based on the request body.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return false;
  return req.headers.get('x-telegram-bot-api-secret-token') === secret;
}

type TelegramUpdate = {
  message?: {
    message_id: number;
    text?: string;
    reply_to_message?: { message_id: number };
  };
};

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text || !message.reply_to_message) {
    // Not a reply to one of our questions (e.g. /start, a stray message) —
    // nothing to correlate, still acknowledge with 2xx per Telegram's contract.
    return NextResponse.json({ ok: true });
  }

  try {
    await recordTransactionReason(message.reply_to_message.message_id, message.text, message.message_id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
