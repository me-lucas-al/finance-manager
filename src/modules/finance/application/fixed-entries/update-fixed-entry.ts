import { toLocalDateString } from '@/lib/month';
import type { FixedEntry, FixedEntryChanges } from '../../domain/models/fixed-entry';
import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { FixedLaunchLookup } from '../../domain/ports/fixed-launch-lookup';
import type { FixedEntryRepository } from '../../domain/repositories/fixed-entry-repository';
import { resolveDueDate } from '../../domain/services/resolve-due-date';
import { validateFixedEntryChanges } from '../../domain/services/validate-fixed-entry';
import type { UpdateEntryUseCase } from '../use-cases/update-entry';
import { findOwnedFixedEntry } from './find-owned-fixed-entry';

export type UpdateFixedEntryInput = FixedEntryChanges & { applyToCurrentMonth?: boolean };

const trimmed = (value: string | undefined): string | undefined => value?.trim();

export class UpdateFixedEntryUseCase {
  constructor(
    private readonly rules: FixedEntryRepository,
    private readonly lookup: FixedLaunchLookup,
    private readonly updateEntry: Pick<UpdateEntryUseCase, 'execute'>,
    private readonly notifier: EntryChangeNotifier,
    private readonly clock: () => Date = () => new Date()
  ) {}

  async execute(userId: string, fixedEntryId: string, input: UpdateFixedEntryInput): Promise<FixedEntry> {
    const { applyToCurrentMonth = false, ...changes } = input;
    validateFixedEntryChanges(changes);
    const current = await findOwnedFixedEntry(this.rules, userId, fixedEntryId);
    const today = toLocalDateString(this.clock());
    const dueDayChanged = changes.dueDay !== undefined && changes.dueDay !== current.dueDay;
    const updated = await this.rules.update(fixedEntryId, {
      ...changes,
      description: trimmed(changes.description),
      category: trimmed(changes.category),
      ...(dueDayChanged ? { startsOn: today } : {}),
    });
    if (applyToCurrentMonth) await this.applyToLaunch(userId, updated, changes, today.slice(0, 7));
    await this.notifier.notifyEntriesChanged(userId);
    return updated;
  }

  private async applyToLaunch(userId: string, rule: FixedEntry, changes: FixedEntryChanges, month: string): Promise<void> {
    const launch = await this.lookup.findLaunch(rule.id, month);
    if (!launch) return;
    await this.updateEntry.execute(userId, launch, {
      amount: changes.amount,
      description: trimmed(changes.description),
      category: trimmed(changes.category),
      date: changes.dueDay === undefined ? undefined : resolveDueDate(month, rule.dueDay),
    });
  }
}
