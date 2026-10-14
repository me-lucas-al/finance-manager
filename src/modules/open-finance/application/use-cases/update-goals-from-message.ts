import { applyGoalsReply, type ApplyGoalsReplyDeps } from '../shared/apply-goals-reply';

export class UpdateGoalsFromMessageUseCase {
  constructor(private deps: ApplyGoalsReplyDeps) {}

  async execute(userId: string, message: string): Promise<string> {
    return applyGoalsReply(this.deps, { userId, replyText: message });
  }
}
