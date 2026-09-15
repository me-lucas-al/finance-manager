import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import type { GoalRepository } from '../../domain/repositories/goal-repository';
import type { SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';
import type { GoalPromptRepository } from '../../domain/repositories/goal-prompt-repository';
import { applyGoalsReply } from '../shared/apply-goals-reply';

export class RecordGoalsReplyUseCase {
  constructor(
    private goalRepository: GoalRepository,
    private savingsGoalRepository: SavingsGoalRepository,
    private goalPromptRepository: GoalPromptRepository,
  ) {}

  async execute(
    userId: string,
    replyText: string,
    goalPromptId?: string,
    incomingMessageId?: number,
  ): Promise<void> {
    const confirmation = await applyGoalsReply({
      userId,
      replyText,
      goalRepository: this.goalRepository,
      savingsGoalRepository: this.savingsGoalRepository,
    });

    if (goalPromptId) {
      await this.goalPromptRepository.markAnswered(goalPromptId);
    }

    await TelegramService.sendMessage(confirmation, incomingMessageId);
  }
}
