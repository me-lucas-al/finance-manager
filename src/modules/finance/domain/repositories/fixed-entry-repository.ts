import type { FixedEntry } from '../models/fixed-entry';

export type NewFixedEntry = Omit<FixedEntry, 'id' | 'createdAt' | 'updatedAt'>;

export type FixedEntryUpdate = Partial<
  Pick<FixedEntry, 'description' | 'amount' | 'category' | 'dueDay' | 'active' | 'startsOn'>
>;

export interface FixedEntryRepository {
  create(data: NewFixedEntry): Promise<FixedEntry>;
  findById(id: string): Promise<FixedEntry | null>;
  findAllByUserId(userId: string): Promise<FixedEntry[]>;
  findUserIdsWithActiveEntries(): Promise<string[]>;
  update(id: string, data: FixedEntryUpdate): Promise<FixedEntry>;
  delete(id: string): Promise<void>;
}
