import type { GoalRepository } from '../../domain/repositories/goal-repository';
import type { SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';
import { applyGoalsReply } from '../shared/apply-goals-reply';

// Website equivalent of RecordGoalsReplyUseCase: same free-text interpretation
// and goal/savings-goal upsert logic, but there is no Telegram message to
// reply to and no goal_prompt to correlate — the confirmation goes straight
// back to the caller to render in the site's chat UI.
export class UpdateGoalsFromMessageUseCase {
  constructor(
    private goalRepository: GoalRepository,
    private savingsGoalRepository: SavingsGoalRepository,
  ) {}

  async execute(userId: string, message: string): Promise<string> {
    return applyGoalsReply({
      userId,
      replyText: message,
      goalRepository: this.goalRepository,
      savingsGoalRepository: this.savingsGoalRepository,
    });
  }
}
