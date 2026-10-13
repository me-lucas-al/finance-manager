import { GeminiLanguageModel } from '@/modules/ai/infrastructure/gemini-language-model';
import { SupabaseGoalRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { EntryActionService } from '../application/services/entry-action-service';
import { buildEntryServices } from './build-entry-services';

function reportUnexpectedError(error: unknown): void {
  console.error('Entry action failed:', error);
}

export function buildEntryActionService(resolveUserId: () => Promise<string>): EntryActionService {
  const { registerEntry, updateEntry, deleteEntry } = buildEntryServices({
    llm: new GeminiLanguageModel(),
    goalRepo: new SupabaseGoalRepository(),
  });

  return new EntryActionService({ resolveUserId, registerEntry, updateEntry, deleteEntry, reportUnexpectedError });
}
