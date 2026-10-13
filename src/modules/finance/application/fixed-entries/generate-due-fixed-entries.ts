import { toLocalDateString } from '@/lib/month';
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

    for (const rule of selectDueFixedEntries(rules, launchedRuleIds, today)) {
      try {
        const outcome = await this.launcher.launch(rule, month);
        if (outcome === 'launched') report.launched += 1;
        else report.alreadyLaunched += 1;
      } catch (error) {
        report.failed += 1;
        console.error(`Fixed entry ${rule.id} could not be launched:`, error);
      }
    }
    return report;
  }
}
