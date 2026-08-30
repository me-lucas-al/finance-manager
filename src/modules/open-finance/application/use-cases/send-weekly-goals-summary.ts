import { formatCurrency } from '@/lib/format';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import type { Goal, GoalRepository } from '../../domain/repositories/goal-repository';
import type { SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';
import type { TransactionRepository } from '../../domain/repositories/transaction-repository';
import { aggregateMonthlySpending } from '../shared/monthly-spending';

function currentMonth(): { filterMonth: string; goalMonth: string } {
  const now = new Date();
  const filterMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return { filterMonth, goalMonth: `${filterMonth}-01` };
}

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function buildSummaryMessage(params: {
  totalSpent: number;
  spendByCategory: Map<string, number>;
  generalTarget: number | null;
  categoryTargets: { category: string; targetAmount: number }[];
  savingsGoals: { title: string; currentAmount: number; targetAmount: number; targetDate: string | null }[];
}): string {
  const { totalSpent, spendByCategory, generalTarget, categoryTargets, savingsGoals } = params;
  const lines = ['📊 Resumo semanal dos seus objetivos', '', `Gasto no mês até agora: ${formatCurrency(totalSpent)}`];

  if (generalTarget !== null) {
    lines.push(`Meta geral: ${formatCurrency(generalTarget)}`);
  }
  for (const target of categoryTargets) {
    const spent = spendByCategory.get(target.category) ?? 0;
    lines.push(`• ${target.category}: ${formatCurrency(spent)} de ${formatCurrency(target.targetAmount)}`);
  }

  if (savingsGoals.length > 0) {
    lines.push('', 'Objetivos de economia:');
    for (const goal of savingsGoals) {
      const progress = `${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}`;
      const deadline = goal.targetDate ? ` (${daysUntil(goal.targetDate)} dias restantes)` : '';
      lines.push(`• ${goal.title}: ${progress}${deadline}`);
    }
  }

  return lines.join('\n');
}

// Weekly Telegram summary (Monday cron): spend-so-far vs monthly goals and
// savings goal progress. Purely deterministic formatting, no Gemini call —
// same style as record-transaction-reason's buildConfirmationMessage.
export class SendWeeklyGoalsSummaryUseCase {
  constructor(
    private goalRepository: GoalRepository,
    private savingsGoalRepository: SavingsGoalRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const { filterMonth, goalMonth } = currentMonth();
    const [transactions, goals, savingsGoals] = await Promise.all([
      this.transactionRepository.findAllByUserId(userId, { month: filterMonth }),
      this.goalRepository.findAllByUserIdAndMonth(userId, goalMonth),
      this.savingsGoalRepository.findAllActiveByUserId(userId),
    ]);

    const categorized = transactions.filter((transaction) => transaction.status === 'categorized');
    const { totalSpent, spendByCategory } = aggregateMonthlySpending(categorized);

    const generalGoal = goals.find((goal) => goal.category === null) ?? null;
    const categoryTargets = goals
      .filter((goal): goal is Goal & { category: string } => goal.category !== null)
      .map((goal) => ({ category: goal.category, targetAmount: goal.targetAmount }));

    const message = buildSummaryMessage({
      totalSpent,
      spendByCategory,
      generalTarget: generalGoal?.targetAmount ?? null,
      categoryTargets,
      savingsGoals,
    });

    await TelegramService.sendMessage(message);
  }
}
