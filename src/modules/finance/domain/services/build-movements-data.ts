import { dateAtNoon } from '@/lib/month';
import type { LedgerEntry } from '../models/ledger-entry';
import type { LiveMovementsData, LiveTransactionItem } from '../models/financial-types';
import { getCategoryColor } from '../models/category-colors';
import { DEFAULT_STATEMENT_FILTERS, type StatementFilters } from '../models/statement-filters';
import { categoriesOf } from './filter-ledger-entries';
import { selectStatementEntries } from './select-statement-entries';
import { entriesInMonth, totalsByCategory, totalsOf } from './summarize-ledger';

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
  };
}

export function buildMovementsData(
  entries: LedgerEntry[],
  month: string,
  filters: StatementFilters = DEFAULT_STATEMENT_FILTERS,
  cardNames: CardNames = {}
): LiveMovementsData {
  const monthEntries = entriesInMonth(entries, month);
  const totals = totalsOf(monthEntries);

  return {
    totalExpenses: totals.expenses,
    totalPending: 0,
    totalIncome: totals.income,
    totalInvestments: totals.investments,
    netBalance: totals.balance,
    categorizedExpenses: totalsByCategory(monthEntries, 'expense').map(({ category, total }) => ({
      name: category,
      amount: total,
      percentage: totals.expenses > 0 ? Math.round((total / totals.expenses) * 100) : 0,
      color: getCategoryColor(category),
    })),
    pendingExpenses: [],
    transactions: selectStatementEntries(entries, month, filters).map((entry) => toTransactionItem(entry, cardNames)),
    categoryOptions: categoriesOf(monthEntries),
  };
}
