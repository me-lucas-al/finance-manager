import type { ILanguageModel } from '@/modules/ai/domain/models/language-model';
import type { AssistantMemoryRepository } from '@/modules/ai/domain/repositories/assistant-memory-repository';
import type { EntryChangeNotifier } from '@/modules/finance/domain/ports/entry-change-notifier';
import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import type { Transaction, TransactionRepository } from '../../domain/repositories/transaction-repository';

export type RecordReasonDeps = {
  transactionRepo: TransactionRepository;
  memoryRepo: AssistantMemoryRepository;
  llm: ILanguageModel;
  messenger: TelegramMessenger;
  notifier: EntryChangeNotifier;
  listCategories: (userId: string) => Promise<string[]>;
};

type ReasonInterpretation = { category: string; reason: string };

function buildPrompt(tx: Transaction, reply: string, categories: string[]): string {
  return [
    'O usuário respondeu, no Telegram, a uma pergunta sobre uma transação financeira.',
    `Descrição original: "${tx.description}"`,
    `Valor: R$ ${Math.abs(tx.amount).toFixed(2)}`,
    `Categoria sugerida: "${tx.categorySuggested ?? tx.category ?? 'Outros'}"`,
    `Resposta do usuário: "${reply}"`,
    'Se a resposta confirmar ou não mencionar outra categoria, mantenha a sugerida.',
    'Se a resposta indicar claramente outra categoria (dentre as disponíveis), use essa.',
    'Extraia o motivo da compra com clareza a partir da resposta. Se for apenas confirmação (ex: "ok", "sim"), use a descrição original como motivo.',
    `Categorias disponíveis: ${categories.join(', ')}`,
  ].join('\n');
}

function buildConfirmation(category: string, reason: string): string {
  return [
    '✅ Movimentação categorizada com sucesso!',
    `🏷️ Categoria: ${category}`,
    `📝 Motivo: ${reason}`,
  ].join('\n');
}

export class RecordTransactionReasonUseCase {
  constructor(private deps: RecordReasonDeps) {}

  async execute(transaction: Transaction, replyText: string, incomingMessageId?: number): Promise<boolean> {
    const categories = await this.deps.listCategories(transaction.userId);
    const schema = '{\n  "category": "string",\n  "reason": "string"\n}';
    let interpretation: ReasonInterpretation;

    try {
      interpretation = await this.deps.llm.generateStructured<ReasonInterpretation>(
        buildPrompt(transaction, replyText, categories),
        schema,
        { tier: 'flash' }
      );
    } catch {
      interpretation = {
        category: transaction.categorySuggested ?? categories[0] ?? 'Outros',
        reason: replyText.trim(),
      };
    }

    const { category, reason } = interpretation;
    const finalReason = reason?.trim() || replyText.trim();
    const finalCategory = categories.includes(category)
      ? category
      : (transaction.categorySuggested ?? categories[0] ?? 'Outros');

    await this.deps.transactionRepo.update(transaction.id, {
      category: finalCategory,
      reason: finalReason,
      status: 'categorized',
    });

    const amountFormatted = Math.abs(transaction.amount).toFixed(2);
    await this.deps.memoryRepo.create({
      userId: transaction.userId,
      fact: `Gasto de R$ ${amountFormatted} em "${transaction.description}" (${finalCategory}): ${finalReason}`,
    });

    await this.deps.notifier.notifyEntriesChanged(transaction.userId);
    await this.deps.messenger.sendMessage(
      transaction.userId,
      buildConfirmation(finalCategory, finalReason),
      incomingMessageId
    );

    return true;
  }
}
