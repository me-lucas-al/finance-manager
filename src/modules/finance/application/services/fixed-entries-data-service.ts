import type { FixedEntryView } from '../../domain/models/fixed-entry';
import { summarizeFixedEntries, type FixedEntriesSummary } from '../../domain/services/summarize-fixed-entries';
import type { GenerateDueFixedEntriesUseCase } from '../fixed-entries/generate-due-fixed-entries';
import type { ListFixedEntriesUseCase } from '../fixed-entries/list-fixed-entries';

export type FixedEntriesOverview = {
  views: FixedEntryView[];
  summary: FixedEntriesSummary;
};

export type FixedEntriesDataService = {
  catchUp: (userId: string) => Promise<void>;
  list: (userId: string) => Promise<FixedEntryView[]>;
  overview: (userId: string, balance: number) => Promise<FixedEntriesOverview>;
};

export function createFixedEntriesDataService(
  generate: Pick<GenerateDueFixedEntriesUseCase, 'execute'>,
  listEntries: Pick<ListFixedEntriesUseCase, 'execute'>
): FixedEntriesDataService {
  const list = (userId: string) => listEntries.execute(userId);

  return {
    list,
    catchUp: async (userId) => {
      try {
        await generate.execute(userId);
      } catch (error) {
        console.error('Fixed entries catch-up failed:', error);
      }
    },
    overview: async (userId, balance) => {
      const views = await list(userId);
      return { views, summary: summarizeFixedEntries(views, balance) };
    },
  };
}
