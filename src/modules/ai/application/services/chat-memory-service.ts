import { ChatMessageRepository } from '../../domain/repositories/chat-message-repository';
import { AssistantMemoryRepository } from '../../domain/repositories/assistant-memory-repository';
import { ILanguageModel, LanguageModelMessage } from '../../domain/models/language-model';

export class ChatMemoryService {
  constructor(
    private chatRepo: ChatMessageRepository,
    private memoryRepo: AssistantMemoryRepository,
    private llm: ILanguageModel
  ) {}

  async prepareContext(userId: string): Promise<{ messages: LanguageModelMessage[]; facts: string[] }> {
    await this.compactHistoryIfNeeded(userId);

    const [recentMessages, memoryFacts] = await Promise.all([
      this.chatRepo.findRecentByUserId(userId, 12),
      this.memoryRepo.findAllByUserId(userId),
    ]);

    const formattedMessages: LanguageModelMessage[] = recentMessages.map((m) => ({
      role: m.role === 'summary' ? 'system' : (m.role as 'user' | 'assistant' | 'system'),
      content: m.role === 'summary' ? `[Resumo de conversas anteriores]: ${m.content}` : m.content,
    }));

    const facts = memoryFacts.map((f) => f.fact);
    return { messages: formattedMessages, facts };
  }

  private async compactHistoryIfNeeded(userId: string): Promise<void> {
    const totalCount = await this.chatRepo.countByUserId(userId);
    if (totalCount <= 14) return;

    const allMessages = await this.chatRepo.findRecentByUserId(userId, totalCount);
    if (allMessages.length <= 12) return;

    const olderMessages = allMessages.slice(0, allMessages.length - 12);
    const toDeleteIds = olderMessages.map((m) => m.id);

    const textToSummarize = olderMessages.map((m) => `${m.role}: ${m.content}`).join('\n');
    const summaryPrompt = `Resuma brevemente em no máximo 2 parágrafos os pontos e decisões financeiras principais deste histórico antigo:\n${textToSummarize}`;

    try {
      const summaryText = await this.llm.generateText(summaryPrompt, { tier: 'flash', maxTokens: 250 });
      await this.chatRepo.deleteByIds(toDeleteIds);
      await this.chatRepo.create({
        userId,
        role: 'summary',
        content: summaryText,
      });
    } catch {
      return;
    }
  }
}
