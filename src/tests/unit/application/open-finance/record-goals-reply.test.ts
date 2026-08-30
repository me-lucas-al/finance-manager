import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GoalsReplyInterpretation } from '../../../../lib/gemini';

const interpretGoalsReplyMock = vi.fn();
const sendMessageMock = vi.fn();
const getExpenseCategoriesMock = vi.fn();

vi.mock('@/lib/gemini', () => ({
  interpretGoalsReply: (...args: unknown[]) => interpretGoalsReplyMock(...args),
}));
vi.mock('@/modules/notifications/telegram/TelegramService', () => ({
  TelegramService: { sendMessage: (...args: unknown[]) => sendMessageMock(...args) },
}));
vi.mock('@/modules/open-finance/application/shared/expense-categories', () => ({
  getExpenseCategories: (...args: unknown[]) => getExpenseCategoriesMock(...args),
}));

const { RecordGoalsReplyUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/record-goals-reply'
);
const { FakeGoalRepository } = await import('./fake-goal-repository');
const { FakeSavingsGoalRepository } = await import('./fake-savings-goal-repository');
const { FakeGoalPromptRepository } = await import('./fake-goal-prompt-repository');

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function emptyInterpretation(): GoalsReplyInterpretation {
  return { monthlyGeneralTarget: null, monthlyCategoryTargets: [], savingsGoalUpdates: [] };
}

describe('RecordGoalsReplyUseCase', () => {
  let goalRepository: InstanceType<typeof FakeGoalRepository>;
  let savingsGoalRepository: InstanceType<typeof FakeSavingsGoalRepository>;
  let goalPromptRepository: InstanceType<typeof FakeGoalPromptRepository>;
  let useCase: InstanceType<typeof RecordGoalsReplyUseCase>;

  beforeEach(() => {
    vi.clearAllMocks();
    goalRepository = new FakeGoalRepository();
    savingsGoalRepository = new FakeSavingsGoalRepository();
    goalPromptRepository = new FakeGoalPromptRepository();
    useCase = new RecordGoalsReplyUseCase(goalRepository, savingsGoalRepository, goalPromptRepository);
    getExpenseCategoriesMock.mockResolvedValue(['Alimentação', 'Transporte']);
  });

  it('creates the monthly general and category goals', async () => {
    interpretGoalsReplyMock.mockResolvedValue({
      ...emptyInterpretation(),
      monthlyGeneralTarget: 3000,
      monthlyCategoryTargets: [{ category: 'Alimentação', amount: 800 }],
    });
    sendMessageMock.mockResolvedValue(1);

    await useCase.execute('user-1', '3000 no total, 800 para alimentação');

    const goals = await goalRepository.findAllByUserIdAndMonth('user-1', currentMonth());
    expect(goals).toHaveLength(2);
    expect(sendMessageMock).toHaveBeenCalledWith(expect.stringContaining('Alimentação'), undefined);
  });

  it('creates a new savings goal when none matches', async () => {
    interpretGoalsReplyMock.mockResolvedValue({
      ...emptyInterpretation(),
      savingsGoalUpdates: [
        { title: 'Viagem', targetAmount: 10000, targetDate: '2026-12-01', contributionAmount: 500 },
      ],
    });
    sendMessageMock.mockResolvedValue(1);

    await useCase.execute('user-1', 'quero juntar 10000 para uma viagem até dezembro, já tenho 500');

    const goals = await savingsGoalRepository.findAllActiveByUserId('user-1');
    expect(goals).toHaveLength(1);
    expect(goals[0].title).toBe('Viagem');
    expect(goals[0].currentAmount).toBe(500);
    expect(goals[0].targetAmount).toBe(10000);
  });

  it('updates an existing savings goal contribution by title match', async () => {
    await savingsGoalRepository.create({
      userId: 'user-1',
      title: 'Viagem para praia',
      targetAmount: 10000,
      targetDate: '2026-12-01',
      currentAmount: 500,
    });
    interpretGoalsReplyMock.mockResolvedValue({
      ...emptyInterpretation(),
      savingsGoalUpdates: [{ title: 'viagem', targetAmount: null, targetDate: null, contributionAmount: 200 }],
    });
    sendMessageMock.mockResolvedValue(1);

    await useCase.execute('user-1', 'consegui guardar mais 200 para a viagem');

    const goals = await savingsGoalRepository.findAllActiveByUserId('user-1');
    expect(goals).toHaveLength(1);
    expect(goals[0].currentAmount).toBe(700);
  });

  it('marks the goal_prompt as answered when provided', async () => {
    const prompt = await goalPromptRepository.create({ userId: 'user-1', telegramMessageId: 42 });
    interpretGoalsReplyMock.mockResolvedValue(emptyInterpretation());
    sendMessageMock.mockResolvedValue(1);

    await useCase.execute('user-1', 'nada específico', prompt.id, 99);

    const updated = await goalPromptRepository.findByTelegramMessageId(42);
    expect(updated?.answeredAt).not.toBeNull();
  });

  it('sends an informational message when nothing was extracted', async () => {
    interpretGoalsReplyMock.mockResolvedValue(emptyInterpretation());
    sendMessageMock.mockResolvedValue(1);

    await useCase.execute('user-1', 'oi tudo bem?');

    expect(sendMessageMock).toHaveBeenCalledWith(expect.stringContaining('Não encontrei'), undefined);
  });
});
