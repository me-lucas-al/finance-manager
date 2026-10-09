import { getEffectiveUserId } from '@/app/actions/require-session';
import { db } from '@/db';
import { incomes, investments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import type { LiveOverviewData } from '@/modules/finance/domain/models/financial-types';

export async function getLiveOverviewData(overrideUserId?: string): Promise<LiveOverviewData> {
  const userId = overrideUserId ?? (await getEffectiveUserId());
  const repo = new SupabaseTransactionRepository();

  const [dbIncomes, dbInvestments, txs] = await Promise.all([
    db.select().from(incomes).where(eq(incomes.userId, userId)),
    db.select().from(investments).where(eq(investments.userId, userId)),
    repo.findAllByUserId(userId),
  ]);

  const totalIncome = dbIncomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = txs.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const bankTotal = Math.max(0, totalIncome - totalExpenses);

  const investmentTotal = dbInvestments.reduce((sum, item) => sum + Number(item.amount), 0);
  const activeCount = dbInvestments.filter((item) => Number(item.amount) > 0).length;

  const instMap = new Map<string, { count: number; amount: number }>();
  for (const inv of dbInvestments) {
    const key = inv.type || 'Outros';
    const cur = instMap.get(key) ?? { count: 0, amount: 0 };
    cur.count += 1;
    cur.amount += Number(inv.amount);
    instMap.set(key, cur);
  }

  const investmentInstitutions = Array.from(instMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    amount: data.amount,
  }));

  const monthsMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    monthsMap.set(key, 0);
  }

  for (const inc of dbIncomes) {
    const key = inc.receivedAt.toISOString().slice(0, 7);
    if (monthsMap.has(key)) monthsMap.set(key, (monthsMap.get(key) ?? 0) + Number(inc.amount));
  }
  for (const tx of txs) {
    const key = tx.occurredAt.slice(0, 7);
    if (monthsMap.has(key)) monthsMap.set(key, (monthsMap.get(key) ?? 0) - Number(tx.amount));
  }

  const evolutionData = Array.from(monthsMap.entries()).map(([date, value]) => ({ date, value }));

  return {
    bankTotal,
    bankAccounts: [
      { id: 'primary', bank: 'manual', name: 'Saldo Disponível', countText: 'Principal', amount: bankTotal },
    ],
    cardTotal: 0,
    cardLimit: 0,
    cardUsedPercentage: 0,
    cards: [],
    investmentTotal,
    investmentCount: dbInvestments.length,
    activeInvestmentCount: activeCount,
    inactiveInvestmentCount: dbInvestments.length - activeCount,
    evolutionBalance: bankTotal,
    evolutionData,
    investmentInstitutions,
  };
}
