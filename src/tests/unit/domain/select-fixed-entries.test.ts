import { describe, it, expect } from 'vitest';
import { selectDueFixedEntries, selectFixedEntriesDueTomorrow } from '@/modules/finance/domain/services/select-fixed-entries';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';

describe('selectDueFixedEntries', () => {
  const rules = [
    makeFixedEntry({ id: 'past', dueDay: 3 }),
    makeFixedEntry({ id: 'today', dueDay: 10 }),
    makeFixedEntry({ id: 'future', dueDay: 11 }),
    makeFixedEntry({ id: 'paused', dueDay: 2, active: false }),
    makeFixedEntry({ id: 'done', dueDay: 4 }),
    makeFixedEntry({ id: 'declined', dueDay: 6, startsOn: '2026-03-08' }),
  ];

  it('selects active, unlaunched rules whose due date has arrived', () => {
    const due = selectDueFixedEntries(rules, new Set(['done']), '2026-03-10');
    expect(due.map((rule) => rule.id)).toEqual(['past', 'today']);
  });

  it('moves the due date to the last day of short months', () => {
    const rule = makeFixedEntry({ id: 'last', dueDay: 31 });
    expect(selectDueFixedEntries([rule], new Set(), '2026-02-27')).toEqual([]);
    expect(selectDueFixedEntries([rule], new Set(), '2026-02-28')).toEqual([rule]);
  });
});

describe('selectFixedEntriesDueTomorrow', () => {
  it('selects only rules due tomorrow', () => {
    const rules = [
      makeFixedEntry({ id: 'tomorrow', dueDay: 11 }),
      makeFixedEntry({ id: 'today', dueDay: 10 }),
      makeFixedEntry({ id: 'later', dueDay: 12 }),
      makeFixedEntry({ id: 'paused', dueDay: 11, active: false }),
    ];
    expect(selectFixedEntriesDueTomorrow(rules, '2026-03-10').map((rule) => rule.id)).toEqual(['tomorrow']);
  });

  it('crosses month boundaries and short months', () => {
    const rule = makeFixedEntry({ dueDay: 31 });
    expect(selectFixedEntriesDueTomorrow([rule], '2026-02-27')).toEqual([rule]);
    expect(selectFixedEntriesDueTomorrow([rule], '2026-03-30')).toEqual([rule]);
    expect(selectFixedEntriesDueTomorrow([makeFixedEntry({ dueDay: 1 })], '2026-12-31')).toHaveLength(1);
  });
});
