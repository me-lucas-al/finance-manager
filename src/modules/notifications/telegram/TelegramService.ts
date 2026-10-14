import { markdownToTelegramHtml } from './markdown-to-telegram-html';
import { SupabaseTelegramLinkRepository } from './infrastructure/supabase-telegram-link-repository';

type Target = { token: string; chatId: number | string };

async function resolveTarget(userId: string): Promise<Target | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  const chatId = await new SupabaseTelegramLinkRepository().findChatIdByUserId(userId);
  if (!chatId) return null;
  return { token, chatId };
}

export class TelegramService {
  static async sendMessage(userId: string, text: string, replyToMessageId?: number): Promise<number | null> {
    const target = await resolveTarget(userId);
    if (!target) return null;
    return TelegramService.sendToChat(target.chatId, text, replyToMessageId);
  }

  static async sendToChat(chatId: number | string, text: string, replyToMessageId?: number): Promise<number | null> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;
    const target = { token, chatId };

    const html = await TelegramService.post(target, markdownToTelegramHtml(text), replyToMessageId, 'HTML');
    if (html !== null) return html;

    // Telegram rejects malformed HTML entities; resend as plain text so the user still gets the reply.
    return TelegramService.post(target, text, replyToMessageId);
  }

  private static async post(
    target: Target,
    text: string,
    replyToMessageId?: number,
    parseMode?: 'HTML',
  ): Promise<number | null> {
    const response = await fetch(`https://api.telegram.org/bot${target.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: target.chatId,
        text,
        ...(parseMode ? { parse_mode: parseMode } : {}),
        ...(replyToMessageId ? { reply_parameters: { message_id: replyToMessageId } } : {}),
      }),
    });

    const body = (await response.json()) as { ok?: boolean; result?: { message_id?: number } };
    if (!response.ok || !body.ok || !body.result?.message_id) {
      console.error('Telegram sendMessage failed:', response.status, JSON.stringify(body));
      return null;
    }

    return body.result.message_id;
  }

  static async sendTyping(userId: string): Promise<void> {
    const target = await resolveTarget(userId);
    if (!target) return;

    await fetch(`https://api.telegram.org/bot${target.token}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: target.chatId, action: 'typing' }),
    }).catch(() => null);
  }
}
