import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GoalsReplyInterpretation } from '@/modules/open-finance/domain/ports/goals-reply-interpreter';
import { createFakeGoalsReplyInterpreter } from '@/tests/fakes/fake-goals-reply-interpreter';

const interpreter = createFakeGoalsReplyInterpreter();
const interpretGoalsReplyMock = interpreter.interpret;
const getExpenseCategoriesMock = vi.fn();

const { UpdateGoalsFromMessageUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/update-goals-from-message'
);
const { FakeGoalRepository } = await import('./fake-goal-repository');
const { FakeSavingsGoalRepository } = await import('./fake-savings-goal-repository');

function emptyInterpretation(): GoalsReplyInterpretation {
  return { monthlyGeneralTarget: null, monthlyCategoryTargets: [], savingsGoalUpdates: [] };
}

describe('UpdateGoalsFromMessageUseCase', () => {
  let goalRepository: InstanceType<typeof FakeGoalRepository>;
  let savingsGoalRepository: InstanceType<typeof FakeSavingsGoalRepository>;
  let useCase: InstanceType<typeof UpdateGoalsFromMessageUseCase>;

  beforeEach(() => {
    vi.clearAllMocks();
    goalRepository = new FakeGoalRepository();
    savingsGoalRepository = new FakeSavingsGoalRepository();
    useCase = new UpdateGoalsFromMessageUseCase({
      goalRepository,
      savingsGoalRepository,
      interpreter,
      listCategories: getExpenseCategoriesMock,
    });
    getExpenseCategoriesMock.mockResolvedValue(['Alimentação', 'Transporte']);
  });

  it('applies the extracted goals and returns a confirmation, without touching Telegram', async () => {
    interpretGoalsReplyMock.mockResolvedValue({
      ...emptyInterpretation(),
      monthlyGeneralTarget: 3000,
    });

    const confirmation = await useCase.execute('user-1', '3000 no total');

    expect(confirmation).toContain('Meta geral do mês');
    const goals = await goalRepository.findAllByUserIdAndMonth(
      'user-1',
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    );
    expect(goals).toHaveLength(1);
  });

  it('returns an informational confirmation when nothing was extracted', async () => {
    interpretGoalsReplyMock.mockResolvedValue(emptyInterpretation());

    const confirmation = await useCase.execute('user-1', 'oi tudo bem?');

    expect(confirmation).toContain('Não encontrei');
  });
});
