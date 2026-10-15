import { toLocalDateString } from '@/lib/month';
import type { FixedEntry, NewFixedEntryInput } from '../../domain/models/fixed-entry';
import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { FixedEntryRepository } from '../../domain/repositories/fixed-entry-repository';
import { resolveDueDate } from '../../domain/services/resolve-due-date';
import { validateNewFixedEntry } from '../../domain/services/validate-fixed-entry';
import type { FixedEntryLauncher } from './fixed-entry-launcher';

export type CreateFixedEntryInput = NewFixedEntryInput & { launchThisMonth?: boolean };

export class CreateFixedEntryUseCase {
  constructor(
    private readonly rules: FixedEntryRepository,
    private readonly launcher: FixedEntryLauncher,
    private readonly notifier: EntryChangeNotifier,
    private readonly clock: () => Date = () => new Date()
  ) {}

  async execute(userId: string, input: CreateFixedEntryInput): Promise<FixedEntry> {
    const { launchThisMonth = false, ...data } = input;
    validateNewFixedEntry(data);
    const today = toLocalDateString(this.clock());
    const month = today.slice(0, 7);
    const dueDate = resolveDueDate(month, data.dueDay);
    const rule = await this.rules.create({
      ...data,
      description: data.description.trim(),
      category: data.category.trim(),
      userId,
      active: true,
      startsOn: launchThisMonth ? `${month}-01` : today,
    });
    if (dueDate <= today && (launchThisMonth || dueDate === today)) {
      await this.launcher.launch(rule, month);
      await this.rules.markLaunched(userId, rule.id, month);
    }
    await this.notifier.notifyEntriesChanged(userId);
    return rule;
  }
}
