import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { OwnedEntryGuard } from '@/modules/finance/application/services/owned-entry-guard';
import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { EntryNotFoundError } from '@/modules/finance/domain/models/entry-errors';
import { noopCardLinkValidator } from '@/tests/fakes/noop-card-link-validator';
import type { EntryChangeNotifier } from '@/modules/finance/domain/ports/entry-change-notifier';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import { FakeIncomeRepository } from '@/tests/fakes/fake-income-repository';
import { FakeInvestmentRepository } from '@/tests/fakes/fake-investment-repository';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';
import { seedManualExpense } from '@/tests/fakes/seed-manual-expense';

describe('update and delete entries', () => {
  let transactionRepo: FakeTransactionRepository;
  let incomeRepo: FakeIncomeRepository;
  let investmentRepo: FakeInvestmentRepository;
  let notifier: EntryChangeNotifier;
  let update: UpdateEntryUseCase;
  let remove: DeleteEntryUseCase;
  let language: FakeLanguageModel;

  beforeEach(() => {
    transactionRepo = new FakeTransactionRepository();
    incomeRepo = new FakeIncomeRepository();
    investmentRepo = new FakeInvestmentRepository();
    language = new FakeLanguageModel();
    language.nextStructuredResponse = { necessity: 'superfluo' };
    notifier = { notifyEntriesChanged: vi.fn(async () => {}) };
    const guard = new OwnedEntryGuard(transactionRepo, incomeRepo, investmentRepo);
    update = new UpdateEntryUseCase(
      transactionRepo,
      incomeRepo,
      investmentRepo,
      guard,
      new ClassifyNecessityService(transactionRepo, language),
      notifier,
      noopCardLinkValidator
    );
    remove = new DeleteEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, notifier);
  });

  const seedExpense = () => seedManualExpense(transactionRepo);

  it('updates an expense keeping untouched fields and notifies', async () => {
    const expense = await seedExpense();

    await update.execute('user-1', { kind: 'expense', id: expense.id }, { amount: 75, date: '2026-03-02' });

    const stored = await transactionRepo.findById(expense.id);
    expect(stored).toMatchObject({ amount: 75, occurredAt: '2026-03-02', description: 'Almoço', category: 'Alimentação' });
    expect(notifier.notifyEntriesChanged).toHaveBeenCalledWith('user-1');
  });

  it('reclassifies necessity when category or description change', async () => {
    const expense = await seedExpense();

    await update.execute('user-1', { kind: 'expense', id: expense.id }, { category: 'Lazer' });

    expect((await transactionRepo.findById(expense.id))?.necessity).toBe('superfluo');
  });

  it('updates incomes and investments on the informed date', async () => {
    const income = await incomeRepo.create({ userId: 'user-1', periodId: 'p', amount: 100, description: 'Salário', category: 'Salário', receivedAt: new Date() });
    const investment = await investmentRepo.create({ userId: 'user-1', periodId: 'p', amount: 10, description: 'CDB', type: 'CDB', date: new Date() });

    await update.execute('user-1', { kind: 'income', id: income.id }, { amount: 200, date: '2026-01-05' });
    await update.execute('user-1', { kind: 'investment', id: investment.id }, { category: 'Tesouro' });

    expect((await incomeRepo.findById(income.id))?.amount).toBe('200');
    expect((await incomeRepo.findById(income.id))?.receivedAt.toISOString()).toBe('2026-01-05T15:00:00.000Z');
    expect((await investmentRepo.findById(investment.id))?.type).toBe('Tesouro');
  });

  it('rejects invalid changes without touching the entry', async () => {
    const expense = await seedExpense();
    const ref = { kind: 'expense' as const, id: expense.id };

    await expect(update.execute('user-1', ref, {})).rejects.toThrow('Nenhuma alteração');
    await expect(update.execute('user-1', ref, { amount: 0 })).rejects.toThrow('maior que zero');
    await expect(update.execute('user-1', ref, { date: '2026-02-30' })).rejects.toThrow('Invalid entry date');
    expect((await transactionRepo.findById(expense.id))?.amount).toBe(50);
    expect(notifier.notifyEntriesChanged).not.toHaveBeenCalled();
  });

  it('refuses to touch entries of another user or that do not exist', async () => {
    const expense = await seedExpense();

    await expect(update.execute('user-2', { kind: 'expense', id: expense.id }, { amount: 1 })).rejects.toThrow(EntryNotFoundError);
    await expect(remove.execute('user-2', { kind: 'expense', id: expense.id })).rejects.toThrow(EntryNotFoundError);
    await expect(remove.execute('user-1', { kind: 'income', id: 'missing' })).rejects.toThrow(EntryNotFoundError);
    expect(await transactionRepo.findById(expense.id)).not.toBeNull();
  });

  it('deletes an entry of each kind and notifies', async () => {
    const expense = await seedExpense();
    const income = await incomeRepo.create({ userId: 'user-1', periodId: 'p', amount: 100, description: 'x', category: 'x', receivedAt: new Date() });
    const investment = await investmentRepo.create({ userId: 'user-1', periodId: 'p', amount: 10, description: 'x', type: 'x', date: new Date() });

    await remove.execute('user-1', { kind: 'expense', id: expense.id });
    await remove.execute('user-1', { kind: 'income', id: income.id });
    await remove.execute('user-1', { kind: 'investment', id: investment.id });

    expect(await transactionRepo.findById(expense.id)).toBeNull();
    expect(incomeRepo.items).toHaveLength(0);
    expect(investmentRepo.items).toHaveLength(0);
    expect(notifier.notifyEntriesChanged).toHaveBeenCalledTimes(3);
  });
});
