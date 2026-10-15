import type { FixedEntry } from '../models/fixed-entry';
import { nextDay, resolveDueDate } from './resolve-due-date';

export function selectDueFixedEntries(
  rules: FixedEntry[],
  launchedRuleIds: ReadonlySet<string>,
  today: string
): FixedEntry[] {
  const month = today.slice(0, 7);
  return rules.filter((rule) => {
    if (!rule.active || launchedRuleIds.has(rule.id)) return false;
    const dueDate = resolveDueDate(month, rule.dueDay);
    return dueDate >= rule.startsOn && dueDate <= today;
  });
}

export function selectFixedEntriesDueTomorrow(rules: FixedEntry[], today: string): FixedEntry[] {
  const tomorrow = nextDay(today);
  const tomorrowMonth = tomorrow.slice(0, 7);
  return rules.filter(
    (rule) =>
      rule.active && tomorrow >= rule.startsOn && resolveDueDate(tomorrowMonth, rule.dueDay) === tomorrow
  );
}
