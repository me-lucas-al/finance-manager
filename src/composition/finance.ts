import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { ExpensePatternAnalyzer } from '@/modules/finance/application/services/expense-pattern-analyzer';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { OwnedEntryGuard } from '@/modules/finance/application/services/owned-entry-guard';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { UndoLastEntryService } from '@/modules/finance/application/services/undo-last-entry-service';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DrizzleIncomeRepository } from '@/modules/finance/infrastructure/drizzle-income-repository';
import { DrizzleInvestmentRepository } from '@/modules/finance/infrastructure/drizzle-investment-repository';
import { NextEntryChangeNotifier } from '@/modules/finance/infrastructure/next-entry-change-notifier';
import { PersistenceLedgerSource } from '@/modules/finance/infrastructure/persistence-ledger-source';
import { PersistencePortfolioSource } from '@/modules/finance/infrastructure/persistence-portfolio-source';
import { languageModel } from './language-model';
import { accountRepository, goalRepository, transactionRepository } from './open-finance';
import { resolveCurrentPeriod } from './periods';

export const incomeRepository = new DrizzleIncomeRepository();
export const investmentRepository = new DrizzleInvestmentRepository();
export const entryChangeNotifier = new NextEntryChangeNotifier();

export const ledgerService = new LedgerService(new PersistenceLedgerSource(transactionRepository));
export const portfolioService = new PortfolioService(new PersistencePortfolioSource(accountRepository));

const classifyNecessity = new ClassifyNecessityService(transactionRepository, languageModel);
const ownedEntryGuard = new OwnedEntryGuard(transactionRepository, incomeRepository, investmentRepository);

export const registerEntry = new RegisterManualEntryUseCase(
  transactionRepository,
  incomeRepository,
  investmentRepository,
  resolveCurrentPeriod,
  classifyNecessity,
  new ExpensePatternAnalyzer(transactionRepository, goalRepository),
  entryChangeNotifier,
);

export const updateEntry = new UpdateEntryUseCase(
  transactionRepository,
  incomeRepository,
  investmentRepository,
  ownedEntryGuard,
  classifyNecessity,
  entryChangeNotifier,
);

export const deleteEntry = new DeleteEntryUseCase(
  transactionRepository,
  incomeRepository,
  investmentRepository,
  ownedEntryGuard,
  entryChangeNotifier,
);

export const undoLastEntry = new UndoLastEntryService(
  transactionRepository,
  incomeRepository,
  investmentRepository,
  entryChangeNotifier,
);
