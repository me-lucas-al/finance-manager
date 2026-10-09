export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'summary';

export type ChatMessage = {
  id: string;
  userId: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
};

export type NewChatMessage = Omit<ChatMessage, 'id' | 'createdAt'>;

export interface ChatMessageRepository {
  create(data: NewChatMessage): Promise<ChatMessage>;
  findRecentByUserId(userId: string, limit?: number): Promise<ChatMessage[]>;
  deleteByIds(ids: string[]): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
