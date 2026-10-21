import { buildFakePeriodResolver } from '@/tests/fakes/fake-period-resolver';
import { vi } from 'vitest';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { ExpensePatternAnalyzer } from '@/modules/finance/application/services/expense-pattern-analyzer';
import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { OwnedEntryGuard } from '@/modules/finance/application/services/owned-entry-guard';
import { FixedEntryLauncher } from '@/modules/finance/application/fixed-entries/fixed-entry-launcher';
import { GenerateDueFixedEntriesUseCase } from '@/modules/finance/application/fixed-entries/generate-due-fixed-entries';
import { CreateFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/create-fixed-entry';
import { UpdateFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/update-fixed-entry';
import { SetFixedEntryActiveUseCase } from '@/modules/finance/application/fixed-entries/set-fixed-entry-active';
import { DeleteFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/delete-fixed-entry';
import { ListFixedEntriesUseCase } from '@/modules/finance/application/fixed-entries/list-fixed-entries';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import { FakePeriodRepository } from '@/tests/fakes/fake-period-repository';
import { FakeSettingRepository } from '@/tests/fakes/fake-setting-repository';
import { FakeIncomeRepository } from '@/tests/fakes/fake-income-repository';
import { FakeInvestmentRepository } from '@/tests/fakes/fake-investment-repository';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';
import { noopCardLinkValidator } from '@/tests/fakes/noop-card-link-validator';
import { FakeFixedEntryRepository } from '@/tests/fakes/fake-fixed-entry-repository';
import { FakeFixedLaunchLookup } from '@/tests/fakes/fake-fixed-launch-lookup';

export const FIXED_USER = 'user-1';

export function createFixedEntryHarness(initialNow = new Date('2026-03-10T15:00:00Z')) {
  let now = initialNow;
  const clock = () => now;
  const transactionRepo = new FakeTransactionRepository();
  const incomeRepo = new FakeIncomeRepository();
  const investmentRepo = new FakeInvestmentRepository();
  const rules = new FakeFixedEntryRepository();
  const announcer = { announceLaunched: vi.fn(async () => {}) };
  const notifier = { notifyEntriesChanged: vi.fn(async () => {}) };
  const classify = new ClassifyNecessityService(transactionRepo, new FakeLanguageModel());
  const register = new RegisterManualEntryUseCase(
    transactionRepo,
    incomeRepo,
    investmentRepo,
    new ResolveCurrentPeriodUseCase(new FakePeriodRepository(), new FakeSettingRepository()),
    classify,
    new ExpensePatternAnalyzer(transactionRepo),
    notifier,
    noopCardLinkValidator
  );
  const guard = new OwnedEntryGuard(transactionRepo, incomeRepo, investmentRepo);
  const updateEntry = new UpdateEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, classify, notifier, noopCardLinkValidator, buildFakePeriodResolver());
  const deleteEntry = new DeleteEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, notifier);
  const lookup = new FakeFixedLaunchLookup({
    transactions: () => transactionRepo.findAllByUserId(FIXED_USER),
    incomes: () => incomeRepo.items,
  });
  const launcher = new FixedEntryLauncher(register, announcer);

  return {
    transactionRepo,
    incomeRepo,
    rules,
    announcer,
    notifier,
    lookup,
    launcher,
    setNow: (date: Date) => {
      now = date;
    },
    generate: new GenerateDueFixedEntriesUseCase(rules, lookup, launcher, clock),
    create: new CreateFixedEntryUseCase(rules, launcher, notifier, clock),
    update: new UpdateFixedEntryUseCase(rules, lookup, updateEntry, notifier, clock),
    setActive: new SetFixedEntryActiveUseCase(rules, notifier, clock),
    remove: new DeleteFixedEntryUseCase(rules, lookup, deleteEntry, notifier, () => '2026-03'),
    list: new ListFixedEntriesUseCase(rules, lookup, clock),
  };
}
