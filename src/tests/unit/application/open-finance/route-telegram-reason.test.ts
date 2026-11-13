import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteTelegramMessageUseCase } from '@/modules/open-finance/application/use-cases/route-telegram-message';
import { createFakeTelegramMessenger } from '@/tests/fakes/fake-telegram-messenger';
import { FakeGoalPromptRepository } from '@/tests/fakes/fake-goal-prompt-repository';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import type { RecordTransactionReasonUseCase } from '@/modules/open-finance/application/use-cases/record-transaction-reason';

const messenger = createFakeTelegramMessenger();

describe('RouteTelegramMessageUseCase - transaction reason routing', () => {
  let transactionRepo: FakeTransactionRepository;
  let recordTransactionReason: { execute: ReturnType<typeof vi.fn> };
  let useCase: RouteTelegramMessageUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    transactionRepo = new FakeTransactionRepository();
    recordTransactionReason = { execute: vi.fn().mockResolvedValue(true) };

    useCase = new RouteTelegramMessageUseCase({
      handleBotCommand: { execute: vi.fn() } as never,
      registerManualEntry: { execute: vi.fn() } as never,
      extractWithAi: { execute: vi.fn().mockResolvedValue({ success: false }) } as never,
      advisorChat: { respond: vi.fn() } as never,
      askFinancialGoals: { execute: vi.fn() } as never,
      recordGoalsReply: { execute: vi.fn() } as never,
      goalPromptRepo: new FakeGoalPromptRepository(),
      transactionRepo,
      recordTransactionReason: recordTransactionReason as unknown as RecordTransactionReasonUseCase,
      messenger,
    });
  });

  it('routes reply to a transaction question to recordTransactionReason', async () => {
    const tx = await transactionRepo.create({
      userId: 'user-1',
      pluggyTransactionId: null,
      accountId: null,
      bank: 'Nubank',
      amount: 50,
      description: 'Padaria',
      occurredAt: '2026-11-13',
      category: null,
      categorySuggested: 'Alimentação',
      reason: null,
      status: 'pending_reason',
      source: 'pluggy',
      necessity: null,
      telegramQuestionMessageId: 777,
    });

    await useCase.execute({ messageId: 888, text: 'Café da manhã', replyToMessageId: 777 }, 'user-1');

    expect(recordTransactionReason.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: tx.id }),
      'Café da manhã',
      888
    );
  });

  it('routes message to latest pending transaction when present', async () => {
    const tx = await transactionRepo.create({
      userId: 'user-1',
      pluggyTransactionId: null,
      accountId: null,
      bank: 'Nubank',
      amount: 40,
      description: 'Farmácia',
      occurredAt: '2026-11-13',
      category: null,
      categorySuggested: 'Saúde',
      reason: null,
      status: 'pending_reason',
      source: 'pluggy',
      necessity: null,
      telegramQuestionMessageId: null,
    });

    await useCase.execute({ messageId: 999, text: 'Remédio para gripe' }, 'user-1');

    expect(recordTransactionReason.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: tx.id }),
      'Remédio para gripe',
      999
    );
  });
});
