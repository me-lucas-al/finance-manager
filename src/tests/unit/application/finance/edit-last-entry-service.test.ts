import { describe, it, expect, beforeEach } from 'vitest';
import { EditLastEntryService } from '@/modules/finance/application/services/edit-last-entry-service';
import { LatestEntryFinder } from '@/modules/finance/application/services/latest-entry-finder';
import { buildFakeEntryServices } from '@/tests/fakes/build-fake-entry-services';

describe('EditLastEntryService', () => {
  let services: ReturnType<typeof buildFakeEntryServices>;
  let editLast: EditLastEntryService;

  beforeEach(() => {
    services = buildFakeEntryServices();
    const finder = new LatestEntryFinder(services.transactionRepo, services.incomeRepo, services.investmentRepo);
    editLast = new EditLastEntryService(finder, services.updateEntry, () => '2026-03-15');
  });

  const registerExpense = () =>
    services.registerEntry.execute('user-1', {
      type: 'expense',
      category: 'Mercado',
      description: 'Feira',
      amount: 40,
      date: '2026-03-10',
    });

  it('changes the amount of the last entry', async () => {
    await registerExpense();

    const reply = await editLast.execute('user-1', ' valor 45,90');

    const [stored] = await services.transactionRepo.findAllByUserId('user-1');
    expect(stored.amount).toBe(45.9);
    expect(reply).toContain('Feira');
    expect(reply).toContain('45.90');
  });

  it('changes the date accepting day/month', async () => {
    await registerExpense();

    await editLast.execute('user-1', 'data 02/03');

    const [stored] = await services.transactionRepo.findAllByUserId('user-1');
    expect(stored.occurredAt).toBe('2026-03-02');
  });

  it('edits the newest entry among all kinds', async () => {
    await registerExpense();
    await services.registerEntry.execute('user-1', { type: 'income', category: 'Salário', description: 'Mês', amount: 100 });

    await editLast.execute('user-1', 'categoria Freela');

    expect(services.incomeRepo.items[0].category).toBe('Freela');
    const [expense] = await services.transactionRepo.findAllByUserId('user-1');
    expect(expense.category).toBe('Mercado');
  });

  it('does not touch the entries of another user', async () => {
    await registerExpense();

    const reply = await editLast.execute('user-2', 'valor 1');

    expect(reply).toContain('Nenhum lançamento');
    const [stored] = await services.transactionRepo.findAllByUserId('user-1');
    expect(stored.amount).toBe(40);
  });

  it('explains the usage without reading the ledger when the command is incomplete', async () => {
    await registerExpense();

    const reply = await editLast.execute('user-1', '');

    expect(reply).toContain('/editar valor');
  });

  it('answers with the validation message for an invalid date', async () => {
    await registerExpense();

    const reply = await editLast.execute('user-1', 'data 31/02');

    expect(reply).toContain('Data inválida');
  });
});
