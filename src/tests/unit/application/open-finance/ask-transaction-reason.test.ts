import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AskTransactionReasonUseCase } from '@/modules/open-finance/application/use-cases/ask-transaction-reason';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import { createFakeTelegramMessenger } from '@/tests/fakes/fake-telegram-messenger';

describe('AskTransactionReasonUseCase', () => {
  let transactionRepo: FakeTransactionRepository;
  let messenger: ReturnType<typeof createFakeTelegramMessenger>;
  let useCase: AskTransactionReasonUseCase;

  beforeEach(() => {
    transactionRepo = new FakeTransactionRepository();
    messenger = createFakeTelegramMessenger();
    useCase = new AskTransactionReasonUseCase(transactionRepo, messenger);
  });

  it('asks the user on Telegram and updates transaction status and question id', async () => {
    (messenger.sendMessage as ReturnType<typeof vi.fn>).mockResolvedValueOnce(555);

    const tx = await transactionRepo.create({
      userId: 'user-1',
      pluggyTransactionId: null,
      accountId: null,
      bank: 'Itaú',
      amount: 89.9,
      description: 'Supermercado Central',
      occurredAt: '2026-11-13',
      category: null,
      categorySuggested: 'Mercado',
      reason: null,
      status: 'pending_reason',
      source: 'pluggy',
      necessity: null,
      telegramQuestionMessageId: null,
    });

    const messageId = await useCase.execute(tx);

    expect(messageId).toBe(555);
    expect(messenger.sendMessage).toHaveBeenCalledWith(
      'user-1',
      expect.stringContaining('Supermercado Central')
    );
    expect(messenger.sendMessage).toHaveBeenCalledWith(
      'user-1',
      expect.stringContaining('R$\u00a089,90')
    );

    const updated = await transactionRepo.findById(tx.id);
    expect(updated?.telegramQuestionMessageId).toBe(555);
    expect(updated?.status).toBe('pending_reason');
    expect(updated?.categorySuggested).toBe('Mercado');
  });

  it('skips sending if transaction already has question message id', async () => {
    const tx = await transactionRepo.create({
      userId: 'user-1',
      pluggyTransactionId: null,
      accountId: null,
      bank: 'Itaú',
      amount: 50,
      description: 'Livraria',
      occurredAt: '2026-11-13',
      category: null,
      categorySuggested: 'Educação',
      reason: null,
      status: 'pending_reason',
      source: 'pluggy',
      necessity: null,
      telegramQuestionMessageId: 123,
    });

    const messageId = await useCase.execute(tx);

    expect(messageId).toBe(123);
    expect(messenger.sendMessage).not.toHaveBeenCalled();
  });
});
