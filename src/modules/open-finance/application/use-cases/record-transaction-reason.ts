import { interpretReasonReply } from '@/lib/gemini';
import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import type { Transaction, TransactionRepository } from '../../domain/repositories/transaction-repository';
import { getExpenseCategories } from '../shared/expense-categories';

function buildConfirmationMessage(category: string, reason: string | null): string {
  const lines = [
    `✅ Movimentação categorizada com sucesso!`,
    `🏷️ Categoria: ${category}`,
  ];
  if (reason) {
    lines.push(`📝 Descrição: ${reason}`);
  }
  return lines.join('\n');
}

export class RecordTransactionReasonUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(
    originalQuestionMessageId: number | null | undefined,
    replyText: string,
    incomingMessageId?: number,
    userId?: string,
  ): Promise<boolean> {
    let transaction: Transaction | null = null;

    if (originalQuestionMessageId) {
      transaction = await this.transactionRepository.findByTelegramQuestionMessageId(originalQuestionMessageId);
    }

    if (!transaction && userId) {
      transaction = await this.transactionRepository.findLatestPendingByUserId(userId);
    }

    if (!transaction) {
      if (incomingMessageId) {
        await TelegramService.sendMessage(
          'ℹ️ Nenhuma despesa pendente aguardando resposta encontrada.',
          incomingMessageId,
        );
      }
      return false;
    }

    const categories = await getExpenseCategories(transaction.userId);
    const { category, reason } = await interpretReasonReply({
      replyText,
      categorySuggested: transaction.categorySuggested ?? categories[0],
      categories,
    });

    await this.transactionRepository.update(transaction.id, { category, reason, status: 'categorized' });
    await TelegramService.sendMessage(buildConfirmationMessage(category, reason), incomingMessageId);
    return true;
  }
}
