import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UndoLastEntryService } from '@/modules/finance/application/services/undo-last-entry-service';
import { LatestEntryFinder } from '@/modules/finance/application/services/latest-entry-finder';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { OwnedEntryGuard } from '@/modules/finance/application/services/owned-entry-guard';
import { ExpensePatternAnalyzer } from '@/modules/finance/application/services/expense-pattern-analyzer';
import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import { FakePeriodRepository } from '@/tests/fakes/fake-period-repository';
import { FakeSettingRepository } from '@/tests/fakes/fake-setting-repository';
import { FakeIncomeRepository } from '@/tests/fakes/fake-income-repository';
import { FakeInvestmentRepository } from '@/tests/fakes/fake-investment-repository';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';
import { noopCardLinkValidator } from '@/tests/fakes/noop-card-link-validator';
import type { EntryChangeNotifier } from '@/modules/finance/domain/ports/entry-change-notifier';

describe('entry date and change notification', () => {
  let transactionRepo: FakeTransactionRepository;
  let incomeRepo: FakeIncomeRepository;
  let investmentRepo: FakeInvestmentRepository;
  let notifier: EntryChangeNotifier;
  let register: RegisterManualEntryUseCase;
  let undo: UndoLastEntryService;

  beforeEach(() => {
    transactionRepo = new FakeTransactionRepository();
    incomeRepo = new FakeIncomeRepository();
    investmentRepo = new FakeInvestmentRepository();
    notifier = { notifyEntriesChanged: vi.fn(async () => {}) };
    register = new RegisterManualEntryUseCase(
      transactionRepo,
      incomeRepo,
      investmentRepo,
      new ResolveCurrentPeriodUseCase(new FakePeriodRepository(), new FakeSettingRepository()),
      new ClassifyNecessityService(transactionRepo, new FakeLanguageModel()),
      new ExpensePatternAnalyzer(transactionRepo),
      notifier,
      noopCardLinkValidator
    );
    const guard = new OwnedEntryGuard(transactionRepo, incomeRepo, investmentRepo);
    undo = new UndoLastEntryService(
      new LatestEntryFinder(transactionRepo, incomeRepo, investmentRepo),
      new DeleteEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, notifier)
    );
  });

  it('stores an expense on the informed date', async () => {
    await register.execute('user-1', { type: 'expense', category: 'Mercado', description: 'Feira', amount: 40, date: '2026-02-10' });

    const [stored] = await transactionRepo.findAllByUserId('user-1');
    expect(stored.occurredAt).toBe('2026-02-10');
  });

  it('stores income and investment on the informed date', async () => {
    await register.execute('user-1', { type: 'income', category: 'Salário', description: 'Empresa', amount: 100, date: '2026-02-05' });
    await register.execute('user-1', { type: 'investment', category: 'CDB', description: 'Aporte', amount: 50, date: '2026-02-06' });

    expect(incomeRepo.items[0].receivedAt.toISOString()).toBe('2026-02-05T15:00:00.000Z');
    expect(investmentRepo.items[0].date.toISOString()).toBe('2026-02-06T15:00:00.000Z');
  });

  it('rejects an invalid date without saving or notifying', async () => {
    await expect(
      register.execute('user-1', { type: 'expense', category: 'Mercado', description: 'Feira', amount: 40, date: '2026-02-30' })
    ).rejects.toThrow('Invalid entry date');

    expect(await transactionRepo.findAllByUserId('user-1')).toHaveLength(0);
    expect(notifier.notifyEntriesChanged).not.toHaveBeenCalled();
  });

  it('notifies once per registered entry of any type', async () => {
    await register.execute('user-1', { type: 'expense', category: 'Mercado', description: 'Feira', amount: 40 });
    await register.execute('user-1', { type: 'income', category: 'Salário', description: 'Empresa', amount: 100 });
    await register.execute('user-1', { type: 'investment', category: 'CDB', description: 'Aporte', amount: 50 });

    expect(notifier.notifyEntriesChanged).toHaveBeenCalledTimes(3);
    expect(notifier.notifyEntriesChanged).toHaveBeenCalledWith('user-1');
  });

  it('notifies after undoing the latest entry', async () => {
    await register.execute('user-1', { type: 'income', category: 'Salário', description: 'Empresa', amount: 100 });
    vi.mocked(notifier.notifyEntriesChanged).mockClear();

    await undo.execute('user-1');

    expect(incomeRepo.items).toHaveLength(0);
    expect(notifier.notifyEntriesChanged).toHaveBeenCalledWith('user-1');
  });

  it('does not notify when there is nothing to undo', async () => {
    await undo.execute('user-1');

    expect(notifier.notifyEntriesChanged).not.toHaveBeenCalled();
  });
});
