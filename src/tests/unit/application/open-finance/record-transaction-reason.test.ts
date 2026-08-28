import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NewTransaction } from '../../../../modules/open-finance/domain/repositories/transaction-repository';

const interpretReasonReplyMock = vi.fn();
const sendMessageMock = vi.fn();
const getExpenseCategoriesMock = vi.fn();

vi.mock('@/lib/gemini', () => ({
  interpretReasonReply: (...args: unknown[]) => interpretReasonReplyMock(...args),
}));
vi.mock('@/modules/notifications/telegram/TelegramService', () => ({
  TelegramService: { sendMessage: (...args: unknown[]) => sendMessageMock(...args) },
}));
vi.mock('@/modules/open-finance/application/shared/expense-categories', () => ({
  getExpenseCategories: (...args: unknown[]) => getExpenseCategoriesMock(...args),
}));

const { RecordTransactionReasonUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/record-transaction-reason'
);
const { FakeTransactionRepository } = await import('./fake-transaction-repository');

function newTransaction(overrides: Partial<NewTransaction> = {}): NewTransaction {
  return {
    userId: 'user-1',
    pluggyTransactionId: 'pluggy-1',
    accountId: 'account-1',
    bank: 'nubank',
    amount: 89.9,
    description: 'Restaurante',
    occurredAt: '2026-08-10',
    category: null,
    categorySuggested: 'Alimentação',
    reason: null,
    status: 'pending_reason',
    telegramQuestionMessageId: 42,
    ...overrides,
  };
}

describe('RecordTransactionReasonUseCase', () => {
  let transactionRepository: InstanceType<typeof FakeTransactionRepository>;
  let useCase: InstanceType<typeof RecordTransactionReasonUseCase>;

  beforeEach(() => {
    vi.clearAllMocks();
    transactionRepository = new FakeTransactionRepository();
    useCase = new RecordTransactionReasonUseCase(transactionRepository);
  });

  it('returns false and informs the user when no transaction is waiting for that question', async () => {
    const result = await useCase.execute(999, 'foi um presente', 111, 'user-1');
    expect(result).toBe(false);
    expect(sendMessageMock).toHaveBeenCalledWith(
      expect.stringContaining('Nenhuma despesa pendente'),
      111,
    );
  });

  it('interprets the reply, finalizes the transaction and sends a confirmation', async () => {
    getExpenseCategoriesMock.mockResolvedValue(['Alimentação', 'Lazer']);
    interpretReasonReplyMock.mockResolvedValue({ category: 'Lazer', reason: 'Jantar com amigos' });
    sendMessageMock.mockResolvedValue(555);

    const created = await transactionRepository.create(newTransaction());
    const result = await useCase.execute(42, 'na verdade foi lazer, jantar com amigos', 100);

    expect(result).toBe(true);
    const updated = await transactionRepository.findById(created.id);
    expect(updated?.category).toBe('Lazer');
    expect(updated?.reason).toBe('Jantar com amigos');
    expect(updated?.status).toBe('categorized');
    expect(sendMessageMock).toHaveBeenCalledWith(expect.stringContaining('Lazer'), 100);
    expect(sendMessageMock).toHaveBeenCalledWith(expect.stringContaining('Jantar com amigos'), 100);
  });

  it('correlates by latest pending transaction when no reply_to_message_id is provided', async () => {
    getExpenseCategoriesMock.mockResolvedValue(['Alimentação', 'Transporte']);
    interpretReasonReplyMock.mockResolvedValue({ category: 'Transporte', reason: 'Uber para o trabalho' });
    sendMessageMock.mockResolvedValue(556);

    const created = await transactionRepository.create(
      newTransaction({ telegramQuestionMessageId: null, description: 'Uber' }),
    );
    const result = await useCase.execute(null, 'foi uber para o trabalho', 101, 'user-1');

    expect(result).toBe(true);
    const updated = await transactionRepository.findById(created.id);
    expect(updated?.category).toBe('Transporte');
    expect(updated?.reason).toBe('Uber para o trabalho');
    expect(updated?.status).toBe('categorized');
  });
});
