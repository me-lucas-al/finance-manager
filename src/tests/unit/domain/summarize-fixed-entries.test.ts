import { describe, it, expect } from 'vitest';
import { buildFixedEntryViews } from '@/modules/finance/domain/services/build-fixed-entry-views';
import { summarizeFixedEntries } from '@/modules/finance/domain/services/summarize-fixed-entries';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';

const rules = [
  makeFixedEntry({ id: 'rent', description: 'Aluguel', amount: 1000, dueDay: 5 }),
  makeFixedEntry({ id: 'net', description: 'Internet', amount: 120, dueDay: 20 }),
  makeFixedEntry({ id: 'salary', kind: 'income', description: 'Salário', amount: 5000, dueDay: 25 }),
  makeFixedEntry({ id: 'gym', description: 'Academia', amount: 90, dueDay: 12, active: false }),
];

describe('buildFixedEntryViews', () => {
  it('orders by due date and resolves the status of each rule', () => {
    const views = buildFixedEntryViews(rules, new Set(['rent']), '2026-03');
    expect(views.map((view) => [view.id, view.status])).toEqual([
      ['rent', 'launched'],
      ['gym', 'paused'],
      ['net', 'scheduled'],
      ['salary', 'scheduled'],
    ]);
  });
});

describe('summarizeFixedEntries', () => {
  const views = buildFixedEntryViews(rules, new Set(['rent']), '2026-03');

  it('counts launched against the total, ignoring paused rules', () => {
    const summary = summarizeFixedEntries(views, 0);
    expect(summary.launchedCount).toBe(1);
    expect(summary.totalCount).toBe(3);
    expect(summary.expenseTotal).toBe(1120);
    expect(summary.incomeTotal).toBe(5000);
  });

  it('projects the balance with scheduled incomes and expenses only', () => {
    const summary = summarizeFixedEntries(views, 300);
    expect(summary.scheduledExpense).toBe(120);
    expect(summary.scheduledIncome).toBe(5000);
    expect(summary.projectedBalance).toBe(5180);
  });

  it('returns zeros for no rules', () => {
    expect(summarizeFixedEntries([], 42)).toMatchObject({ totalCount: 0, projectedBalance: 42 });
  });
});
