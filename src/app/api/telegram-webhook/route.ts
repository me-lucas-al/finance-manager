import { NextRequest, NextResponse, after } from 'next/server';
import { buildTelegramRouter } from '@/modules/open-finance/application/use-cases/build-telegram-router';
import { SupabaseTelegramUpdateRepository } from '@/modules/notifications/telegram/infrastructure/supabase-telegram-update-repository';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return false;
  return req.headers.get('x-telegram-bot-api-secret-token') === secret;
}

function isChatAuthorized(chatId?: number | string): boolean {
  if (!chatId) return false;
  const allowed = process.env.TELEGRAM_ALLOWED_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  if (!allowed) return true;
  return String(chatId) === allowed;
}

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    chat?: { id: number };
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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  if (!isChatAuthorized(message.chat?.id)) {
    return NextResponse.json({ ok: true });
  }

  const userId = process.env.FINANCE_OWNER_USER_ID;
  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  const updateRepo = new SupabaseTelegramUpdateRepository();
  if (update.update_id) {
    const alreadyProcessed = await updateRepo.isProcessed(update.update_id);
    if (alreadyProcessed) {
      return NextResponse.json({ ok: true });
    }
    await updateRepo.markProcessed(update.update_id);
  }

  after(async () => {
    try {
      const router = buildTelegramRouter();
      await router.execute(
        {
          messageId: message.message_id,
          text: message.text!,
          replyToMessageId: message.reply_to_message?.message_id,
        },
        userId
      );
    } catch (err) {
      console.error('Error processing Telegram webhook asynchronously:', err);
    }
  });

  return NextResponse.json({ ok: true });
}
