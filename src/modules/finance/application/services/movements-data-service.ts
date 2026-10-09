import { getEffectiveUserId } from '@/app/actions/require-session';
import { db } from '@/db';
import { incomes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import type { LiveMovementsData, LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';
import { getCategoryColor } from '@/modules/finance/domain/models/category-colors';

export async function getLiveMovementsData(month: string, overrideUserId?: string): Promise<LiveMovementsData> {
  const userId = overrideUserId ?? (await getEffectiveUserId());
  const repo = new SupabaseTransactionRepository();

  const [dbIncomes, txs] = await Promise.all([
    db.select().from(incomes).where(eq(incomes.userId, userId)),
    repo.findAllByUserId(userId, { month }),
  ]);

  const monthIncomes = dbIncomes.filter((inc) => inc.receivedAt.toISOString().slice(0, 7) === month);
  const totalIncome = monthIncomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = txs.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  const categoryTotals = new Map<string, number>();
  for (const tx of txs) {
    const cat = tx.category || 'Outros';
    categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + Number(tx.amount));
  }

  const categorizedExpenses = Array.from(categoryTotals.entries()).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    color: getCategoryColor(name),
  }));

  const items: LiveTransactionItem[] = [
    ...txs.map((tx) => ({
      id: tx.id,
      dateStr: tx.occurredAt,
      rawDate: new Date(tx.occurredAt),
      type: 'expense' as const,
      description: tx.description,
      account: tx.bank,
      category: tx.category || 'Outros',
      amount: Number(tx.amount),
      bank: tx.bank,
      isCreditCard: false,
    })),
    ...monthIncomes.map((inc) => ({
      id: inc.id,
      dateStr: inc.receivedAt.toISOString().slice(0, 10),
      rawDate: inc.receivedAt,
      type: 'income' as const,
      description: inc.description,
      account: 'Manual',
      category: inc.category,
      amount: Number(inc.amount),
      bank: 'Manual',
      isCreditCard: false,
    })),
  ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  return {
    totalExpenses,
    totalPending: 0,
    totalIncome,
    netBalance,
    categorizedExpenses,
    pendingExpenses: [],
    transactions: items,
  };
}
