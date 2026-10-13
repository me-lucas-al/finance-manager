import { describe, it, expect, beforeEach } from 'vitest';
import { AdvisorChatService } from '@/modules/ai/application/services/advisor-chat-service';
import { ChatMemoryService } from '@/modules/ai/application/services/chat-memory-service';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { FakeChatMessageRepository } from '@/tests/fakes/fake-chat-message-repository';
import { FakeAssistantMemoryRepository } from '@/tests/fakes/fake-assistant-memory-repository';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';
import { sampleLedgerSource } from '@/tests/fakes/fake-ledger-source';
import { FakeGoalRepository } from '../open-finance/fake-goal-repository';

describe('AdvisorChatService', () => {
  let chatRepo: FakeChatMessageRepository;
  let llm: FakeLanguageModel;
  let service: AdvisorChatService;

  beforeEach(() => {
    chatRepo = new FakeChatMessageRepository();
    llm = new FakeLanguageModel();
    llm.nextTextResponse = 'Seu saldo está ótimo ';
    service = new AdvisorChatService({
      chatMemory: new ChatMemoryService(chatRepo, new FakeAssistantMemoryRepository(), llm),
      chatRepo,
      llm,
      ledger: new LedgerService(sampleLedgerSource),
      goalRepo: new FakeGoalRepository(),
      buildTools: () => [],
    });
  });

  it('stores the conversation tagged with the channel', async () => {
    await service.respond('u', 'qual meu saldo?', 'telegram');
    for await (const chunk of service.stream('u', 'e agora?', 'web')) void chunk;

    expect(chatRepo.items.map((m) => [m.role, m.channel])).toEqual([
      ['user', 'telegram'],
      ['assistant', 'telegram'],
      ['user', 'web'],
      ['assistant', 'web'],
    ]);
  });

  it('streams the full reply and saves it once', async () => {
    const chunks: string[] = [];
    for await (const chunk of service.stream('u', 'oi', 'web')) chunks.push(chunk);

    expect(chunks.join('')).toBe('Seu saldo está ótimo ');
    expect(chatRepo.items.filter((m) => m.role === 'assistant')).toHaveLength(1);
  });

  it('fails loudly on an empty reply and keeps the user message', async () => {
    llm.nextTextResponse = '   ';

    await expect(async () => {
      for await (const chunk of service.stream('u', 'oi', 'web')) void chunk;
    }).rejects.toThrow('empty reply');

    expect(chatRepo.items.map((m) => m.role)).toEqual(['user']);
  });

  it('saves the partial reply when the model fails midway', async () => {
    llm.stream = async function* () {
      yield 'Resposta parcial';
      throw new Error('quota exceeded');
    };

    await expect(async () => {
      for await (const chunk of service.stream('u', 'oi', 'web')) void chunk;
    }).rejects.toThrow('quota exceeded');

    expect(chatRepo.items.map((m) => [m.role, m.content])).toEqual([
      ['user', 'oi'],
      ['assistant', 'Resposta parcial'],
    ]);
  });

  it('gives each message its own turn id to the tools', async () => {
    const turnIds: string[] = [];
    const withTools = new AdvisorChatService({
      chatMemory: new ChatMemoryService(chatRepo, new FakeAssistantMemoryRepository(), llm),
      chatRepo,
      llm,
      ledger: new LedgerService(sampleLedgerSource),
      goalRepo: new FakeGoalRepository(),
      buildTools: ({ turnId }) => {
        turnIds.push(turnId);
        return [];
      },
    });

    await withTools.respond('u', 'um', 'web');
    await withTools.respond('u', 'dois', 'web');

    expect(new Set(turnIds).size).toBe(2);
  });

  it('remembers across channels: a web message sees the telegram history', async () => {
    await service.respond('u', 'meu salário é 5000', 'telegram');
    await service.respond('u', 'lembra do meu salário?', 'web');

    expect(llm.lastMessages.map((m) => m.content)).toContain('meu salário é 5000');
  });
});
