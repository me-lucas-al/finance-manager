import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordTransactionReasonUseCase } from '@/modules/open-finance/application/use-cases/record-transaction-reason';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import { FakeAssistantMemoryRepository } from '@/tests/fakes/fake-assistant-memory-repository';
import { createFakeTelegramMessenger } from '@/tests/fakes/fake-telegram-messenger';
import type { ILanguageModel } from '@/modules/ai/domain/models/language-model';

describe('RecordTransactionReasonUseCase', () => {
  let transactionRepo: FakeTransactionRepository;
  let memoryRepo: FakeAssistantMemoryRepository;
  let messenger: ReturnType<typeof createFakeTelegramMessenger>;
  let notifier: { notifyEntriesChanged: ReturnType<typeof vi.fn> };
  let llm: Partial<ILanguageModel>;
  let useCase: RecordTransactionReasonUseCase;

  beforeEach(() => {
    transactionRepo = new FakeTransactionRepository();
    memoryRepo = new FakeAssistantMemoryRepository();
    messenger = createFakeTelegramMessenger();
    notifier = { notifyEntriesChanged: vi.fn().mockResolvedValue(undefined) };
    llm = {
      generateStructured: vi.fn().mockResolvedValue({
        category: 'Alimentação',
        reason: 'Almoço de aniversário',
      }),
    };

    useCase = new RecordTransactionReasonUseCase({
      transactionRepo,
      memoryRepo,
      llm: llm as ILanguageModel,
      messenger,
      notifier,
      listCategories: async () => ['Alimentação', 'Transporte', 'Lazer'],
    });
  });

  it('updates transaction in database with category, reason and categorized status', async () => {
    const tx = await transactionRepo.create({
      userId: 'user-1',
      pluggyTransactionId: null,
      accountId: null,
      bank: 'Nubank',
      amount: 120,
      description: 'Restaurante Fogo',
      occurredAt: '2026-11-13',
      category: null,
      categorySuggested: 'Alimentação',
      reason: null,
      status: 'pending_reason',
      source: 'pluggy',
      necessity: null,
      telegramQuestionMessageId: 100,
    });

    const result = await useCase.execute(tx, 'foi almoço de aniversário', 101);

    expect(result).toBe(true);
    const updated = await transactionRepo.findById(tx.id);
    expect(updated?.status).toBe('categorized');
    expect(updated?.category).toBe('Alimentação');
    expect(updated?.reason).toBe('Almoço de aniversário');
  });

  it('saves the fact in assistant memory for AI intelligence context', async () => {
    const tx = await transactionRepo.create({
      userId: 'user-1',
      pluggyTransactionId: null,
      accountId: null,
      bank: 'Nubank',
      amount: 55,
      description: 'Uber',
      occurredAt: '2026-11-13',
      category: null,
      categorySuggested: 'Transporte',
      reason: null,
      status: 'pending_reason',
      source: 'pluggy',
      necessity: null,
      telegramQuestionMessageId: 200,
    });

    (llm.generateStructured as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      category: 'Transporte',
      reason: 'Corrida para o aeroporto',
    });

    await useCase.execute(tx, 'corrida para o aeroporto', 201);

    const facts = await memoryRepo.findAllByUserId('user-1');
    expect(facts).toHaveLength(1);
    expect(facts[0].fact).toContain('Uber');
    expect(facts[0].fact).toContain('Corrida para o aeroporto');
    expect(notifier.notifyEntriesChanged).toHaveBeenCalledWith('user-1');
    expect(messenger.sendMessage).toHaveBeenCalledWith('user-1', expect.stringContaining('Transporte'), 201);
  });
});
