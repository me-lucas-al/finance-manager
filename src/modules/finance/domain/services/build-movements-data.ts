import { dateAtNoon } from '@/lib/month';
import type { LedgerEntry } from '../models/ledger-entry';
import type { LiveMovementsData, LiveTransactionItem } from '../models/financial-types';
import { getCategoryColor } from '../models/category-colors';
import { entriesInMonth, totalsByCategory, totalsOf } from './summarize-ledger';

function toTransactionItem(entry: LedgerEntry): LiveTransactionItem {
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
    fixed: entry.fixed,
  };
}

export function buildMovementsData(entries: LedgerEntry[], month: string): LiveMovementsData {
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
    transactions: monthEntries.map(toTransactionItem),
  };
}
