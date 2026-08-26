import { interpretReasonReply } from '@/lib/gemini';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import { SupabaseTransactionRepository } from '../../infrastructure/supabase-repositories';
import { getExpenseCategories } from '../shared/expense-categories';

const transactionRepository = new SupabaseTransactionRepository();

// Correlates a Telegram reply back to its transaction via the original
// question's message_id (Update.message.reply_to_message.message_id),
// interprets it with Gemini, and finalizes category/reason on the transaction.
// Returns false when the reply isn't answering a known pending question.
export async function recordTransactionReason(
  originalQuestionMessageId: number,
  replyText: string,
  incomingMessageId: number,
): Promise<boolean> {
  const transaction = await transactionRepository.findByTelegramQuestionMessageId(originalQuestionMessageId);
  if (!transaction) return false;

  const categories = await getExpenseCategories(transaction.userId);
  const { category, reason } = await interpretReasonReply({
    replyText,
    categorySuggested: transaction.categorySuggested ?? categories[0],
    categories,
  });

  await transactionRepository.update(transaction.id, { category, reason, status: 'categorized' });
  await TelegramService.sendMessage(`✅ Categorizado como "${category}".`, incomingMessageId);
  return true;
}
