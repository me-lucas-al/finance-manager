import { describe, it, expect, beforeEach } from 'vitest';
import { EntryNotFoundError } from '@/modules/finance/domain/models/entry-errors';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';
import { createFixedEntryHarness, FIXED_USER } from './fixed-entry-harness';

describe('DeleteFixedEntryUseCase', () => {
  let harness: ReturnType<typeof createFixedEntryHarness>;

  beforeEach(async () => {
    harness = createFixedEntryHarness();
    harness.rules.items.push(makeFixedEntry({ id: 'net', dueDay: 5 }));
    await harness.generate.execute(FIXED_USER);
  });

  const expenses = () => harness.transactionRepo.findAllByUserId(FIXED_USER);

  it('removes the rule and keeps the entries already launched', async () => {
    await harness.remove.execute(FIXED_USER, 'net');

    expect(harness.rules.items).toHaveLength(0);
    expect(await expenses()).toHaveLength(1);
  });

  it('also removes this month launch when asked to', async () => {
    await harness.remove.execute(FIXED_USER, 'net', { alsoDeleteCurrentMonth: true });

    expect(harness.rules.items).toHaveLength(0);
    expect(await expenses()).toHaveLength(0);
  });

  it('does not fail when there is no launch to remove', async () => {
    harness.rules.items.push(makeFixedEntry({ id: 'later', dueDay: 25 }));

    await harness.remove.execute(FIXED_USER, 'later', { alsoDeleteCurrentMonth: true });

    expect(harness.rules.items.map((rule) => rule.id)).toEqual(['net']);
    expect(await expenses()).toHaveLength(1);
  });

  it('refuses rules from another user', async () => {
    await expect(harness.remove.execute('intruder', 'net')).rejects.toThrow(EntryNotFoundError);
    expect(harness.rules.items).toHaveLength(1);
  });
});
