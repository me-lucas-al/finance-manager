import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NewTransaction } from '../../../../modules/open-finance/domain/repositories/transaction-repository';

const suggestCategoryMock = vi.fn();
const sendMessageMock = vi.fn();
const getExpenseCategoriesMock = vi.fn();

vi.mock('@/lib/gemini', () => ({
  suggestCategory: (...args: unknown[]) => suggestCategoryMock(...args),
}));
vi.mock('@/modules/notifications/telegram/TelegramService', () => ({
  TelegramService: { sendMessage: (...args: unknown[]) => sendMessageMock(...args) },
}));
vi.mock('@/modules/open-finance/application/shared/expense-categories', () => ({
  getExpenseCategories: (...args: unknown[]) => getExpenseCategoriesMock(...args),
}));

const { AskForTransactionReasonUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/ask-transaction-reason'
);
const { FakeTransactionRepository } = await import('./fake-transaction-repository');

function newTransaction(overrides: Partial<NewTransaction> = {}): NewTransaction {
  return {
    userId: 'user-1',
    pluggyTransactionId: 'pluggy-1',
    accountId: 'account-1',
    bank: 'itau',
    amount: 150.5,
    description: 'Supermercado',
    occurredAt: '2026-08-10',
    category: null,
    categorySuggested: null,
    reason: null,
    status: 'pending_reason',
    telegramQuestionMessageId: null,
    ...overrides,
  };
}

describe('AskForTransactionReasonUseCase', () => {
  let transactionRepository: InstanceType<typeof FakeTransactionRepository>;
  let useCase: InstanceType<typeof AskForTransactionReasonUseCase>;

  beforeEach(() => {
    vi.clearAllMocks();
    transactionRepository = new FakeTransactionRepository();
    useCase = new AskForTransactionReasonUseCase(transactionRepository);
  });

  it('saves the suggested category and the Telegram question message id', async () => {
    getExpenseCategoriesMock.mockResolvedValue(['Alimentação', 'Transporte']);
    suggestCategoryMock.mockResolvedValue({ category: 'Alimentação' });
    sendMessageMock.mockResolvedValue(4242);

    const created = await transactionRepository.create(newTransaction());
    await useCase.execute(created);

    const updated = await transactionRepository.findById(created.id);
    expect(updated?.categorySuggested).toBe('Alimentação');
    expect(updated?.telegramQuestionMessageId).toBe(4242);
  });

  it('leaves telegramQuestionMessageId null when Telegram is not configured', async () => {
    getExpenseCategoriesMock.mockResolvedValue(['Alimentação']);
    suggestCategoryMock.mockResolvedValue({ category: 'Alimentação' });
    sendMessageMock.mockResolvedValue(null);

    const created = await transactionRepository.create(newTransaction());
    await useCase.execute(created);

    const updated = await transactionRepository.findById(created.id);
    expect(updated?.categorySuggested).toBe('Alimentação');
    expect(updated?.telegramQuestionMessageId).toBeNull();
  });
});
