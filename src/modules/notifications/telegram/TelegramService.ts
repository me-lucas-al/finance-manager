function getConfig(): { token: string; chatId: string } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ALLOWED_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

export class TelegramService {
  static async sendMessage(text: string, replyToMessageId?: number): Promise<number | null> {
    const config = getConfig();
    if (!config) return null;

    const response = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
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

  static async sendTyping(): Promise<void> {
    const config = getConfig();
    if (!config) return;

    await fetch(`https://api.telegram.org/bot${config.token}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        action: 'typing',
      }),
    }).catch(() => null);
  }
}
