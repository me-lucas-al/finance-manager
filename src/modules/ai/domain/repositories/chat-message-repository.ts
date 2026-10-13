export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'summary';
export type ChatChannel = 'telegram' | 'web';

export type ChatMessage = {
  id: string;
  userId: string;
  role: ChatMessageRole;
  content: string;
  channel: ChatChannel;
  createdAt: string;
};

export type NewChatMessage = Omit<ChatMessage, 'id' | 'createdAt' | 'channel'> & { channel?: ChatChannel };

export interface ChatMessageRepository {
  create(data: NewChatMessage): Promise<ChatMessage>;
  findRecentByUserId(userId: string, limit?: number): Promise<ChatMessage[]>;
  deleteByIds(ids: string[]): Promise<void>;
  countByUserId(userId: string): Promise<number>;
  deleteAllByUserId(userId: string): Promise<void>;
}
