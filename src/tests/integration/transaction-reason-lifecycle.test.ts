import { describe, it, expect, vi } from 'vitest';
import { PersistLedgerEntry } from '@/modules/pluggy-sync/application/persist-ledger-entry';
import { AskTransactionReasonUseCase } from '@/modules/open-finance/application/use-cases/ask-transaction-reason';
import { RecordTransactionReasonUseCase } from '@/modules/open-finance/application/use-cases/record-transaction-reason';
import { RouteTelegramMessageUseCase } from '@/modules/open-finance/application/use-cases/route-telegram-message';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import { FakeAssistantMemoryRepository } from '@/tests/fakes/fake-assistant-memory-repository';
import { expenseToEntry } from '@/modules/finance/domain/services/ledger-mapper';
import { buildMovementsData } from '@/modules/finance/domain/services/build-movements-data';
import { monthRange } from '@/modules/finance/domain/models/date-range';
import type { ILanguageModel } from '@/modules/ai/domain/models/language-model';
import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import type { LedgerWriter } from '@/modules/pluggy-sync/domain/ledger-writer';

describe('Transaction reason lifecycle integration', () => {
  it('asks on telegram, saves reason in db and ai memory on reply, and reflects in dashboard', async () => {
    const transactions = new FakeTransactionRepository();
    const assistantMemory = new FakeAssistantMemoryRepository();
    const telegram: TelegramMessenger = {
      sendMessage: vi.fn(async () => 999),
      sendToChat: vi.fn(),
      sendTyping: vi.fn(),
    };
    const languageModel: Partial<ILanguageModel> = {
      generateStructured: vi.fn(async () => ({
        category: 'Alimentação',
        reason: 'Churrasco do fim de semana',
      })) as never,
    };
    const notifier = { notifyEntriesChanged: vi.fn() };

    const asker = new AskTransactionReasonUseCase(transactions, telegram);
    const recorder = new RecordTransactionReasonUseCase({
      transactionRepo: transactions,
      memoryRepo: assistantMemory,
      llm: languageModel as ILanguageModel,
      messenger: telegram,
      notifier,
      listCategories: async () => ['Alimentação', 'Transporte', 'Lazer'],
    });
    const persister = new PersistLedgerEntry({} as LedgerWriter, transactions, asker);
    const router = new RouteTelegramMessageUseCase({
      handleBotCommand: { execute: vi.fn() } as never,
      registerManualEntry: { execute: vi.fn() } as never,
      extractWithAi: { execute: vi.fn() } as never,
      advisorChat: { respond: vi.fn() } as never,
      askFinancialGoals: { execute: vi.fn() } as never,
      recordGoalsReply: { execute: vi.fn() } as never,
      goalPromptRepo: { findByTelegramMessageId: vi.fn(async () => null) } as never,
      transactionRepo: transactions,
      recordTransactionReason: recorder,
      messenger: telegram,
    });

    const synced = await persister.execute(
      'user-1',
      { id: 'acc-1', bank: 'Nubank' } as never,
      { kind: 'expense', externalId: 'pluggy-1', amount: 120, description: 'Mercado Bom', category: 'Alimentação', date: new Date('2026-04-10T12:00:00Z') },
      { id: 'p1', startDate: new Date('2026-04-01T00:00:00Z') }
    );
    expect(synced).toBe(true);
    expect(telegram.sendMessage).toHaveBeenCalledWith('user-1', expect.stringContaining('Mercado Bom'));

    const pendingTx = await transactions.findByPluggyId('pluggy-1');
    expect(pendingTx?.status).toBe('pending_reason');
    expect(pendingTx?.telegramQuestionMessageId).toBe(999);

    await router.execute({
      messageId: 1000,
      text: 'compras para o churrasco com amigos',
      replyToMessageId: 999,
    }, 'user-1');

    const updatedTx = await transactions.findByPluggyId('pluggy-1');
    expect(updatedTx?.status).toBe('categorized');
    expect(updatedTx?.reason).toBe('Churrasco do fim de semana');
    expect(updatedTx?.category).toBe('Alimentação');

    const memories = await assistantMemory.findAllByUserId('user-1');
    expect(memories).toHaveLength(1);
    expect(memories[0].fact).toContain('Churrasco do fim de semana');
    expect(notifier.notifyEntriesChanged).toHaveBeenCalledWith('user-1');

    const entry = expenseToEntry(updatedTx!);
    const movements = buildMovementsData([entry], monthRange('2026-04'));
    expect(movements.transactions[0].reason).toBe('Churrasco do fim de semana');
    expect(movements.transactions[0].status).toBe('categorized');
  });
});
