import { closeFinancialPeriod } from '@/modules/finance/infrastructure/close-financial-period';
import { SendMonthlyClosingSummaryUseCase } from '@/modules/open-finance/application/use-cases/send-monthly-closing-summary';
import { languageModel } from './language-model';
import { readExpenseBreakdown } from './open-finance';
import { periodSnapshotRepository } from './periods';
import { telegramMessenger } from './telegram';

export const closePeriod = (periodId: string, userId: string) =>
  closeFinancialPeriod(periodId, userId, readExpenseBreakdown);

export const sendMonthlyClosingSummary = new SendMonthlyClosingSummaryUseCase(
  languageModel,
  periodSnapshotRepository,
  telegramMessenger,
);
