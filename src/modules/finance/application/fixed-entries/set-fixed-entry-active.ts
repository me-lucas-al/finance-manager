import { toLocalDateString } from '@/lib/month';
import type { FixedEntry } from '../../domain/models/fixed-entry';
import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { FixedEntryRepository } from '../../domain/repositories/fixed-entry-repository';
import { findOwnedFixedEntry } from './find-owned-fixed-entry';

export class SetFixedEntryActiveUseCase {
  constructor(
    private readonly rules: FixedEntryRepository,
    private readonly notifier: EntryChangeNotifier,
    private readonly clock: () => Date = () => new Date()
  ) {}

  async execute(userId: string, fixedEntryId: string, active: boolean): Promise<FixedEntry> {
    const current = await findOwnedFixedEntry(this.rules, userId, fixedEntryId);
    if (current.active === active) return current;
    const resumesFromToday = active ? { startsOn: toLocalDateString(this.clock()) } : {};
    const updated = await this.rules.update(userId, fixedEntryId, { active, ...resumesFromToday });
    await this.notifier.notifyEntriesChanged(userId);
    return updated;
  }
}
