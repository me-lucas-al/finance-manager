import { getCurrentMonth } from '@/lib/month';
import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { FixedLaunchLookup } from '../../domain/ports/fixed-launch-lookup';
import type { FixedEntryRepository } from '../../domain/repositories/fixed-entry-repository';
import type { DeleteEntryUseCase } from '../use-cases/delete-entry';
import { findOwnedFixedEntry } from './find-owned-fixed-entry';

export type DeleteFixedEntryOptions = { alsoDeleteCurrentMonth?: boolean };

export class DeleteFixedEntryUseCase {
  constructor(
    private readonly rules: FixedEntryRepository,
    private readonly lookup: FixedLaunchLookup,
    private readonly deleteEntry: Pick<DeleteEntryUseCase, 'execute'>,
    private readonly notifier: EntryChangeNotifier,
    private readonly currentMonth: () => string = getCurrentMonth
  ) {}

  async execute(userId: string, fixedEntryId: string, options: DeleteFixedEntryOptions = {}): Promise<void> {
    await findOwnedFixedEntry(this.rules, userId, fixedEntryId);
    if (options.alsoDeleteCurrentMonth) await this.deleteCurrentMonthLaunch(userId, fixedEntryId);
    await this.rules.delete(fixedEntryId);
    await this.notifier.notifyEntriesChanged(userId);
  }

  private async deleteCurrentMonthLaunch(userId: string, fixedEntryId: string): Promise<void> {
    const launch = await this.lookup.findLaunch(fixedEntryId, this.currentMonth());
    if (launch) await this.deleteEntry.execute(userId, launch);
  }
}
