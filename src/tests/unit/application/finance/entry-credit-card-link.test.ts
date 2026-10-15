import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EntryActionService } from '@/modules/finance/application/services/entry-action-service';
import { buildFakeEntryServices } from '@/tests/fakes/build-fake-entry-services';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

const MINE = '0b9f8a3e-5c1d-4e7a-9f2b-1c3d5e7f9a0b';
const THEIRS = '7d2c4b6a-1e3f-4a5b-8c9d-0e1f2a3b4c5d';

const expense = { type: 'expense', amount: 80, description: 'Mercado', category: 'Mercado', date: '2026-10-05' };

function serviceFor(userId: string, services: ReturnType<typeof buildFakeEntryServices>) {
  return new EntryActionService({
    resolveUserId: async () => userId,
    registerEntry: services.registerEntry,
    updateEntry: services.updateEntry,
    deleteEntry: services.deleteEntry,
    reportUnexpectedError: vi.fn(),
  });
}

describe('linking an expense to a credit card', () => {
  let services: ReturnType<typeof buildFakeEntryServices>;

  beforeEach(() => {
    services = buildFakeEntryServices();
    services.cards.items.push(
      makeCreditCard({ id: MINE, userId: 'user-1' }),
      makeCreditCard({ id: THEIRS, userId: 'other' })
    );
  });

  const storedExpenses = () => services.transactionRepo.findAllByUserId('user-1');

  it('stores the card on a new expense', async () => {
    const result = await serviceFor('user-1', services).create({ ...expense, creditCardId: MINE });

    expect(result.ok).toBe(true);
    expect((await storedExpenses())[0].creditCardId).toBe(MINE);
  });

  it('keeps expenses without a card unlinked', async () => {
    await serviceFor('user-1', services).create(expense);

    expect((await storedExpenses())[0].creditCardId).toBeNull();
  });

  it('refuses a card that belongs to another user and stores nothing', async () => {
    const result = await serviceFor('user-1', services).create({ ...expense, creditCardId: THEIRS });

    expect(result).toEqual({ ok: false, error: 'Cartão não encontrado' });
    expect(await storedExpenses()).toHaveLength(0);
  });

  it('answers not found for a malformed card id on create and update', async () => {
    const service = serviceFor('user-1', services);
    await service.create(expense);
    const [created] = await storedExpenses();

    const onCreate = await service.create({ ...expense, creditCardId: 'not-a-uuid' });
    const onUpdate = await service.update({ kind: 'expense', id: created.id, changes: { creditCardId: 'x' } });

    expect(onCreate).toEqual({ ok: false, error: 'Cartão não encontrado' });
    expect(onUpdate).toEqual({ ok: false, error: 'Cartão não encontrado' });
  });

  it('refuses a card on income and investment entries', async () => {
    const service = serviceFor('user-1', services);

    const income = await service.create({ ...expense, type: 'income', creditCardId: MINE });
    const investment = await service.create({ ...expense, type: 'investment', creditCardId: MINE });

    expect(income.ok).toBe(false);
    expect(investment.ok).toBe(false);
  });

  it('links, validates ownership and unlinks on update', async () => {
    const service = serviceFor('user-1', services);
    await service.create(expense);
    const [created] = await storedExpenses();

    const linked = await service.update({ kind: 'expense', id: created.id, changes: { creditCardId: MINE } });
    const stolen = await service.update({ kind: 'expense', id: created.id, changes: { creditCardId: THEIRS } });
    expect((await storedExpenses())[0].creditCardId).toBe(MINE);

    const unlinked = await service.update({ kind: 'expense', id: created.id, changes: { creditCardId: null } });

    expect([linked.ok, stolen.ok, unlinked.ok]).toEqual([true, false, true]);
    expect((await storedExpenses())[0].creditCardId).toBeNull();
  });

  it('keeps the card when other fields change', async () => {
    const service = serviceFor('user-1', services);
    await service.create({ ...expense, creditCardId: MINE });
    const [created] = await storedExpenses();

    await service.update({ kind: 'expense', id: created.id, changes: { amount: 99 } });

    expect((await storedExpenses())[0]).toMatchObject({ amount: 99, creditCardId: MINE });
  });

  it('still counts a card expense in the ledger of the month', async () => {
    await serviceFor('user-1', services).create({ ...expense, creditCardId: MINE });

    const [stored] = await storedExpenses();
    expect(stored).toMatchObject({ amount: 80, occurredAt: '2026-10-05', source: 'manual', status: 'categorized' });
  });
});
