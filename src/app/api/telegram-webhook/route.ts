import { NextRequest, NextResponse, after } from 'next/server';
import { buildTelegramRouter } from '@/composition/telegram-router';
import { telegramLinkRepository, telegramMessenger, telegramUpdateRepository } from '@/composition/telegram';
import { handleStartCommand, parseStartCommand } from '@/modules/notifications/telegram/application/handle-start-command';

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

async function runStartCommand(chatId: number, code?: string) {
  try {
    await handleStartCommand(telegramLinkRepository, telegramMessenger, chatId, code);
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

  if (update.update_id && !(await telegramUpdateRepository.claim(update.update_id))) return acknowledged();

  const startCommand = parseStartCommand(message.text);
  if (startCommand) {
    after(() => runStartCommand(chatId, startCommand.code));
    return acknowledged();
  }

  const userId = await telegramLinkRepository.findUserIdByChatId(chatId);
  if (!userId) return acknowledged();

  const text = message.text;
  after(() => routeToAssistant(update, text, userId));
  return acknowledged();
}
