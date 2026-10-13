import type { FixedEntry, FixedEntryView } from '../models/fixed-entry';
import { calculateFixedEntryStatus } from './calculate-fixed-entry-status';
import { resolveDueDate } from './resolve-due-date';

export function buildFixedEntryViews(
  rules: FixedEntry[],
  launchedRuleIds: ReadonlySet<string>,
  month: string
): FixedEntryView[] {
  return rules
    .map((rule) => {
      const dueDate = resolveDueDate(month, rule.dueDay);
      const status = calculateFixedEntryStatus({
        active: rule.active,
        launched: launchedRuleIds.has(rule.id),
        dueDate,
        startsOn: rule.startsOn,
      });
      return { ...rule, dueDate, status };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.description.localeCompare(b.description));
}
