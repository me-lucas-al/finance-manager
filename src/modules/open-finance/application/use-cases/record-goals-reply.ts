import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import type { GoalPromptRepository } from '../../domain/repositories/goal-prompt-repository';
import { applyGoalsReply, type ApplyGoalsReplyDeps } from '../shared/apply-goals-reply';

export class RecordGoalsReplyUseCase {
  constructor(
    private applyDeps: ApplyGoalsReplyDeps,
    private goalPromptRepository: GoalPromptRepository,
    private messenger: TelegramMessenger,
  ) {}

  async execute(
    userId: string,
    replyText: string,
    goalPromptId?: string,
    incomingMessageId?: number,
  ): Promise<void> {
    const confirmation = await applyGoalsReply(this.applyDeps, { userId, replyText });

    if (goalPromptId) {
      await this.goalPromptRepository.markAnswered(goalPromptId);
    }

    await this.messenger.sendMessage(userId, confirmation, incomingMessageId);
  }
}
