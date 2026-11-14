import { describe, it, expect, vi } from 'vitest';
import { AskTransactionReasonUseCase } from '@/modules/open-finance/application/use-cases/ask-transaction-reason';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import { FakeOutboxRepository } from '@/tests/fakes/fake-outbox-repository';
import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';

describe('AskTransactionReasonUseCase Outbox fallback', () => {
  it('enqueues to outbox when telegram delivery returns null', async () => {
    const transactions = new FakeTransactionRepository();
    const outboxRepo = new FakeOutboxRepository();
    const telegram: TelegramMessenger = {
      sendMessage: vi.fn(async () => null),
      sendToChat: vi.fn(),
      sendTyping: vi.fn(),
    };

    const useCase = new AskTransactionReasonUseCase(transactions, telegram, outboxRepo);

    const tx = await transactions.create({
      userId: 'user-1',
      pluggyTransactionId: 'p-1',
      accountId: null,
      bank: 'Nubank',
      amount: 80,
      description: 'Livraria Cultura',
      occurredAt: '2026-11-13',
      category: 'Livros',
      categorySuggested: 'Educação',
      reason: null,
      status: 'pending_reason',
      source: 'pluggy',
      necessity: null,
      telegramQuestionMessageId: null,
    });

    const result = await useCase.execute(tx);

    expect(result).toBeNull();
    expect(outboxRepo.items).toHaveLength(1);
    expect(outboxRepo.items[0].userId).toBe('user-1');
    expect(outboxRepo.items[0].eventType).toBe('ask_reason');
    expect(outboxRepo.items[0].payload).toContain('Livraria Cultura');
    expect(outboxRepo.items[0].payload).toContain(tx.id);
  });
});
