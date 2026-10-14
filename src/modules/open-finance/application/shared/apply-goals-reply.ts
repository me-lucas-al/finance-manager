import { formatCurrency } from '@/lib/format';
import { getCurrentMonth } from '@/lib/month';
import type { GoalsReplyInterpreter } from '../../domain/ports/goals-reply-interpreter';
import type { GoalRepository } from '../../domain/repositories/goal-repository';
import type { SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';
import { applySavingsGoalUpdate } from './apply-savings-goal-update';
import type { ListExpenseCategories } from './expense-categories';

export type ApplyGoalsReplyDeps = {
  goalRepository: GoalRepository;
  savingsGoalRepository: SavingsGoalRepository;
  interpreter: GoalsReplyInterpreter;
  listCategories: ListExpenseCategories;
};

export type GoalsReplyRequest = { userId: string; replyText: string };

const NOTHING_FOUND = 'ℹ️ Não encontrei nenhum objetivo financeiro novo na sua mensagem.';

export async function applyGoalsReply(deps: ApplyGoalsReplyDeps, request: GoalsReplyRequest): Promise<string> {
  const { goalRepository, savingsGoalRepository, interpreter, listCategories } = deps;
  const { userId, replyText } = request;

  const [categories, existingSavingsGoals] = await Promise.all([
    listCategories(userId),
    savingsGoalRepository.findAllActiveByUserId(userId),
  ]);

  const interpretation = await interpreter.interpret({
    replyText,
    categories,
    existingSavingsGoals: existingSavingsGoals.map((goal) => goal.title),
  });

  const confirmationLines: string[] = [];
  const month = `${getCurrentMonth()}-01`;

  if (interpretation.monthlyGeneralTarget !== null) {
    await goalRepository.upsert({ userId, month, category: null, targetAmount: interpretation.monthlyGeneralTarget });
    confirmationLines.push(`🎯 Meta geral do mês: ${formatCurrency(interpretation.monthlyGeneralTarget)}`);
  }

  for (const target of interpretation.monthlyCategoryTargets) {
    await goalRepository.upsert({ userId, month, category: target.category, targetAmount: target.amount });
    confirmationLines.push(`🎯 Meta de ${target.category}: ${formatCurrency(target.amount)}`);
  }

  for (const update of interpretation.savingsGoalUpdates) {
    const line = await applySavingsGoalUpdate(savingsGoalRepository, userId, update, existingSavingsGoals);
    if (line) confirmationLines.push(line);
  }

  if (confirmationLines.length === 0) return NOTHING_FOUND;
  return ['✅ Objetivos atualizados!', ...confirmationLines].join('\n');
}
