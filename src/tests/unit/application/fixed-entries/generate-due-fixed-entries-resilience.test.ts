import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';
import { createFixedEntryHarness, FIXED_USER } from './fixed-entry-harness';

describe('GenerateDueFixedEntriesUseCase eligibility and resilience', () => {
  let harness: ReturnType<typeof createFixedEntryHarness>;

  beforeEach(() => {
    harness = createFixedEntryHarness();
  });

  const allExpenses = () => harness.transactionRepo.findAllByUserId(FIXED_USER);

  it('ignores paused rules and rules that start after the due date', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'paused', dueDay: 5, active: false }));
    harness.rules.items.push(makeFixedEntry({ id: 'declined', dueDay: 5, startsOn: '2026-03-08' }));

    const report = await harness.generate.execute(FIXED_USER);

    expect(report.launched).toBe(0);
    expect(await allExpenses()).toHaveLength(0);
  });

  it('keeps launching the other rules when one fails', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'broken', dueDay: 3 }), makeFixedEntry({ id: 'ok', dueDay: 4 }));
    vi.spyOn(harness.transactionRepo, 'create').mockImplementationOnce(async () => {
      throw new Error('database down');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const report = await harness.generate.execute(FIXED_USER);

    expect(report).toEqual({ launched: 1, alreadyLaunched: 0, failed: 1 });
    expect((await allExpenses()).map((item) => item.fixedEntryId)).toEqual(['ok']);
  });

  it('confirms each launch to the user', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));

    await harness.generate.execute(FIXED_USER);

    expect(harness.announcer.announceLaunched).toHaveBeenCalledTimes(1);
    expect(harness.announcer.announceLaunched).toHaveBeenCalledWith(expect.objectContaining({ id: 'net' }), '2026-03-05');
  });

  it('notifies entry changes after launching', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));
    await harness.generate.execute(FIXED_USER);
    expect(harness.notifier.notifyEntriesChanged).toHaveBeenCalledWith(FIXED_USER);
  });
});
