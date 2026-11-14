import { dateAtNoon } from '@/lib/month';
import type { DateRange } from '../models/date-range';
import type { LedgerEntry } from '../models/ledger-entry';
import type { LiveMovementsData, LiveTransactionItem } from '../models/financial-types';
import { getCategoryColor } from '../models/category-colors';
import { DEFAULT_STATEMENT_FILTERS, type StatementFilters } from '../models/statement-filters';
import { categoriesOf } from './filter-ledger-entries';
import { selectStatementEntries } from './select-statement-entries';
import { entriesInRange, totalsByCategory, totalsOf } from './summarize-ledger';

export type CardNames = Record<string, string>;

function toTransactionItem(entry: LedgerEntry, cardNames: CardNames): LiveTransactionItem {
  return {
    id: entry.id,
    dateStr: entry.date,
    rawDate: dateAtNoon(entry.date),
    type: entry.kind,
    description: entry.description,
    account: entry.account,
    category: entry.category,
    amount: entry.amount,
    bank: entry.account,
    isCreditCard: false,
    ...(entry.necessity && { necessity: entry.necessity }),
    ...(entry.imported && { imported: true }),
    ...(entry.creditCardId && { creditCardId: entry.creditCardId }),
    ...(entry.creditCardId && cardNames[entry.creditCardId] && { creditCardName: cardNames[entry.creditCardId] }),
    fixed: entry.fixed,
    reason: entry.reason,
    status: entry.status,
  };
}

export function buildMovementsData(
  entries: LedgerEntry[],
  range: DateRange,
  filters: StatementFilters = DEFAULT_STATEMENT_FILTERS,
  cardNames: CardNames = {}
): LiveMovementsData {
  const monthEntries = entriesInRange(entries, range);
  const totals = totalsOf(monthEntries);
  const pendingEntries = monthEntries.filter((entry) => entry.status === 'pending_reason');
  const totalPending = pendingEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return {
    totalExpenses: totals.expenses,
    totalPending,
    totalIncome: totals.income,
    totalInvestments: totals.investments,
    netBalance: totals.balance,
    categorizedExpenses: totalsByCategory(monthEntries, 'expense').map(({ category, total }) => ({
      name: category,
      amount: total,
      percentage: totals.expenses > 0 ? Math.round((total / totals.expenses) * 100) : 0,
      color: getCategoryColor(category),
    })),
    pendingExpenses: totalsByCategory(pendingEntries, 'expense').map(({ category, total }) => ({
      name: category,
      amount: total,
      percentage: totalPending > 0 ? Math.round((total / totalPending) * 100) : 0,
      color: getCategoryColor(category),
    })),
    transactions: selectStatementEntries(entries, range, filters).map((entry) => toTransactionItem(entry, cardNames)),
    categoryOptions: categoriesOf(monthEntries),
  };
}
