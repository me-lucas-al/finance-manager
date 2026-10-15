import { ExtractEntryWithAiUseCase } from '@/modules/finance/application/use-cases/extract-entry-with-ai';
import { RouteTelegramMessageUseCase } from '@/modules/open-finance/application/use-cases/route-telegram-message';
import { buildAdvisorServices } from './ai';
import { cardNameSource } from './credit-card-advisor';
import { askFinancialGoals, goalPromptRepository, recordGoalsReply } from './open-finance';
import { telegramMessenger } from './telegram';

export function buildTelegramRouter(): RouteTelegramMessageUseCase {
  const advisor = buildAdvisorServices();

  return new RouteTelegramMessageUseCase({
    handleBotCommand: advisor.handleBotCommand,
    registerManualEntry: advisor.registerEntry,
    extractWithAi: new ExtractEntryWithAiUseCase(advisor.llm, cardNameSource),
    advisorChat: advisor.advisorChat,
    askFinancialGoals,
    recordGoalsReply,
    goalPromptRepo: goalPromptRepository,
    messenger: telegramMessenger,
  });
}
