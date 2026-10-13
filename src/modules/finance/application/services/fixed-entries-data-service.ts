import { getEffectiveUserId } from '@/app/actions/require-session';
import type { FixedEntryView } from '../../domain/models/fixed-entry';
import { noopEntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import { summarizeFixedEntries, type FixedEntriesSummary } from '../../domain/services/summarize-fixed-entries';
import { createFixedEntryServices } from '../../infrastructure/create-fixed-entry-services';

export type FixedEntriesOverview = {
  views: FixedEntryView[];
  summary: FixedEntriesSummary;
};

export async function runFixedEntriesCatchUp(): Promise<void> {
  try {
    const userId = await getEffectiveUserId();
    await createFixedEntryServices(noopEntryChangeNotifier).generate.execute(userId);
  } catch (error) {
    console.error('Fixed entries catch-up failed:', error);
  }
}

export async function listFixedEntries(): Promise<FixedEntryView[]> {
  const userId = await getEffectiveUserId();
  return createFixedEntryServices().listFixedEntries.execute(userId);
}

export async function getFixedEntriesOverview(balance: number): Promise<FixedEntriesOverview> {
  const views = await listFixedEntries();
  return { views, summary: summarizeFixedEntries(views, balance) };
}
