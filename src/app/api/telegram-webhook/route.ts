import { NextRequest, NextResponse } from 'next/server';
import { RecordTransactionReasonUseCase } from '@/modules/open-finance/application/use-cases/record-transaction-reason';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';

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
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const userId = process.env.FINANCE_OWNER_USER_ID;
  const replyToMessageId = message.reply_to_message?.message_id;

  if (!replyToMessageId && !userId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const useCase = new RecordTransactionReasonUseCase(new SupabaseTransactionRepository());
    await useCase.execute(replyToMessageId, message.text, message.message_id, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
