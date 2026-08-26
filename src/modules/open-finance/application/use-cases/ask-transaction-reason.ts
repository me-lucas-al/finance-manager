import { suggestCategory } from '@/lib/gemini';
import { formatCurrency } from '@/lib/format';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import { SupabaseTransactionRepository } from '../../infrastructure/supabase-repositories';
import type { Transaction } from '../../domain/repositories/transaction-repository';
import { getExpenseCategories } from '../shared/expense-categories';

const transactionRepository = new SupabaseTransactionRepository();

function buildQuestionMessage(transaction: Transaction, categorySuggested: string): string {
  return [
    `💳 Nova transação — ${transaction.bank}`,
    `${formatCurrency(Math.abs(transaction.amount))} · ${transaction.description}`,
    `Categoria sugerida: ${categorySuggested}`,
    '',
    'Responda esta mensagem confirmando a categoria ou contando o motivo da compra.',
  ].join('\n');
}

// Suggests a category with Gemini and asks the reason on Telegram. The
// question's message_id is stored so the user's reply can be correlated back
// to this transaction later (see /api/telegram-webhook).
export async function askForTransactionReason(transaction: Transaction): Promise<void> {
  const categories = await getExpenseCategories(transaction.userId);
  const { category } = await suggestCategory({
    description: transaction.description,
    amount: transaction.amount,
    bank: transaction.bank,
    categories,
  });

  const messageId = await TelegramService.sendMessage(buildQuestionMessage(transaction, category));

  await transactionRepository.update(transaction.id, {
    categorySuggested: category,
    telegramQuestionMessageId: messageId,
  });
}
