import { formatCurrency } from '@/lib/format';
import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import type { Goal, GoalRepository } from '../../domain/repositories/goal-repository';
import type { SavingsGoal, SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';
import type { GoalPromptRepository } from '../../domain/repositories/goal-prompt-repository';
import { getCurrentMonth } from '@/lib/month';

function currentMonth(): string {
  return `${getCurrentMonth()}-01`;
}

function buildPromptMessage(goals: Goal[], savingsGoals: SavingsGoal[]): string {
  const lines = ['🎯 Hora de revisar seus objetivos financeiros!', ''];

  const generalGoal = goals.find((goal) => goal.category === null);
  const categoryGoals = goals.filter((goal) => goal.category !== null);
  if (generalGoal || categoryGoals.length > 0) {
    lines.push('Metas de gasto mensal atuais:');
    if (generalGoal) lines.push(`• Geral: ${formatCurrency(generalGoal.targetAmount)}`);
    for (const goal of categoryGoals) {
      lines.push(`• ${goal.category}: ${formatCurrency(goal.targetAmount)}`);
    }
    lines.push('');
  }

  if (savingsGoals.length > 0) {
    lines.push('Objetivos de economia em andamento:');
    for (const goal of savingsGoals) {
      const progress = `${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}`;
      const deadline = goal.targetDate ? ` até ${goal.targetDate}` : '';
      lines.push(`• ${goal.title}: ${progress}${deadline}`);
    }
    lines.push('');
  }

  lines.push(
    'Responda aqui com o que quer definir ou atualizar (ex: teto de gasto do mês, meta por categoria, valor guardado para algum objetivo, novo objetivo com prazo).',
  );
  return lines.join('\n');
}

export class AskFinancialGoalsUseCase {
  constructor(
    private goalRepository: GoalRepository,
    private savingsGoalRepository: SavingsGoalRepository,
    private goalPromptRepository: GoalPromptRepository,
    private messenger: TelegramMessenger,
  ) {}

  async execute(userId: string): Promise<void> {
    const [goals, savingsGoals] = await Promise.all([
      this.goalRepository.findAllByUserIdAndMonth(userId, currentMonth()),
      this.savingsGoalRepository.findAllActiveByUserId(userId),
    ]);

    const messageId = await this.messenger.sendMessage(userId, buildPromptMessage(goals, savingsGoals));
    if (messageId) {
      await this.goalPromptRepository.create({ userId, telegramMessageId: messageId });
    }
  }
}
