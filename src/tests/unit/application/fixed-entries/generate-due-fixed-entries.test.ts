import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';
import { createFixedEntryHarness, FIXED_USER } from './fixed-entry-harness';

describe('GenerateDueFixedEntriesUseCase', () => {
  let harness: ReturnType<typeof createFixedEntryHarness>;

  beforeEach(() => {
    harness = createFixedEntryHarness();
  });

  const allExpenses = () => harness.transactionRepo.findAllByUserId(FIXED_USER);

  it('creates an expense on its due day in transactions, linked to the rule', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5, amount: 120 }));

    const report = await harness.generate.execute(FIXED_USER);

    expect(report).toEqual({ launched: 1, alreadyLaunched: 0, failed: 0 });
    const [stored] = await allExpenses();
    expect(stored).toMatchObject({
      amount: 120,
      occurredAt: '2026-03-05',
      source: 'manual',
      fixedEntryId: 'net',
      fixedReferenceMonth: '2026-03',
    });
  });

  it('creates an income in incomes, not in transactions', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'salary', kind: 'income', dueDay: 5, amount: 5000 }));

    await harness.generate.execute(FIXED_USER);

    expect(await allExpenses()).toHaveLength(0);
    expect(harness.incomeRepo.items).toHaveLength(1);
    expect(harness.incomeRepo.items[0]).toMatchObject({ amount: '5000', fixedEntryId: 'salary', fixedReferenceMonth: '2026-03' });
  });

  it('does not duplicate when run twice', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));
    harness.rules.items.push(makeFixedEntry({ id: 'salary', kind: 'income', dueDay: 5 }));

    await harness.generate.execute(FIXED_USER);
    const second = await harness.generate.execute(FIXED_USER);

    expect(second).toEqual({ launched: 0, alreadyLaunched: 0, failed: 0 });
    expect(await allExpenses()).toHaveLength(1);
    expect(harness.incomeRepo.items).toHaveLength(1);
  });

  it('treats a unique index conflict as already launched', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));
    vi.spyOn(harness.lookup, 'findLaunchedRuleIds').mockResolvedValue(new Set());

    await harness.generate.execute(FIXED_USER);
    harness.rules.items[0].lastLaunchedMonth = null;
    const second = await harness.generate.execute(FIXED_USER);

    expect(second).toEqual({ launched: 0, alreadyLaunched: 1, failed: 0 });
    expect(await allExpenses()).toHaveLength(1);
  });

  it('catches up every rule missed over several days, each on its own due day', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'a', dueDay: 2 }), makeFixedEntry({ id: 'b', dueDay: 7 }));
    harness.rules.items.push(makeFixedEntry({ id: 'c', dueDay: 10 }), makeFixedEntry({ id: 'd', dueDay: 11 }));

    const report = await harness.generate.execute(FIXED_USER);

    expect(report.launched).toBe(3);
    const dates = (await allExpenses()).map((item) => item.occurredAt).sort();
    expect(dates).toEqual(['2026-03-02', '2026-03-07', '2026-03-10']);
  });
});
