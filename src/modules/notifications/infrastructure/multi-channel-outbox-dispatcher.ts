import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import type { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { OutboxDispatcher } from '../application/relay-outbox';
import type { OutboxMessage } from '../domain/outbox-repository';

type BroadcastSender = { sendMessage(userId: string, text: string): Promise<boolean> };

type ParsedPayload = {
  text: string;
  replyToMessageId?: number;
  transactionId?: string;
};

function extractPayload(payload: string): ParsedPayload {
  try {
    const parsed = JSON.parse(payload) as ParsedPayload;
    if (parsed && typeof parsed.text === 'string') {
      return parsed;
    }
  } catch {}
  return { text: payload };
}

export class MultiChannelOutboxDispatcher implements OutboxDispatcher {
  constructor(
    private telegram: TelegramMessenger,
    private broadcast?: BroadcastSender,
    private transactionRepo?: TransactionRepository
  ) {}

  async dispatch(message: OutboxMessage): Promise<void> {
    const { text, replyToMessageId, transactionId } = extractPayload(message.payload);

    if (message.channel === 'all' && this.broadcast) {
      await this.broadcast.sendMessage(message.userId, text);
      return;
    }

    const result = await this.telegram.sendMessage(message.userId, text, replyToMessageId);
    if (result === null) {
      throw new Error(`Failed to send telegram message to user ${message.userId}`);
    }

    if (transactionId && this.transactionRepo) {
      await this.transactionRepo.update(transactionId, {
        telegramQuestionMessageId: result,
        status: 'pending_reason',
      });
    }
  }
}
