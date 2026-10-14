import { NextRequest, NextResponse, after } from 'next/server';
import { buildTelegramRouter } from '@/modules/open-finance/application/use-cases/build-telegram-router';
import { handleStartCommand, parseStartCommand } from '@/modules/notifications/telegram/application/handle-start-command';
import { SupabaseTelegramLinkRepository } from '@/modules/notifications/telegram/infrastructure/supabase-telegram-link-repository';
import { SupabaseTelegramUpdateRepository } from '@/modules/notifications/telegram/infrastructure/supabase-telegram-update-repository';

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    chat?: { id: number; type?: string };
    text?: string;
    reply_to_message?: { message_id: number };
  };
};

const acknowledged = () => NextResponse.json({ ok: true });

function hasValidSecret(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return false;
  return req.headers.get('x-telegram-bot-api-secret-token') === secret;
}

async function readUpdate(req: NextRequest): Promise<TelegramUpdate | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function routeToAssistant(update: TelegramUpdate, text: string, userId: string): Promise<void> {
  try {
    await buildTelegramRouter().execute(
      {
        messageId: update.message!.message_id,
        text,
        replyToMessageId: update.message!.reply_to_message?.message_id,
      },
      userId,
    );
  } catch (err) {
    console.error('Error processing Telegram webhook asynchronously:', err);
  }
}

async function runStartCommand(links: SupabaseTelegramLinkRepository, chatId: number, code?: string) {
  try {
    await handleStartCommand(links, chatId, code);
  } catch (err) {
    console.error('Error handling Telegram /start:', err);
  }
}

export async function POST(req: NextRequest) {
  if (!hasValidSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const update = await readUpdate(req);
  if (!update) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const message = update.message;
  const chatId = message?.chat?.id;
  if (!message?.text || !chatId || message.chat?.type !== 'private') return acknowledged();

  const updates = new SupabaseTelegramUpdateRepository();
  if (update.update_id && !(await updates.claim(update.update_id))) return acknowledged();

  const links = new SupabaseTelegramLinkRepository();
  const startCommand = parseStartCommand(message.text);
  if (startCommand) {
    after(() => runStartCommand(links, chatId, startCommand.code));
    return acknowledged();
  }

  const userId = await links.findUserIdByChatId(chatId);
  if (!userId) return acknowledged();

  const text = message.text;
  after(() => routeToAssistant(update, text, userId));
  return acknowledged();
}
