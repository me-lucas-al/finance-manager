import { formatCurrency } from '@/lib/format';
import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import type { OutboxRepository } from '@/modules/notifications/domain/outbox-repository';
import type { Transaction, TransactionRepository } from '../../domain/repositories/transaction-repository';

function buildQuestionMessage(transaction: Transaction, categorySuggested: string): string {
  const bankName = transaction.bank.charAt(0).toUpperCase() + transaction.bank.slice(1);
  return [
    `🔔 Nova movimentação — ${bankName}`,
    `💰 ${formatCurrency(Math.abs(transaction.amount))} · ${transaction.description}`,
    `🏷️ Categoria sugerida: ${categorySuggested}`,
    '',
    'Qual o motivo da compra? Responda a esta mensagem para eu categorizar e guardar o motivo.',
  ].join('\n');
}

export class AskTransactionReasonUseCase {
  constructor(
    private transactionRepo: TransactionRepository,
    private messenger: TelegramMessenger,
    private outboxRepo?: OutboxRepository
  ) {}

  async execute(transaction: Transaction): Promise<number | null> {
    if (transaction.telegramQuestionMessageId) return transaction.telegramQuestionMessageId;

    const category = transaction.categorySuggested ?? transaction.category ?? 'Outros';
    const text = buildQuestionMessage(transaction, category);
    const messageId = await this.messenger.sendMessage(transaction.userId, text);

    if (messageId) {
      await this.transactionRepo.update(transaction.id, {
        categorySuggested: category,
        telegramQuestionMessageId: messageId,
        status: 'pending_reason',
      });
      return messageId;
    }

    if (this.outboxRepo) {
      await this.outboxRepo.enqueue({
        userId: transaction.userId,
        channel: 'telegram',
        eventType: 'ask_reason',
        payload: JSON.stringify({ text, transactionId: transaction.id }),
      });
    }

    return null;
  }
}
