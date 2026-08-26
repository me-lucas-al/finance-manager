import { interpretReasonReply } from '@/lib/gemini';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import type { TransactionRepository } from '../../domain/repositories/transaction-repository';
import { getExpenseCategories } from '../shared/expense-categories';

// Correlates a Telegram reply back to its transaction via the original
// question's message_id (Update.message.reply_to_message.message_id),
// interprets it with Gemini, and finalizes category/reason on the transaction.
export class RecordTransactionReasonUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  // Returns false when the reply isn't answering a known pending question.
  async execute(originalQuestionMessageId: number, replyText: string, incomingMessageId: number): Promise<boolean> {
    const transaction = await this.transactionRepository.findByTelegramQuestionMessageId(originalQuestionMessageId);
    if (!transaction) return false;

    const categories = await getExpenseCategories(transaction.userId);
    const { category, reason } = await interpretReasonReply({
      replyText,
      categorySuggested: transaction.categorySuggested ?? categories[0],
      categories,
    });

    await this.transactionRepository.update(transaction.id, { category, reason, status: 'categorized' });
    await TelegramService.sendMessage(`✅ Categorizado como "${category}".`, incomingMessageId);
    return true;
  }
}
