import { describe, it, expect, beforeEach } from 'vitest';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';
import { createFixedEntryHarness, FIXED_USER } from './fixed-entry-harness';

describe('fixed entry deleted after launch', () => {
  let harness: ReturnType<typeof createFixedEntryHarness>;

  beforeEach(() => {
    harness = createFixedEntryHarness();
  });

  const expenses = () => harness.transactionRepo.findAllByUserId(FIXED_USER);

  const deleteLaunchedExpense = async () => {
    const [launched] = await expenses();
    await harness.transactionRepo.delete(launched.id);
  };

  it('does not recreate a deleted launch when the generator runs again', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));
    await harness.generate.execute(FIXED_USER);
    await deleteLaunchedExpense();

    const report = await harness.generate.execute(FIXED_USER);

    expect(report).toEqual({ launched: 0, alreadyLaunched: 0, failed: 0 });
    expect(await expenses()).toHaveLength(0);
  });

  it('launches normally in the following month', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));
    await harness.generate.execute(FIXED_USER);
    await deleteLaunchedExpense();

    harness.setNow(new Date('2026-04-10T15:00:00Z'));
    await harness.generate.execute(FIXED_USER);

    expect((await expenses()).map((item) => item.fixedReferenceMonth)).toEqual(['2026-04']);
  });

  it('does not recreate a launch created with launchThisMonth after it is deleted', async () => {
    await harness.create.execute(FIXED_USER, {
      kind: 'expense',
      description: 'Internet',
      amount: 120,
      category: 'Moradia',
      dueDay: 3,
      launchThisMonth: true,
    });
    await deleteLaunchedExpense();

    await harness.generate.execute(FIXED_USER);

    expect(await expenses()).toHaveLength(0);
  });

  it('records a launch that already existed without the marker', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));
    await harness.launcher.launch(harness.rules.items[0], '2026-03');
    await harness.generate.execute(FIXED_USER);
    await deleteLaunchedExpense();

    await harness.generate.execute(FIXED_USER);

    expect(harness.rules.items[0].lastLaunchedMonth).toBe('2026-03');
    expect(await expenses()).toHaveLength(0);
  });
});
