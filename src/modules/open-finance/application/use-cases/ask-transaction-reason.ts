import { suggestCategory } from '@/lib/gemini';
import { formatCurrency } from '@/lib/format';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import type { Transaction, TransactionRepository } from '../../domain/repositories/transaction-repository';
import { getExpenseCategories } from '../shared/expense-categories';

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
export class AskForTransactionReasonUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(transaction: Transaction): Promise<void> {
    const categories = await getExpenseCategories(transaction.userId);
    const { category } = await suggestCategory({
      description: transaction.description,
      amount: transaction.amount,
      bank: transaction.bank,
      categories,
    });

    const messageId = await TelegramService.sendMessage(buildQuestionMessage(transaction, category));

    await this.transactionRepository.update(transaction.id, {
      categorySuggested: category,
      telegramQuestionMessageId: messageId,
    });
  }
}
