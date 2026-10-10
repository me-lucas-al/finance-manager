import { ChatMemoryService } from './chat-memory-service';
import { ChatMessageRepository } from '../../domain/repositories/chat-message-repository';
import { AssistantMemoryRepository } from '../../domain/repositories/assistant-memory-repository';
import { ILanguageModel } from '../../domain/models/language-model';
import { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { IncomeRepository } from '@/modules/finance/domain/repositories/income-repository';
import { InvestmentRepository } from '@/modules/finance/domain/repositories/investment-repository';
import { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { calculateFinancialSnapshot } from '@/modules/finance/domain/services/calculate-financial-snapshot';
import { buildAdvisorSystemPrompt } from '../../domain/prompts/advisor-persona-prompt';
import { buildAdvisorTools } from '../tools/financial-advisor-tools';
import { getCurrentMonth } from '@/lib/month';

export type AdvisorChatDeps = {
  chatMemory: ChatMemoryService;
  chatRepo: ChatMessageRepository;
  memoryRepo: AssistantMemoryRepository;
  llm: ILanguageModel;
  transactionRepo: TransactionRepository;
  incomeRepo: IncomeRepository;
  investmentRepo: InvestmentRepository;
  goalRepo: GoalRepository;
  registerEntry: RegisterManualEntryUseCase;
};

export class AdvisorChatService {
  constructor(private deps: AdvisorChatDeps) {}

  async respond(userId: string, userMessage: string): Promise<string> {
    const curMonth = getCurrentMonth();
    const [{ messages, facts }, txs, incs, invs, goals] = await Promise.all([
      this.deps.chatMemory.prepareContext(userId),
      this.deps.transactionRepo.findAllByUserId(userId, { source: 'manual' }),
      this.deps.incomeRepo.findPageByUserId(userId, { limit: 100, offset: 0 }).then((p) => p.rows),
      this.deps.investmentRepo.findPageByUserId(userId, { limit: 100, offset: 0 }).then((p) => p.rows),
      this.deps.goalRepo.findAllByUserIdAndMonth(userId, `${curMonth}-01`),
    ]);

    const snapshot = calculateFinancialSnapshot({
      transactions: txs,
      incomes: incs,
      investments: invs,
      goals,
      referenceMonth: curMonth,
    });

    const systemPrompt = buildAdvisorSystemPrompt({
      currentDate: new Date().toLocaleDateString('pt-BR'),
      currentMonth: curMonth,
      snapshot,
      facts,
    });

    const tools = buildAdvisorTools({
      userId,
      transactionRepo: this.deps.transactionRepo,
      goalRepo: this.deps.goalRepo,
      memoryRepo: this.deps.memoryRepo,
      registerEntry: this.deps.registerEntry,
    });

    await this.deps.chatRepo.create({ userId, role: 'user', content: userMessage });

    const reply = await this.deps.llm.chat(
      [...messages, { role: 'user', content: userMessage }],
      { systemPrompt, tools, tier: 'flash', maxTokens: 2048 }
    );

    await this.deps.chatRepo.create({ userId, role: 'assistant', content: reply });
    return reply;
  }
}
