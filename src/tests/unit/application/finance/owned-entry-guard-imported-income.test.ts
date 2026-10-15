import { describe, it, expect, beforeEach } from 'vitest';
import { EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import { incomeToEntry } from '@/modules/finance/domain/services/ledger-mapper';
import { buildFakeEntryServices } from '@/tests/fakes/build-fake-entry-services';

describe('imported incomes', () => {
  let services: ReturnType<typeof buildFakeEntryServices>;
  let incomeId: string;

  beforeEach(async () => {
    services = buildFakeEntryServices();
    await services.registerEntry.execute('user-1', {
      type: 'income',
      category: 'Salário',
      description: 'Pix',
      amount: 90,
      date: '2026-03-05',
    });
    incomeId = services.incomeRepo.items[0].id;
    services.incomeRepo.items[0].externalId = 'ext-1';
  });

  it('blocks editing', async () => {
    await expect(
      services.updateEntry.execute('user-1', { kind: 'income', id: incomeId }, { amount: 10 })
    ).rejects.toThrow(EntryValidationError);
  });

  it('blocks deleting', async () => {
    await expect(services.deleteEntry.execute('user-1', { kind: 'income', id: incomeId })).rejects.toThrow(
      EntryValidationError
    );
    expect(services.incomeRepo.items).toHaveLength(1);
  });

  it('marks the ledger entry as imported', () => {
    expect(incomeToEntry(services.incomeRepo.items[0]).imported).toBe(true);
  });

  it('keeps manual incomes editable and unmarked', async () => {
    services.incomeRepo.items[0].externalId = null;

    await services.updateEntry.execute('user-1', { kind: 'income', id: incomeId }, { amount: 10 });

    expect(incomeToEntry(services.incomeRepo.items[0]).imported).toBeUndefined();
  });
});
