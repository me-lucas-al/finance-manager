import { toLocalDateString } from '@/lib/month';
import type { FixedEntry } from '../../domain/models/fixed-entry';
import type { FixedEntryRepository } from '../../domain/repositories/fixed-entry-repository';
import type { FixedLaunchLookup } from '../../domain/ports/fixed-launch-lookup';
import { selectDueFixedEntries } from '../../domain/services/select-fixed-entries';
import type { FixedEntryLauncher } from './fixed-entry-launcher';

export type GenerationReport = {
  launched: number;
  alreadyLaunched: number;
  failed: number;
};

export class GenerateDueFixedEntriesUseCase {
  constructor(
    private readonly rules: FixedEntryRepository,
    private readonly lookup: FixedLaunchLookup,
    private readonly launcher: FixedEntryLauncher,
    private readonly clock: () => Date = () => new Date()
  ) {}

  async execute(userId: string): Promise<GenerationReport> {
    const today = toLocalDateString(this.clock());
    const month = today.slice(0, 7);
    const [rules, launchedRuleIds] = await Promise.all([
      this.rules.findAllByUserId(userId),
      this.lookup.findLaunchedRuleIds(userId, month),
    ]);
    const report: GenerationReport = { launched: 0, alreadyLaunched: 0, failed: 0 };
    await this.markDetectedLaunches(userId, rules, launchedRuleIds, month);

    for (const rule of selectDueFixedEntries(rules, launchedRuleIds, today)) {
      try {
        const outcome = await this.launcher.launch(rule, month);
        await this.rules.markLaunched(userId, rule.id, month);
        if (outcome === 'launched') report.launched += 1;
        else report.alreadyLaunched += 1;
      } catch (error) {
        report.failed += 1;
        console.error(`Fixed entry ${rule.id} could not be launched:`, error);
      }
    }
    return report;
  }

  private async markDetectedLaunches(
    userId: string,
    rules: FixedEntry[],
    launchedRuleIds: ReadonlySet<string>,
    month: string
  ): Promise<void> {
    const unmarked = rules.filter((rule) => launchedRuleIds.has(rule.id) && rule.lastLaunchedMonth !== month);
    await Promise.all(unmarked.map((rule) => this.rules.markLaunched(userId, rule.id, month)));
  }
}
