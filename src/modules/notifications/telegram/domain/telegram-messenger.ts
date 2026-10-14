export interface TelegramMessenger {
  sendMessage(userId: string, text: string, replyToMessageId?: number): Promise<number | null>;
  sendToChat(chatId: number | string, text: string, replyToMessageId?: number): Promise<number | null>;
  sendTyping(userId: string): Promise<void>;
}
