import type { FixedEntry } from '../models/fixed-entry';

export type NewFixedEntry = Omit<FixedEntry, 'id' | 'createdAt' | 'updatedAt' | 'lastLaunchedMonth'>;

export type FixedEntryUpdate = Partial<
  Pick<FixedEntry, 'description' | 'amount' | 'category' | 'dueDay' | 'active' | 'startsOn'>
>;

export interface FixedEntryRepository {
  create(data: NewFixedEntry): Promise<FixedEntry>;
  findById(userId: string, id: string): Promise<FixedEntry | null>;
  findAllByUserId(userId: string): Promise<FixedEntry[]>;
  findUserIdsWithActiveEntries(): Promise<string[]>;
  update(userId: string, id: string, data: FixedEntryUpdate): Promise<FixedEntry>;
  markLaunched(userId: string, id: string, month: string): Promise<void>;
  delete(userId: string, id: string): Promise<void>;
}
