import { vi } from 'vitest';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { OwnedEntryGuard } from '@/modules/finance/application/services/owned-entry-guard';
import { ExpensePatternAnalyzer } from '@/modules/finance/application/services/expense-pattern-analyzer';
import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import type { EntryChangeNotifier } from '@/modules/finance/domain/ports/entry-change-notifier';
import { FakeTransactionRepository } from './fake-transaction-repository';
import { FakePeriodRepository } from './fake-period-repository';
import { FakeSettingRepository } from './fake-setting-repository';
import { FakeIncomeRepository } from './fake-income-repository';
import { FakeInvestmentRepository } from './fake-investment-repository';
import { FakeLanguageModel } from './fake-language-model';

export function buildFakeEntryServices() {
  const transactionRepo = new FakeTransactionRepository();
  const incomeRepo = new FakeIncomeRepository();
  const investmentRepo = new FakeInvestmentRepository();
  const language = new FakeLanguageModel();
  language.nextStructuredResponse = { necessity: 'importante' };
  const notifier: EntryChangeNotifier = { notifyEntriesChanged: vi.fn(async () => {}) };
  const classifyNecessity = new ClassifyNecessityService(transactionRepo, language);
  const guard = new OwnedEntryGuard(transactionRepo, incomeRepo, investmentRepo);

  return {
    transactionRepo,
    incomeRepo,
    investmentRepo,
    notifier,
    guard,
    registerEntry: new RegisterManualEntryUseCase(
      transactionRepo,
      incomeRepo,
      investmentRepo,
      new ResolveCurrentPeriodUseCase(new FakePeriodRepository(), new FakeSettingRepository()),
      classifyNecessity,
      new ExpensePatternAnalyzer(transactionRepo),
      notifier
    ),
    updateEntry: new UpdateEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, classifyNecessity, notifier),
    deleteEntry: new DeleteEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, notifier),
  };
}
