import type { EntryRef } from '../models/entry-changes';

export interface FixedLaunchLookup {
  findLaunchedRuleIds(userId: string, month: string): Promise<Set<string>>;
  findLaunch(userId: string, fixedEntryId: string, month: string): Promise<EntryRef | null>;
}
