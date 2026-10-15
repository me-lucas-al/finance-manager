import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EntryActionService } from '@/modules/finance/application/services/entry-action-service';
import { buildFakeEntryServices } from '@/tests/fakes/build-fake-entry-services';

function buildServiceFor(userId: string, services: ReturnType<typeof buildFakeEntryServices>) {
  return new EntryActionService({
    resolveUserId: async () => userId,
    registerEntry: services.registerEntry,
    updateEntry: services.updateEntry,
    deleteEntry: services.deleteEntry,
    reportUnexpectedError: vi.fn(),
  });
}

describe('entry actions on real use cases', () => {
  let services: ReturnType<typeof buildFakeEntryServices>;
  const expense = { type: 'expense', amount: 40, description: 'Feira', category: 'Mercado', date: '2026-03-10' };

  beforeEach(() => {
    services = buildFakeEntryServices();
  });

  it('stores the expense with the informed necessity and date', async () => {
    const result = await buildServiceFor('user-1', services).create({ ...expense, necessity: 'superfluo' });

    expect(result.ok).toBe(true);
    const [stored] = await services.transactionRepo.findAllByUserId('user-1');
    expect(stored).toMatchObject({ amount: 40, occurredAt: '2026-03-10', necessity: 'superfluo', source: 'manual' });
  });

  it('stores incomes and investments with the category as type', async () => {
    const service = buildServiceFor('user-1', services);

    await service.create({ type: 'income', amount: 100, description: 'Salário', category: 'Salário', date: '2026-03-05' });
    await service.create({ type: 'investment', amount: 50, description: 'Aporte', category: 'CDB', date: '2026-03-06' });

    expect(services.incomeRepo.items).toHaveLength(1);
    expect(services.investmentRepo.items[0]).toMatchObject({ type: 'CDB' });
  });

  it('does not let another user edit or delete the entry', async () => {
    await buildServiceFor('owner', services).create(expense);
    const [stored] = await services.transactionRepo.findAllByUserId('owner');
    const intruder = buildServiceFor('intruder', services);

    const updated = await intruder.update({ kind: 'expense', id: stored.id, changes: { amount: 1 } });
    const removed = await intruder.remove({ kind: 'expense', id: stored.id });

    expect(updated).toEqual({ ok: false, error: 'Lançamento não encontrado' });
    expect(removed).toEqual({ ok: false, error: 'Lançamento não encontrado' });
    expect((await services.transactionRepo.findById(stored.id))?.amount).toBe(40);
  });

  it('reports an empty update as a validation error', async () => {
    await buildServiceFor('owner', services).create(expense);
    const [stored] = await services.transactionRepo.findAllByUserId('owner');

    const result = await buildServiceFor('owner', services).update({ kind: 'expense', id: stored.id, changes: {} });

    expect(result).toEqual({ ok: false, error: 'Nenhuma alteração informada' });
  });

  it('refuses to alter expenses imported from the bank', async () => {
    const service = buildServiceFor('owner', services);
    await service.create(expense);
    const [stored] = await services.transactionRepo.findAllByUserId('owner');
    await services.transactionRepo.update(stored.id, { source: 'pluggy' });

    const updated = await service.update({ kind: 'expense', id: stored.id, changes: { amount: 1 } });
    const removed = await service.remove({ kind: 'expense', id: stored.id });

    expect(updated).toEqual({ ok: false, error: 'Lançamentos importados do banco não podem ser alterados' });
    expect(removed.ok).toBe(false);
    expect(await services.transactionRepo.findById(stored.id)).not.toBeNull();
  });

  it('deletes the entry for its owner', async () => {
    const service = buildServiceFor('owner', services);
    await service.create(expense);
    const [stored] = await services.transactionRepo.findAllByUserId('owner');

    const result = await service.remove({ kind: 'expense', id: stored.id });

    expect(result).toEqual({ ok: true, alerts: [] });
    expect(await services.transactionRepo.findById(stored.id)).toBeNull();
  });
});
