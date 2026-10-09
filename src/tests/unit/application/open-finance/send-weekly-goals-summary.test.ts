import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NewTransaction } from '../../../../modules/open-finance/domain/repositories/transaction-repository';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';

const sendMessageMock = vi.fn();

vi.mock('@/modules/notifications/telegram/TelegramService', () => ({
  TelegramService: { sendMessage: (...args: unknown[]) => sendMessageMock(...args) },
}));

const { SendWeeklyGoalsSummaryUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/send-weekly-goals-summary'
);
const { FakeGoalRepository } = await import('./fake-goal-repository');
const { FakeSavingsGoalRepository } = await import('./fake-savings-goal-repository');
const { FakeTransactionRepository } = await import('./fake-transaction-repository');

function currentMonth(): { filterMonth: string; goalMonth: string } {
  const now = new Date();
  const filterMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return { filterMonth, goalMonth: `${filterMonth}-01` };
}

function newTransaction(overrides: Partial<NewTransaction> = {}): NewTransaction {
  const { filterMonth } = currentMonth();
  return {
    userId: 'user-1',
    pluggyTransactionId: null,
    accountId: null,
    bank: 'Manual',
    amount: 100,
    description: 'Mercado',
    occurredAt: `${filterMonth}-05`,
    category: 'Alimentação',
    categorySuggested: 'Alimentação',
    reason: 'Compras',
    status: 'categorized',
    source: 'manual',
    necessity: 'essencial',
    telegramQuestionMessageId: null,
    ...overrides,
  };
}

describe('SendWeeklyGoalsSummaryUseCase', () => {
  let goalRepository: InstanceType<typeof FakeGoalRepository>;
  let savingsGoalRepository: InstanceType<typeof FakeSavingsGoalRepository>;
  let transactionRepository: InstanceType<typeof FakeTransactionRepository>;
  let useCase: InstanceType<typeof SendWeeklyGoalsSummaryUseCase>;

  beforeEach(() => {
    vi.clearAllMocks();
    goalRepository = new FakeGoalRepository();
    savingsGoalRepository = new FakeSavingsGoalRepository();
    transactionRepository = new FakeTransactionRepository();
    useCase = new SendWeeklyGoalsSummaryUseCase(goalRepository, savingsGoalRepository, transactionRepository);
  });

  it('sends a summary with spending vs goals and savings goal progress', async () => {
    sendMessageMock.mockResolvedValue(1);
    const { goalMonth } = currentMonth();
    await goalRepository.upsert({ userId: 'user-1', month: goalMonth, category: null, targetAmount: 3000 });
    await goalRepository.upsert({ userId: 'user-1', month: goalMonth, category: 'Alimentação', targetAmount: 500 });
    await transactionRepository.create(newTransaction());
    await savingsGoalRepository.create({
      userId: 'user-1',
      title: 'Viagem',
      targetAmount: 5000,
      targetDate: '2026-12-31',
      currentAmount: 1000,
    });

    await useCase.execute('user-1');

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    const [message] = sendMessageMock.mock.calls[0];
    expect(message).toContain('Alimentação');
    expect(message).toContain('Viagem');
  });

  it('generates Pro AI summary when LLM is provided', async () => {
    const fakeLlm = new FakeLanguageModel();
    fakeLlm.nextTextResponse = 'Relatório Semanal Gerado pela IA Pro';
    const aiUseCase = new SendWeeklyGoalsSummaryUseCase(goalRepository, savingsGoalRepository, transactionRepository, fakeLlm);

    await aiUseCase.execute('user-1');

    expect(sendMessageMock).toHaveBeenCalledWith('Relatório Semanal Gerado pela IA Pro');
  });
});
