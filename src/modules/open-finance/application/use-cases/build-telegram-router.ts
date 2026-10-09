import { RouteTelegramMessageUseCase } from './route-telegram-message';
import { AskFinancialGoalsUseCase } from './ask-financial-goals';
import { RecordGoalsReplyUseCase } from './record-goals-reply';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { ExtractEntryWithAiUseCase } from '@/modules/finance/application/use-cases/extract-entry-with-ai';
import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import { UndoLastEntryService } from '@/modules/finance/application/services/undo-last-entry-service';
import { AdvisorChatService } from '@/modules/ai/application/services/advisor-chat-service';
import { ChatMemoryService } from '@/modules/ai/application/services/chat-memory-service';
import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '@/modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '@/modules/users/infrastructure/repositories';
import { DrizzleIncomeRepository, DrizzleInvestmentRepository } from '@/modules/finance/infrastructure/repositories';
import {
  SupabaseGoalPromptRepository,
  SupabaseGoalRepository,
  SupabaseSavingsGoalRepository,
  SupabaseTransactionRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';
import { SupabaseChatMessageRepository } from '@/modules/ai/infrastructure/supabase-chat-message-repository';
import { SupabaseAssistantMemoryRepository } from '@/modules/ai/infrastructure/supabase-assistant-memory-repository';
import { GeminiLanguageModel } from '@/modules/ai/infrastructure/gemini-language-model';

export function buildTelegramRouter(): RouteTelegramMessageUseCase {
  const transactionRepo = new SupabaseTransactionRepository();
  const goalRepo = new SupabaseGoalRepository();
  const savingsGoalRepo = new SupabaseSavingsGoalRepository();
  const goalPromptRepo = new SupabaseGoalPromptRepository();
  const incomeRepo = new DrizzleIncomeRepository();
  const investmentRepo = new DrizzleInvestmentRepository();
  const chatRepo = new SupabaseChatMessageRepository();
  const memoryRepo = new SupabaseAssistantMemoryRepository();
  const llm = new GeminiLanguageModel();

  const resolvePeriod = new ResolveCurrentPeriodUseCase(
    new DrizzlePeriodRepository(),
    new DrizzleSettingRepository()
  );

  const classifyNecessity = new ClassifyNecessityService(transactionRepo, llm);
  const registerEntry = new RegisterManualEntryUseCase(
    transactionRepo,
    incomeRepo,
    investmentRepo,
    resolvePeriod,
    classifyNecessity,
    goalRepo
  );

  const undoService = new UndoLastEntryService(transactionRepo, incomeRepo, investmentRepo);
  const handleBotCommand = new HandleBotCommandUseCase(
    undoService,
    transactionRepo,
    incomeRepo,
    investmentRepo,
    goalRepo
  );

  const chatMemory = new ChatMemoryService(chatRepo, memoryRepo, llm);
  const advisorChat = new AdvisorChatService({
    chatMemory,
    chatRepo,
    memoryRepo,
    llm,
    transactionRepo,
    incomeRepo,
    investmentRepo,
    goalRepo,
    registerEntry,
  });

  return new RouteTelegramMessageUseCase({
    handleBotCommand,
    registerManualEntry: registerEntry,
    extractWithAi: new ExtractEntryWithAiUseCase(llm),
    advisorChat,
    askFinancialGoals: new AskFinancialGoalsUseCase(goalRepo, savingsGoalRepo, goalPromptRepo),
    recordGoalsReply: new RecordGoalsReplyUseCase(goalRepo, savingsGoalRepo, goalPromptRepo),
    goalPromptRepo,
  });
}
