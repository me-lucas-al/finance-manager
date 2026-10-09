import {
  ChatMessage,
  ChatMessageRepository,
  NewChatMessage,
} from '../../modules/ai/domain/repositories/chat-message-repository';

export class FakeChatMessageRepository implements ChatMessageRepository {
  public items: ChatMessage[] = [];
  private counter = 1;

  async create(data: NewChatMessage): Promise<ChatMessage> {
    const item: ChatMessage = {
      id: String(this.counter++),
      userId: data.userId,
      role: data.role,
      content: data.content,
      createdAt: new Date().toISOString(),
    };
    this.items.push(item);
    return item;
  }

  async findRecentByUserId(userId: string, limit: number = 12): Promise<ChatMessage[]> {
    const list = this.items.filter((m) => m.userId === userId);
    return list.slice(-limit);
  }

  async deleteByIds(ids: string[]): Promise<void> {
    const set = new Set(ids);
    this.items = this.items.filter((m) => !set.has(m.id));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.items.filter((m) => m.userId === userId).length;
  }
}
