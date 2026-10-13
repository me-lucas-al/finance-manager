import { buildEntryServices } from '@/modules/finance/infrastructure/build-entry-services';
import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';
import { UpdateGoalsFromMessageUseCase } from '@/modules/open-finance/application/use-cases/update-goals-from-message';
import {
  SupabaseGoalRepository,
  SupabaseSavingsGoalRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';
import { AdvisorChatService } from '../application/services/advisor-chat-service';
import { ChatMemoryService } from '../application/services/chat-memory-service';
import { DeletionConfirmationService } from '../application/services/deletion-confirmation-service';
import { createAdvisorToolsFactory } from '../application/tools/financial-advisor-tools';
import { GeminiLanguageModel } from './gemini-language-model';
import { SupabaseAssistantMemoryRepository } from './supabase-assistant-memory-repository';
import { SupabaseChatMessageRepository } from './supabase-chat-message-repository';

function requireDeletionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is required to confirm deletions');
  return secret;
}

export function buildAdvisorServices() {
  const llm = new GeminiLanguageModel();
  const goalRepo = new SupabaseGoalRepository();
  const savingsGoalRepo = new SupabaseSavingsGoalRepository();
  const chatRepo = new SupabaseChatMessageRepository();
  const memoryRepo = new SupabaseAssistantMemoryRepository();
  const entries = buildEntryServices({ llm, goalRepo });

  const buildTools = createAdvisorToolsFactory({
    ledger: entries.ledger,
    goalRepo,
    savingsGoalRepo,
    memoryRepo,
    registerEntry: entries.registerEntry,
    updateEntry: entries.updateEntry,
    deleteEntry: entries.deleteEntry,
    deletion: new DeletionConfirmationService(requireDeletionSecret()),
    goalsUpdater: new UpdateGoalsFromMessageUseCase(goalRepo, savingsGoalRepo),
    listCategories: getExpenseCategories,
  });

  const advisorChat = new AdvisorChatService({
    chatMemory: new ChatMemoryService(chatRepo, memoryRepo, llm),
    chatRepo,
    llm,
    ledger: entries.ledger,
    goalRepo,
    buildTools,
  });

  return {
    llm,
    goalRepo,
    savingsGoalRepo,
    chatRepo,
    registerEntry: entries.registerEntry,
    advisorChat,
    handleBotCommand: new HandleBotCommandUseCase(entries.undoService, entries.ledger, goalRepo),
  };
}
