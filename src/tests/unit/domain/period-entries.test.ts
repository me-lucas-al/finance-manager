import { describe, it, expect } from 'vitest';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { entriesOfPeriod, scopeOfPeriod } from '@/modules/periods/domain/services/period-entries';
import type { PeriodView } from '@/modules/periods/domain/models/period-view';

const entry = (id: string, kind: LedgerEntry['kind'], date: string): LedgerEntry => ({
  id,
  kind,
  date,
  description: id,
  category: 'Outros',
  amount: 10,
  account: 'Manual',
});

const period: PeriodView = { id: 'p1', startDate: '2026-01-15', endDate: '2026-02-14', closed: true };

const ledger: LedgerEntry[] = [
  entry('e-before', 'expense', '2026-01-14'),
  entry('e-start', 'expense', '2026-01-15'),
  entry('e-end', 'expense', '2026-02-14'),
  entry('e-after', 'expense', '2026-02-15'),
  entry('i-in', 'income', '2026-01-20'),
  entry('i-other', 'income', '2026-01-20'),
  entry('v-in', 'investment', '2026-03-01'),
  entry('v-other', 'investment', '2026-01-20'),
];

const refs = [
  { periodId: 'p1', kind: 'income' as const, id: 'i-in' },
  { periodId: 'p2', kind: 'income' as const, id: 'i-other' },
  { periodId: 'p1', kind: 'investment' as const, id: 'v-in' },
  { periodId: 'p2', kind: 'investment' as const, id: 'v-other' },
];

describe('entriesOfPeriod', () => {
  const ids = () => entriesOfPeriod(ledger, scopeOfPeriod(period, refs)).map((item) => item.id);

  it('keeps expenses inside the date range, boundaries included', () => {
    expect(ids()).toEqual(expect.arrayContaining(['e-start', 'e-end']));
    expect(ids()).not.toContain('e-before');
    expect(ids()).not.toContain('e-after');
  });

  it('keeps incomes and investments by their period id regardless of date', () => {
    expect(ids()).toEqual(expect.arrayContaining(['i-in', 'v-in']));
    expect(ids()).not.toContain('i-other');
    expect(ids()).not.toContain('v-other');
  });

  it('returns nothing for a period without references and without expenses in range', () => {
    const empty: PeriodView = { id: 'p9', startDate: '2025-01-01', endDate: '2025-01-31', closed: false };

    expect(entriesOfPeriod(ledger, scopeOfPeriod(empty, refs))).toEqual([]);
  });
});
