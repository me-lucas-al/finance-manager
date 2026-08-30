import { formatCurrency } from '@/lib/format';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import type { Goal, GoalRepository } from '../../domain/repositories/goal-repository';
import type { SavingsGoal, SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';
import type { GoalPromptRepository } from '../../domain/repositories/goal-prompt-repository';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
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

// Sends the day-16 / /goal (bare) prompt and records the resulting message id
// in goal_prompts, so the user's reply can be correlated back to it later
// (same role as telegram_question_message_id for transactions).
export class AskFinancialGoalsUseCase {
  constructor(
    private goalRepository: GoalRepository,
    private savingsGoalRepository: SavingsGoalRepository,
    private goalPromptRepository: GoalPromptRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const [goals, savingsGoals] = await Promise.all([
      this.goalRepository.findAllByUserIdAndMonth(userId, currentMonth()),
      this.savingsGoalRepository.findAllActiveByUserId(userId),
    ]);

    const messageId = await TelegramService.sendMessage(buildPromptMessage(goals, savingsGoals));
    if (messageId) {
      await this.goalPromptRepository.create({ userId, telegramMessageId: messageId });
    }
  }
}
