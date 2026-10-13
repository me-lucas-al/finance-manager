import { describe, it, expect, beforeEach } from 'vitest';
import { EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import { createFixedEntryHarness, FIXED_USER } from './fixed-entry-harness';

const input = { kind: 'expense' as const, description: ' Internet ', amount: 120, category: 'Moradia' };

describe('CreateFixedEntryUseCase', () => {
  let harness: ReturnType<typeof createFixedEntryHarness>;

  beforeEach(() => {
    harness = createFixedEntryHarness();
  });

  const expenses = () => harness.transactionRepo.findAllByUserId(FIXED_USER);

  it('stores a trimmed active rule starting today', async () => {
    const rule = await harness.create.execute(FIXED_USER, { ...input, dueDay: 20 });

    expect(rule).toMatchObject({ description: 'Internet', active: true, startsOn: '2026-03-10', dueDay: 20 });
    expect(await expenses()).toHaveLength(0);
    expect(harness.notifier.notifyEntriesChanged).toHaveBeenCalledWith(FIXED_USER);
  });

  it('launches right away when it is due today', async () => {
    await harness.create.execute(FIXED_USER, { ...input, dueDay: 10 });

    expect((await expenses()).map((item) => item.occurredAt)).toEqual(['2026-03-10']);
  });

  it('launches a past due date in this month when asked to', async () => {
    const rule = await harness.create.execute(FIXED_USER, { ...input, dueDay: 3, launchThisMonth: true });

    expect((await expenses()).map((item) => item.occurredAt)).toEqual(['2026-03-03']);
    expect(rule.startsOn).toBe('2026-03-01');
  });

  it('skips a past due date in this month when not asked, and the generator keeps it skipped', async () => {
    await harness.create.execute(FIXED_USER, { ...input, dueDay: 3, launchThisMonth: false });
    await harness.generate.execute(FIXED_USER);

    expect(await expenses()).toHaveLength(0);
  });

  it('rejects invalid input without saving', async () => {
    await expect(harness.create.execute(FIXED_USER, { ...input, dueDay: 40 })).rejects.toThrow(EntryValidationError);
    expect(harness.rules.items).toHaveLength(0);
  });
});

describe('ListFixedEntriesUseCase', () => {
  it('reports the status of every rule for the current month', async () => {
    const harness = createFixedEntryHarness();
    await harness.create.execute(FIXED_USER, { ...input, description: 'A', dueDay: 10 });
    await harness.create.execute(FIXED_USER, { ...input, description: 'B', dueDay: 25 });
    const paused = await harness.create.execute(FIXED_USER, { ...input, description: 'C', dueDay: 28 });
    await harness.setActive.execute(FIXED_USER, paused.id, false);

    const views = await harness.list.execute(FIXED_USER);

    expect(views.map((view) => [view.description, view.status])).toEqual([
      ['A', 'launched'],
      ['B', 'scheduled'],
      ['C', 'paused'],
    ]);
  });
});
