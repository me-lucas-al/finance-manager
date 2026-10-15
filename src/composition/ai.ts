import { AdvisorChatService } from '@/modules/ai/application/services/advisor-chat-service';
import { ChatMemoryService } from '@/modules/ai/application/services/chat-memory-service';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';
import { createAdvisorToolsFactory } from '@/modules/ai/application/tools/financial-advisor-tools';
import { SupabaseAssistantMemoryRepository } from '@/modules/ai/infrastructure/supabase-assistant-memory-repository';
import { SupabaseChatMessageRepository } from '@/modules/ai/infrastructure/supabase-chat-message-repository';
import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import {
  deleteEntry,
  editLastEntry,
  ledgerService,
  portfolioService,
  registerEntry,
  undoLastEntry,
  updateEntry,
} from './finance';
import { creditCardServices, showCreditCards } from './credit-card-advisor';
import {
  createFixedEntry,
  deleteFixedEntry,
  listFixedEntries,
  setFixedEntryActive,
  showFixedEntries,
  updateFixedEntry,
} from './fixed-entries';
import { languageModel } from './language-model';
import {
  goalRepository,
  listExpenseCategories,
  savingsGoalRepository,
  updateGoalsFromMessage,
} from './open-finance';

export const chatMessageRepository = new SupabaseChatMessageRepository();
export const assistantMemoryRepository = new SupabaseAssistantMemoryRepository();

function requireDeletionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is required to confirm deletions');
  return secret;
}

export function buildAdvisorServices() {
  const buildTools = createAdvisorToolsFactory({
    ledger: ledgerService,
    portfolio: portfolioService,
    goalRepo: goalRepository,
    savingsGoalRepo: savingsGoalRepository,
    memoryRepo: assistantMemoryRepository,
    registerEntry,
    updateEntry,
    deleteEntry,
    fixedEntries: {
      list: listFixedEntries,
      create: createFixedEntry,
      update: updateFixedEntry,
      setActive: setFixedEntryActive,
      remove: deleteFixedEntry,
    },
    creditCards: creditCardServices,
    deletion: new DeletionConfirmationService(requireDeletionSecret()),
    goalsUpdater: updateGoalsFromMessage,
    listCategories: listExpenseCategories,
  });

  const advisorChat = new AdvisorChatService({
    chatMemory: new ChatMemoryService(chatMessageRepository, assistantMemoryRepository, languageModel),
    chatRepo: chatMessageRepository,
    llm: languageModel,
    ledger: ledgerService,
    portfolio: portfolioService,
    goalRepo: goalRepository,
    buildTools,
  });

  return {
    llm: languageModel,
    registerEntry,
    advisorChat,
    handleBotCommand: new HandleBotCommandUseCase(
      undoLastEntry,
      editLastEntry,
      ledgerService,
      portfolioService,
      goalRepository,
      showFixedEntries,
      showCreditCards,
    ),
  };
}
