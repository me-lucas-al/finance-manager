import { markdownToTelegramHtml } from './markdown-to-telegram-html';
import type { TelegramLinkRepository } from './domain/telegram-link-repository';
import type { TelegramMessenger } from './domain/telegram-messenger';

type Target = { token: string; chatId: number | string };

export class TelegramService implements TelegramMessenger {
  constructor(private links: Pick<TelegramLinkRepository, 'findChatIdByUserId'>) {}

  async sendMessage(userId: string, text: string, replyToMessageId?: number): Promise<number | null> {
    const target = await this.resolveTarget(userId);
    if (!target) return null;
    return this.sendToChat(target.chatId, text, replyToMessageId);
  }

  async sendToChat(chatId: number | string, text: string, replyToMessageId?: number): Promise<number | null> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;
    const target = { token, chatId };

    const html = await this.post(target, markdownToTelegramHtml(text), replyToMessageId, 'HTML');
    if (html !== null) return html;

    return this.post(target, text, replyToMessageId);
  }

  async sendTyping(userId: string): Promise<void> {
    const target = await this.resolveTarget(userId);
    if (!target) return;

    await fetch(`https://api.telegram.org/bot${target.token}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: target.chatId, action: 'typing' }),
    }).catch(() => null);
  }

  private async resolveTarget(userId: string): Promise<Target | null> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;
    const chatId = await this.links.findChatIdByUserId(userId);
    if (!chatId) return null;
    return { token, chatId };
  }

  private async post(
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
}
