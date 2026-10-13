import type { ParsedEntry } from '../../domain/parsers/parse-entry-message';
import type { FixedEntry } from '../../domain/models/fixed-entry';
import type { FixedLaunchAnnouncer } from '../../domain/ports/fixed-entry-messaging';
import { DuplicateFixedLaunchError } from '../../domain/models/fixed-launch-errors';
import { resolveDueDate } from '../../domain/services/resolve-due-date';
import type { RegisterEntryOptions } from '../use-cases/register-manual-entry';

export type FixedLaunchOutcome = 'launched' | 'already_launched';

export interface EntryRegistrar {
  execute(userId: string, entry: ParsedEntry, options?: RegisterEntryOptions): Promise<unknown>;
}

export class FixedEntryLauncher {
  constructor(
    private readonly registrar: EntryRegistrar,
    private readonly announcer: FixedLaunchAnnouncer
  ) {}

  async launch(rule: FixedEntry, month: string): Promise<FixedLaunchOutcome> {
    const dueDate = resolveDueDate(month, rule.dueDay);
    const entry: ParsedEntry = {
      type: rule.kind,
      category: rule.category,
      description: rule.description,
      amount: rule.amount,
      date: dueDate,
    };
    try {
      await this.registrar.execute(rule.userId, entry, { fixed: { fixedEntryId: rule.id, referenceMonth: month } });
    } catch (error) {
      if (error instanceof DuplicateFixedLaunchError) return 'already_launched';
      throw error;
    }
    await this.announcer.announceLaunched(rule, dueDate).catch((error) => {
      console.error('Fixed entry announcement failed:', error);
    });
    return 'launched';
  }
}
