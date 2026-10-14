import { RouteTelegramMessageUseCase } from './route-telegram-message';
import { AskFinancialGoalsUseCase } from './ask-financial-goals';
import { RecordGoalsReplyUseCase } from './record-goals-reply';
import { ExtractEntryWithAiUseCase } from '@/modules/finance/application/use-cases/extract-entry-with-ai';
import { buildAdvisorServices } from '@/modules/ai/infrastructure/build-advisor-services';
import { SupabaseGoalPromptRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';

export function buildTelegramRouter(): RouteTelegramMessageUseCase {
  const advisor = buildAdvisorServices();
  const goalPromptRepo = new SupabaseGoalPromptRepository();

  return new RouteTelegramMessageUseCase({
    handleBotCommand: advisor.handleBotCommand,
    registerManualEntry: advisor.registerEntry,
    extractWithAi: new ExtractEntryWithAiUseCase(advisor.llm),
    advisorChat: advisor.advisorChat,
    askFinancialGoals: new AskFinancialGoalsUseCase(advisor.goalRepo, advisor.savingsGoalRepo, goalPromptRepo),
    recordGoalsReply: new RecordGoalsReplyUseCase(advisor.goalRepo, advisor.savingsGoalRepo, goalPromptRepo),
    goalPromptRepo,
  });
}
