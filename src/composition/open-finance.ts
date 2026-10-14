import { GeminiGoalsReplyInterpreter } from '@/modules/ai/infrastructure/gemini/gemini-goals-reply-interpreter';
import type { ApplyGoalsReplyDeps } from '@/modules/open-finance/application/shared/apply-goals-reply';
import { createExpenseBreakdownReader } from '@/modules/open-finance/application/shared/expense-totals';
import { createExpenseCategoriesLister } from '@/modules/open-finance/application/shared/expense-categories';
import { AskFinancialGoalsUseCase } from '@/modules/open-finance/application/use-cases/ask-financial-goals';
import { UpsertGoalUseCase } from '@/modules/open-finance/application/use-cases/manage-goal';
import { RecordGoalsReplyUseCase } from '@/modules/open-finance/application/use-cases/record-goals-reply';
import { RecordItemConnectionUseCase } from '@/modules/open-finance/application/use-cases/record-item-connection';
import { SendWeeklyGoalsSummaryUseCase } from '@/modules/open-finance/application/use-cases/send-weekly-goals-summary';
import { UpdateGoalsFromMessageUseCase } from '@/modules/open-finance/application/use-cases/update-goals-from-message';
import {
  SupabaseAccountRepository,
  SupabaseGoalPromptRepository,
  SupabaseGoalRepository,
  SupabaseSavingsGoalRepository,
  SupabaseTransactionRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';
import { languageModel } from './language-model';
import { telegramMessenger } from './telegram';
import { settingRepository } from './users';

export const transactionRepository = new SupabaseTransactionRepository();
export const accountRepository = new SupabaseAccountRepository();
export const goalRepository = new SupabaseGoalRepository();
export const savingsGoalRepository = new SupabaseSavingsGoalRepository();
export const goalPromptRepository = new SupabaseGoalPromptRepository();

export const listExpenseCategories = createExpenseCategoriesLister(settingRepository);
export const readExpenseBreakdown = createExpenseBreakdownReader(transactionRepository);

export const applyGoalsReplyDeps: ApplyGoalsReplyDeps = {
  goalRepository,
  savingsGoalRepository,
  interpreter: new GeminiGoalsReplyInterpreter(),
  listCategories: listExpenseCategories,
};

export const upsertGoal = new UpsertGoalUseCase(goalRepository);
export const updateGoalsFromMessage = new UpdateGoalsFromMessageUseCase(applyGoalsReplyDeps);
export const recordItemConnection = new RecordItemConnectionUseCase(accountRepository);

export const askFinancialGoals = new AskFinancialGoalsUseCase(
  goalRepository,
  savingsGoalRepository,
  goalPromptRepository,
  telegramMessenger,
);

export const recordGoalsReply = new RecordGoalsReplyUseCase(
  applyGoalsReplyDeps,
  goalPromptRepository,
  telegramMessenger,
);

export const sendWeeklyGoalsSummary = new SendWeeklyGoalsSummaryUseCase(
  goalRepository,
  savingsGoalRepository,
  transactionRepository,
  telegramMessenger,
  languageModel,
);
