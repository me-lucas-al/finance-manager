import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMessageMock = vi.fn();

vi.mock('@/modules/notifications/telegram/TelegramService', () => ({
  TelegramService: { sendMessage: (...args: unknown[]) => sendMessageMock(...args) },
}));

const { AskFinancialGoalsUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/ask-financial-goals'
);
const { FakeGoalRepository } = await import('./fake-goal-repository');
const { FakeSavingsGoalRepository } = await import('./fake-savings-goal-repository');
const { FakeGoalPromptRepository } = await import('./fake-goal-prompt-repository');

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

describe('AskFinancialGoalsUseCase', () => {
  let goalRepository: InstanceType<typeof FakeGoalRepository>;
  let savingsGoalRepository: InstanceType<typeof FakeSavingsGoalRepository>;
  let goalPromptRepository: InstanceType<typeof FakeGoalPromptRepository>;
  let useCase: InstanceType<typeof AskFinancialGoalsUseCase>;

  beforeEach(() => {
    vi.clearAllMocks();
    goalRepository = new FakeGoalRepository();
    savingsGoalRepository = new FakeSavingsGoalRepository();
    goalPromptRepository = new FakeGoalPromptRepository();
    useCase = new AskFinancialGoalsUseCase(goalRepository, savingsGoalRepository, goalPromptRepository);
  });

  it('sends the prompt and records the goal_prompt with the returned message id', async () => {
    sendMessageMock.mockResolvedValue(777);

    await useCase.execute('user-1');

    expect(sendMessageMock).toHaveBeenCalled();
    const prompt = await goalPromptRepository.findByTelegramMessageId(777);
    expect(prompt?.userId).toBe('user-1');
    expect(prompt?.answeredAt).toBeNull();
  });

  it('includes current goals and savings goals in the message', async () => {
    sendMessageMock.mockResolvedValue(778);
    await goalRepository.upsert({ userId: 'user-1', month: currentMonth(), category: null, targetAmount: 3000 });
    await savingsGoalRepository.create({
      userId: 'user-1',
      title: 'Viagem',
      targetAmount: 5000,
      targetDate: '2026-12-01',
      currentAmount: 500,
    });

    await useCase.execute('user-1');

    const [message] = sendMessageMock.mock.calls[0];
    expect(message).toContain('Viagem');
    expect(message).toContain('3.000');
  });

  it('does not save a goal_prompt when Telegram is not configured', async () => {
    sendMessageMock.mockResolvedValue(null);

    await useCase.execute('user-1');

    const pending = await goalPromptRepository.findLatestPendingByUserId('user-1');
    expect(pending).toBeNull();
  });
});
