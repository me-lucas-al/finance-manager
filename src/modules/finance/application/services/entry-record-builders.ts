import { dateAtNoon } from '@/lib/month';
import type { NewTransaction, TransactionNecessity } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { NewIncome } from '../../domain/repositories/income-repository';
import type { NewInvestment } from '../../domain/repositories/investment-repository';
import type { ParsedEntry } from '../../domain/parsers/parse-entry-message';
import type { FixedLaunchLink } from '../../domain/models/fixed-entry';

export function buildNewIncome(userId: string, periodId: string, entry: ParsedEntry, date: string, fixed?: FixedLaunchLink): NewIncome {
  return {
    userId,
    periodId,
    amount: entry.amount,
    description: entry.description,
    category: entry.category,
    receivedAt: dateAtNoon(date),
    ...(fixed ? { fixedEntryId: fixed.fixedEntryId, fixedReferenceMonth: fixed.referenceMonth } : {}),
  };
}

export function buildNewInvestment(userId: string, periodId: string, entry: ParsedEntry, date: string): NewInvestment {
  return {
    userId,
    periodId,
    amount: entry.amount,
    description: entry.description,
    type: entry.category,
    date: dateAtNoon(date),
  };
}

export function buildNewExpense(
  userId: string,
  entry: ParsedEntry,
  date: string,
  necessity: TransactionNecessity,
  fixed?: FixedLaunchLink
): NewTransaction {
  return {
    userId,
    pluggyTransactionId: null,
    accountId: null,
    bank: 'Manual',
    amount: entry.amount,
    description: entry.description,
    occurredAt: date,
    category: entry.category,
    categorySuggested: null,
    reason: null,
    status: 'categorized',
    source: 'manual',
    necessity,
    telegramQuestionMessageId: null,
    ...(fixed ? { fixedEntryId: fixed.fixedEntryId, fixedReferenceMonth: fixed.referenceMonth } : {}),
  };
}
