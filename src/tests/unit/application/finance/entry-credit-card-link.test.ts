import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EntryActionService } from '@/modules/finance/application/services/entry-action-service';
import { buildFakeEntryServices } from '@/tests/fakes/build-fake-entry-services';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

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
      makeCreditCard({ id: 'mine', userId: 'user-1' }),
      makeCreditCard({ id: 'theirs', userId: 'other' })
    );
  });

  const storedExpenses = () => services.transactionRepo.findAllByUserId('user-1');

  it('stores the card on a new expense', async () => {
    const result = await serviceFor('user-1', services).create({ ...expense, creditCardId: 'mine' });

    expect(result.ok).toBe(true);
    expect((await storedExpenses())[0].creditCardId).toBe('mine');
  });

  it('keeps expenses without a card unlinked', async () => {
    await serviceFor('user-1', services).create(expense);

    expect((await storedExpenses())[0].creditCardId).toBeNull();
  });

  it('refuses a card that belongs to another user and stores nothing', async () => {
    const result = await serviceFor('user-1', services).create({ ...expense, creditCardId: 'theirs' });

    expect(result).toEqual({ ok: false, error: 'Cartão não encontrado' });
    expect(await storedExpenses()).toHaveLength(0);
  });

  it('refuses a card on income and investment entries', async () => {
    const service = serviceFor('user-1', services);

    const income = await service.create({ ...expense, type: 'income', creditCardId: 'mine' });
    const investment = await service.create({ ...expense, type: 'investment', creditCardId: 'mine' });

    expect(income.ok).toBe(false);
    expect(investment.ok).toBe(false);
  });

  it('links, validates ownership and unlinks on update', async () => {
    const service = serviceFor('user-1', services);
    await service.create(expense);
    const [created] = await storedExpenses();

    const linked = await service.update({ kind: 'expense', id: created.id, changes: { creditCardId: 'mine' } });
    const stolen = await service.update({ kind: 'expense', id: created.id, changes: { creditCardId: 'theirs' } });
    expect((await storedExpenses())[0].creditCardId).toBe('mine');

    const unlinked = await service.update({ kind: 'expense', id: created.id, changes: { creditCardId: null } });

    expect([linked.ok, stolen.ok, unlinked.ok]).toEqual([true, false, true]);
    expect((await storedExpenses())[0].creditCardId).toBeNull();
  });

  it('keeps the card when other fields change', async () => {
    const service = serviceFor('user-1', services);
    await service.create({ ...expense, creditCardId: 'mine' });
    const [created] = await storedExpenses();

    await service.update({ kind: 'expense', id: created.id, changes: { amount: 99 } });

    expect((await storedExpenses())[0]).toMatchObject({ amount: 99, creditCardId: 'mine' });
  });

  it('still counts a card expense in the ledger of the month', async () => {
    await serviceFor('user-1', services).create({ ...expense, creditCardId: 'mine' });

    const [stored] = await storedExpenses();
    expect(stored).toMatchObject({ amount: 80, occurredAt: '2026-10-05', source: 'manual', status: 'categorized' });
  });
});
