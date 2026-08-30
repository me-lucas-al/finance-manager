import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  AskFinancialGoalsUseCase,
} from '../../../../modules/open-finance/application/use-cases/ask-financial-goals';
import type { RecordGoalsReplyUseCase } from '../../../../modules/open-finance/application/use-cases/record-goals-reply';
import type {
  RecordTransactionReasonUseCase,
} from '../../../../modules/open-finance/application/use-cases/record-transaction-reason';
import type { NewTransaction } from '../../../../modules/open-finance/domain/repositories/transaction-repository';

const { RouteTelegramMessageUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/route-telegram-message'
);
const { FakeGoalPromptRepository } = await import('./fake-goal-prompt-repository');
const { FakeTransactionRepository } = await import('./fake-transaction-repository');

function pendingTransaction(overrides: Partial<NewTransaction> = {}): NewTransaction {
  return {
    userId: 'user-1',
    pluggyTransactionId: 'p-1',
    accountId: null,
    bank: 'itau',
    amount: 50,
    description: 'x',
    occurredAt: '2026-08-01',
    category: null,
    categorySuggested: 'Outros',
    reason: null,
    status: 'pending_reason',
    telegramQuestionMessageId: null,
    ...overrides,
  };
}

describe('RouteTelegramMessageUseCase', () => {
  let askFinancialGoals: Pick<AskFinancialGoalsUseCase, 'execute'>;
  let recordGoalsReply: Pick<RecordGoalsReplyUseCase, 'execute'>;
  let recordTransactionReason: Pick<RecordTransactionReasonUseCase, 'execute'>;
  let goalPromptRepository: InstanceType<typeof FakeGoalPromptRepository>;
  let transactionRepository: InstanceType<typeof FakeTransactionRepository>;
  let useCase: InstanceType<typeof RouteTelegramMessageUseCase>;

  beforeEach(() => {
    askFinancialGoals = { execute: vi.fn() };
    recordGoalsReply = { execute: vi.fn() };
    recordTransactionReason = { execute: vi.fn() };
    goalPromptRepository = new FakeGoalPromptRepository();
    transactionRepository = new FakeTransactionRepository();
    useCase = new RouteTelegramMessageUseCase(
      askFinancialGoals as AskFinancialGoalsUseCase,
      recordGoalsReply as RecordGoalsReplyUseCase,
      recordTransactionReason as RecordTransactionReasonUseCase,
      goalPromptRepository,
      transactionRepository,
    );
  });

  it('asks for goals on a bare /goal command', async () => {
    await useCase.execute({ messageId: 1, text: '/goal' }, 'user-1');

    expect(askFinancialGoals.execute).toHaveBeenCalledWith('user-1');
    expect(recordGoalsReply.execute).not.toHaveBeenCalled();
  });

  it('records goals directly when /goal has text', async () => {
    await useCase.execute({ messageId: 2, text: '/goal 3000 no total' }, 'user-1');

    expect(recordGoalsReply.execute).toHaveBeenCalledWith('user-1', '3000 no total', undefined, 2);
  });

  it('routes a reply to a pending goal prompt to RecordGoalsReplyUseCase', async () => {
    const prompt = await goalPromptRepository.create({ userId: 'user-1', telegramMessageId: 50 });

    await useCase.execute({ messageId: 51, text: 'juntei mais 100', replyToMessageId: 50 }, 'user-1');

    expect(recordGoalsReply.execute).toHaveBeenCalledWith('user-1', 'juntei mais 100', prompt.id, 51);
    expect(recordTransactionReason.execute).not.toHaveBeenCalled();
  });

  it('falls back to transaction reason when the reply is not a goal prompt', async () => {
    await useCase.execute({ messageId: 61, text: 'foi lazer', replyToMessageId: 60 }, 'user-1');

    expect(recordTransactionReason.execute).toHaveBeenCalledWith(60, 'foi lazer', 61, 'user-1');
    expect(recordGoalsReply.execute).not.toHaveBeenCalled();
  });

  describe('loose message (no reply_to_message_id)', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('routes to the newest pending goal prompt', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-20T10:00:00Z'));
      await transactionRepository.create(pendingTransaction({ telegramQuestionMessageId: 10 }));
      vi.setSystemTime(new Date('2026-08-20T10:05:00Z'));
      const prompt = await goalPromptRepository.create({ userId: 'user-1', telegramMessageId: 20 });
      vi.useRealTimers();

      await useCase.execute({ messageId: 30, text: 'guardei mais 100' }, 'user-1');

      expect(recordGoalsReply.execute).toHaveBeenCalledWith('user-1', 'guardei mais 100', prompt.id, 30);
      expect(recordTransactionReason.execute).not.toHaveBeenCalled();
    });

    it('routes to the pending transaction when it is newer', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-20T10:00:00Z'));
      await goalPromptRepository.create({ userId: 'user-1', telegramMessageId: 20 });
      vi.setSystemTime(new Date('2026-08-20T10:05:00Z'));
      await transactionRepository.create(pendingTransaction({ telegramQuestionMessageId: 11 }));
      vi.useRealTimers();

      await useCase.execute({ messageId: 31, text: 'foi lazer' }, 'user-1');

      expect(recordTransactionReason.execute).toHaveBeenCalledWith(undefined, 'foi lazer', 31, 'user-1');
      expect(recordGoalsReply.execute).not.toHaveBeenCalled();
    });

    it('does nothing when there is nothing pending', async () => {
      await useCase.execute({ messageId: 32, text: 'oi' }, 'user-1');

      expect(recordGoalsReply.execute).not.toHaveBeenCalled();
      expect(recordTransactionReason.execute).not.toHaveBeenCalled();
    });
  });
});
