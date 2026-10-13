import { toLocalDateString } from '@/lib/month';
import type { FixedEntryView } from '../../domain/models/fixed-entry';
import type { FixedLaunchLookup } from '../../domain/ports/fixed-launch-lookup';
import type { FixedEntryRepository } from '../../domain/repositories/fixed-entry-repository';
import { buildFixedEntryViews } from '../../domain/services/build-fixed-entry-views';

export class ListFixedEntriesUseCase {
  constructor(
    private readonly rules: FixedEntryRepository,
    private readonly lookup: FixedLaunchLookup,
    private readonly clock: () => Date = () => new Date()
  ) {}

  async execute(userId: string): Promise<FixedEntryView[]> {
    const month = toLocalDateString(this.clock()).slice(0, 7);
    const [rules, launchedRuleIds] = await Promise.all([
      this.rules.findAllByUserId(userId),
      this.lookup.findLaunchedRuleIds(userId, month),
    ]);
    return buildFixedEntryViews(rules, launchedRuleIds, month);
  }
}
