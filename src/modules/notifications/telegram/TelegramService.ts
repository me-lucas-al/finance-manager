// Telegram Bot API client (https://core.telegram.org/bots/api#sendmessage).
// Config is read lazily, same pattern as PushService/EmailService: a missing
// token/chat id logs a warning and no-ops instead of crashing the caller.
function getConfig(): { token: string; chatId: string } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

export class TelegramService {
  // Sends a message and, optionally, replies to a previous one (used to keep
  // the reply-correlation thread when this message is itself a follow-up).
  static async sendMessage(text: string, replyToMessageId?: number): Promise<number | null> {
    const config = getConfig();
    if (!config) {
      console.warn('Telegram is not configured (missing TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID); skipping.');
      return null;
    }

    const response = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        ...(replyToMessageId ? { reply_parameters: { message_id: replyToMessageId } } : {}),
      }),
    });

    const body = await response.json();
    if (!response.ok || !body.ok) {
      console.error('Failed to send Telegram message:', body);
      return null;
    }

    return body.result.message_id as number;
  }
}
