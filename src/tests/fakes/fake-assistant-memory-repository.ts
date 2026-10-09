import {
  AssistantMemory,
  AssistantMemoryRepository,
  NewAssistantMemory,
} from '../../modules/ai/domain/repositories/assistant-memory-repository';

export class FakeAssistantMemoryRepository implements AssistantMemoryRepository {
  public items: AssistantMemory[] = [];
  private counter = 1;

  async create(data: NewAssistantMemory): Promise<AssistantMemory> {
    const item: AssistantMemory = {
      id: String(this.counter++),
      userId: data.userId,
      fact: data.fact,
      createdAt: new Date().toISOString(),
    };
    this.items.push(item);
    await this.trimOldest(data.userId, 50);
    return item;
  }

  async findAllByUserId(userId: string): Promise<AssistantMemory[]> {
    return this.items.filter((m) => m.userId === userId);
  }

  async trimOldest(userId: string, maxItems: number = 50): Promise<void> {
    const userItems = this.items.filter((m) => m.userId === userId);
    if (userItems.length <= maxItems) return;
    const toKeep = userItems.slice(-maxItems);
    this.items = this.items.filter((m) => m.userId !== userId).concat(toKeep);
  }
}
