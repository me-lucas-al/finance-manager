import { ChatMemoryService } from './chat-memory-service';
import { ChatMessageRepository, ChatChannel } from '../../domain/repositories/chat-message-repository';
import { ILanguageModel, ChatOptions, LanguageModelMessage } from '../../domain/models/language-model';
import { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { PeriodLedgerService } from '@/modules/finance/application/services/period-ledger-service';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { calculateSnapshotFromTotals } from '@/modules/finance/domain/services/calculate-snapshot-from-totals';
import { buildAdvisorSystemPrompt } from '../../domain/prompts/advisor-persona-prompt';
import { toPromptPeriod } from '../../domain/prompts/prompt-period';
import { AdvisorToolsFactory } from '../tools/financial-advisor-tools';
import { toLocalDateString } from '@/lib/month';

export type AdvisorChatDeps = {
  chatMemory: ChatMemoryService;
  chatRepo: ChatMessageRepository;
  llm: ILanguageModel;
  periodLedger: PeriodLedgerService;
  portfolio: PortfolioService;
  goalRepo: GoalRepository;
  buildTools: AdvisorToolsFactory;
};

type PreparedChat = { messages: LanguageModelMessage[]; options: ChatOptions };

const MAX_REPLY_TOKENS = 2048;

export class AdvisorChatService {
  constructor(private deps: AdvisorChatDeps) {}

  async respond(userId: string, userMessage: string, channel: ChatChannel): Promise<string> {
    const { messages, options } = await this.prepare(userId, userMessage, channel);
    const reply = await this.deps.llm.chat(messages, options);
    await this.deps.chatRepo.create({ userId, role: 'assistant', content: reply, channel });
    return reply;
  }

  async *stream(userId: string, userMessage: string, channel: ChatChannel): AsyncIterable<string> {
    const { messages, options } = await this.prepare(userId, userMessage, channel);
    let reply = '';
    try {
      for await (const chunk of this.deps.llm.stream(messages, options)) {
        reply += chunk;
        yield chunk;
      }
    } finally {
      if (reply.trim()) await this.deps.chatRepo.create({ userId, role: 'assistant', content: reply, channel });
    }
    if (!reply.trim()) throw new Error('Advisor returned an empty reply');
  }

  private async prepare(userId: string, userMessage: string, channel: ChatChannel): Promise<PreparedChat> {
    const now = new Date();
    const [{ messages, facts }, { window, aggregates }, portfolio] = await Promise.all([
      this.deps.chatMemory.prepareContext(userId),
      this.deps.periodLedger.snapshotData(userId),
      this.deps.portfolio.load(userId),
    ]);
    const goals = await this.deps.goalRepo.findAllByUserIdAndMonth(userId, `${window.referenceMonth}-01`);

    const systemPrompt = buildAdvisorSystemPrompt({
      currentDate: now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      currentIsoDate: toLocalDateString(now),
      period: toPromptPeriod(window, now),
      snapshot: calculateSnapshotFromTotals({ aggregates, goals, portfolio }),
      facts,
      channel,
    });

    const storedMessage = await this.deps.chatRepo.create({ userId, role: 'user', content: userMessage, channel });

    return {
      messages: [...messages, { role: 'user', content: userMessage }],
      options: { systemPrompt, tools: this.deps.buildTools({ userId, turnId: storedMessage.id }), tier: 'flash', maxTokens: MAX_REPLY_TOKENS },
    };
  }
}
