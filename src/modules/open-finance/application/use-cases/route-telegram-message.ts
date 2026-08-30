import type { GoalPromptRepository } from '../../domain/repositories/goal-prompt-repository';
import type { TransactionRepository } from '../../domain/repositories/transaction-repository';
import type { AskFinancialGoalsUseCase } from './ask-financial-goals';
import type { RecordGoalsReplyUseCase } from './record-goals-reply';
import type { RecordTransactionReasonUseCase } from './record-transaction-reason';

export type TelegramIncomingMessage = {
  messageId: number;
  text: string;
  replyToMessageId?: number;
};

const GOAL_COMMAND = '/goal';

// Single decision point for the Telegram webhook, replacing the old
// "everything is a transaction reason" routing now that the bot also handles
// financial goals. Kept here (instead of inline in route.ts) so the webhook
// route itself stays thin.
export class RouteTelegramMessageUseCase {
  constructor(
    private askFinancialGoals: AskFinancialGoalsUseCase,
    private recordGoalsReply: RecordGoalsReplyUseCase,
    private recordTransactionReason: RecordTransactionReasonUseCase,
    private goalPromptRepository: GoalPromptRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async execute(message: TelegramIncomingMessage, userId: string): Promise<void> {
    const trimmed = message.text.trim();

    if (trimmed.toLowerCase().startsWith(GOAL_COMMAND)) {
      const remaining = trimmed.slice(GOAL_COMMAND.length).trim();
      if (!remaining) {
        await this.askFinancialGoals.execute(userId);
      } else {
        await this.recordGoalsReply.execute(userId, remaining, undefined, message.messageId);
      }
      return;
    }

    if (message.replyToMessageId) {
      const goalPrompt = await this.goalPromptRepository.findByTelegramMessageId(message.replyToMessageId);
      if (goalPrompt && !goalPrompt.answeredAt) {
        await this.recordGoalsReply.execute(userId, message.text, goalPrompt.id, message.messageId);
        return;
      }

      await this.recordTransactionReason.execute(message.replyToMessageId, message.text, message.messageId, userId);
      return;
    }

    const [pendingGoalPrompt, pendingTransaction] = await Promise.all([
      this.goalPromptRepository.findLatestPendingByUserId(userId),
      this.transactionRepository.findLatestPendingByUserId(userId),
    ]);

    if (!pendingGoalPrompt && !pendingTransaction) {
      return;
    }

    const goalIsNewer =
      !!pendingGoalPrompt && (!pendingTransaction || pendingGoalPrompt.createdAt > pendingTransaction.createdAt);

    if (goalIsNewer && pendingGoalPrompt) {
      await this.recordGoalsReply.execute(userId, message.text, pendingGoalPrompt.id, message.messageId);
      return;
    }

    await this.recordTransactionReason.execute(undefined, message.text, message.messageId, userId);
  }
}
