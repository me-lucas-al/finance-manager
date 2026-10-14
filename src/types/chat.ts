export interface StoredChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
