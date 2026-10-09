export type AssistantMemory = {
  id: string;
  userId: string;
  fact: string;
  createdAt: string;
};

export type NewAssistantMemory = Omit<AssistantMemory, 'id' | 'createdAt'>;

export interface AssistantMemoryRepository {
  create(data: NewAssistantMemory): Promise<AssistantMemory>;
  findAllByUserId(userId: string): Promise<AssistantMemory[]>;
  trimOldest(userId: string, maxItems?: number): Promise<void>;
}
