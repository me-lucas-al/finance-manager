import { describe, it, expect, beforeEach } from 'vitest';
import { EntryNotFoundError } from '@/modules/finance/domain/models/entry-errors';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';
import { createFixedEntryHarness, FIXED_USER } from './fixed-entry-harness';

describe('UpdateFixedEntryUseCase', () => {
  let harness: ReturnType<typeof createFixedEntryHarness>;

  beforeEach(async () => {
    harness = createFixedEntryHarness();
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5, amount: 120 }));
    await harness.generate.execute(FIXED_USER);
  });

  const launched = async () => (await harness.transactionRepo.findAllByUserId(FIXED_USER))[0];

  it('changes only the rule and leaves already launched entries untouched', async () => {
    await harness.update.execute(FIXED_USER, 'net', { amount: 150, description: 'Fibra' });

    expect(harness.rules.items[0]).toMatchObject({ amount: 150, description: 'Fibra' });
    expect(await launched()).toMatchObject({ amount: 120, description: 'Internet' });
  });

  it('also updates this month launch when asked to', async () => {
    await harness.update.execute(FIXED_USER, 'net', { amount: 150, applyToCurrentMonth: true });

    expect(await launched()).toMatchObject({ amount: 150, description: 'Internet' });
  });

  it('moves the launch date when the due day changes and it is applied to this month', async () => {
    await harness.update.execute(FIXED_USER, 'net', { dueDay: 8, applyToCurrentMonth: true });

    expect((await launched()).occurredAt).toBe('2026-03-08');
  });

  it('starts counting from today when the due day changes', async () => {
    await harness.update.execute(FIXED_USER, 'net', { dueDay: 8 });

    expect(harness.rules.items[0].startsOn).toBe('2026-03-10');
  });

  it('does nothing to the month when no launch exists yet', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'later', dueDay: 25 }));

    await harness.update.execute(FIXED_USER, 'later', { amount: 99, applyToCurrentMonth: true });

    expect(await harness.transactionRepo.findAllByUserId(FIXED_USER)).toHaveLength(1);
  });

  it('refuses rules from another user', async () => {
    await expect(harness.update.execute('intruder', 'net', { amount: 1 })).rejects.toThrow(EntryNotFoundError);
  });
});

describe('SetFixedEntryActiveUseCase', () => {
  it('pauses, then resumes from today without back-filling', async () => {
    const harness = createFixedEntryHarness();
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));

    await harness.setActive.execute(FIXED_USER, 'net', false);
    await harness.generate.execute(FIXED_USER);
    expect(await harness.transactionRepo.findAllByUserId(FIXED_USER)).toHaveLength(0);

    await harness.setActive.execute(FIXED_USER, 'net', true);
    await harness.generate.execute(FIXED_USER);
    expect(await harness.transactionRepo.findAllByUserId(FIXED_USER)).toHaveLength(0);
    expect(harness.rules.items[0]).toMatchObject({ active: true, startsOn: '2026-03-10' });
  });
});
