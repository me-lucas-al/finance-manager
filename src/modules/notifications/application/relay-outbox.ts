import type { OutboxMessage, OutboxRepository } from '../domain/outbox-repository';

export type OutboxDispatcher = {
  dispatch(message: OutboxMessage): Promise<void>;
};

export type RelayResult = {
  processed: number;
  succeeded: number;
  failed: number;
};

export class RelayOutboxUseCase {
  constructor(
    private outboxRepo: OutboxRepository,
    private dispatcher: OutboxDispatcher
  ) {}

  async execute(limit = 20): Promise<RelayResult> {
    const pending = await this.outboxRepo.findPending(limit);
    let succeeded = 0;
    let failed = 0;

    for (const message of pending) {
      try {
        await this.dispatcher.dispatch(message);
        await this.outboxRepo.markSent(message.id);
        succeeded += 1;
      } catch (error) {
        const messageText = error instanceof Error ? error.message : String(error);
        await this.outboxRepo.markFailed(message.id, messageText);
        failed += 1;
      }
    }

    return { processed: pending.length, succeeded, failed };
  }
}
