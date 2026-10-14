import type { ILanguageModel } from '@/modules/ai/domain/models/language-model';
import type { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '@/modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '@/modules/users/infrastructure/repositories';
import { ClassifyNecessityService } from '../application/services/classify-necessity-service';
import { ExpensePatternAnalyzer } from '../application/services/expense-pattern-analyzer';
import { LedgerService } from '../application/services/ledger-service';
import { OwnedEntryGuard } from '../application/services/owned-entry-guard';
import { UndoLastEntryService } from '../application/services/undo-last-entry-service';
import { DeleteEntryUseCase } from '../application/use-cases/delete-entry';
import { RegisterManualEntryUseCase } from '../application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '../application/use-cases/update-entry';
import { DrizzleIncomeRepository, DrizzleInvestmentRepository } from './repositories';
import { NextEntryChangeNotifier } from './next-entry-change-notifier';
import { PersistenceLedgerSource } from './persistence-ledger-source';
import { createPortfolioService } from './portfolio-factory';

export type EntryServicesDeps = {
  llm: ILanguageModel;
  goalRepo: GoalRepository;
};

export function buildEntryServices({ llm, goalRepo }: EntryServicesDeps) {
  const transactionRepo = new SupabaseTransactionRepository();
  const incomeRepo = new DrizzleIncomeRepository();
  const investmentRepo = new DrizzleInvestmentRepository();
  const notifier = new NextEntryChangeNotifier();
  const classifyNecessity = new ClassifyNecessityService(transactionRepo, llm);
  const guard = new OwnedEntryGuard(transactionRepo, incomeRepo, investmentRepo);

  const registerEntry = new RegisterManualEntryUseCase(
    transactionRepo,
    incomeRepo,
    investmentRepo,
    new ResolveCurrentPeriodUseCase(new DrizzlePeriodRepository(), new DrizzleSettingRepository()),
    classifyNecessity,
    new ExpensePatternAnalyzer(transactionRepo, goalRepo),
    notifier
  );

  return {
    ledger: new LedgerService(new PersistenceLedgerSource(transactionRepo)),
    portfolio: createPortfolioService(),
    registerEntry,
    updateEntry: new UpdateEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, classifyNecessity, notifier),
    deleteEntry: new DeleteEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, notifier),
    undoService: new UndoLastEntryService(transactionRepo, incomeRepo, investmentRepo, notifier),
  };
}
