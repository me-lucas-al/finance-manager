import { describe, it, expect, beforeEach } from 'vitest';
import { ChatMemoryService } from '@/modules/ai/application/services/chat-memory-service';
import { FakeChatMessageRepository } from '@/tests/fakes/fake-chat-message-repository';
import { FakeAssistantMemoryRepository } from '@/tests/fakes/fake-assistant-memory-repository';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';

class FakeTelegramUpdateRepository {
  private set = new Set<number>();
  async isProcessed(id: number): Promise<boolean> {
    return this.set.has(id);
  }
  async markProcessed(id: number): Promise<void> {
    this.set.add(id);
  }
}

describe('ChatMemoryService and Idempotency', () => {
  let chatRepo: FakeChatMessageRepository;
  let memoryRepo: FakeAssistantMemoryRepository;
  let llm: FakeLanguageModel;
  let memoryService: ChatMemoryService;
  let updateRepo: FakeTelegramUpdateRepository;

  beforeEach(() => {
    chatRepo = new FakeChatMessageRepository();
    memoryRepo = new FakeAssistantMemoryRepository();
    llm = new FakeLanguageModel();
    memoryService = new ChatMemoryService(chatRepo, memoryRepo, llm);
    updateRepo = new FakeTelegramUpdateRepository();
  });

  it('keeps up to 12 messages in recent context', async () => {
    for (let i = 1; i <= 10; i++) {
      await chatRepo.create({ userId: 'u-1', role: 'user', content: `Msg ${i}` });
    }
    const context = await memoryService.prepareContext('u-1');
    expect(context.messages).toHaveLength(10);
  });

  it('compacts older messages into a summary when exceeding window', async () => {
    llm.nextTextResponse = 'Resumo: Usuário cortou gastos com delivery.';
    for (let i = 1; i <= 16; i++) {
      await chatRepo.create({ userId: 'u-1', role: i % 2 === 0 ? 'assistant' : 'user', content: `Msg ${i}` });
    }

    const context = await memoryService.prepareContext('u-1');
    expect(context.messages.length).toBeLessThanOrEqual(13);
    const hasSummary = context.messages.some((m) => m.content.includes('[Resumo'));
    expect(hasSummary).toBe(true);
  });

  it('ensures idempotency by update_id', async () => {
    expect(await updateRepo.isProcessed(12345)).toBe(false);
    await updateRepo.markProcessed(12345);
    expect(await updateRepo.isProcessed(12345)).toBe(true);
  });
});
