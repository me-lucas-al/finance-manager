export interface TelegramLinkRepository {
  findChatIdByUserId(userId: string): Promise<number | null>;
  findUserIdByChatId(chatId: number): Promise<string | null>;
  listLinkedUserIds(): Promise<string[]>;
  createLinkCode(userId: string): Promise<string>;
  consumeLinkCode(code: string, chatId: number): Promise<string | null>;
  unlink(userId: string): Promise<void>;
}
