import { db } from '@/db/connection';
import { expenses } from '@/db/schema/expenses';
import { incomes } from '@/db/schema/incomes';
import { investments } from '@/db/schema/investments';
import { financialPeriods } from '@/db/schema/financialPeriods';
import { userSettings } from '@/db/schema/userSettings';
import { eq, asc } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export async function getAnalyticsData() {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  const userId = session.userId;

  // Fetch all periods for this user
  const allPeriods = await db.select().from(financialPeriods).where(eq(financialPeriods.userId, userId)).orderBy(asc(financialPeriods.startDate));
  const activePeriod = allPeriods.find(p => p.status === 'open') || allPeriods[allPeriods.length - 1];

  // Fetch user settings
  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));

  // Fetch data for all periods
  const allExpenses = await db.select().from(expenses).where(eq(expenses.userId, userId));
  const allIncomes = await db.select().from(incomes).where(eq(incomes.userId, userId));
  const allInvestments = await db.select().from(investments).where(eq(investments.userId, userId));

  return {
    allPeriods,
    activePeriod,
    settings,
    allExpenses,
    allIncomes,
    allInvestments
  };
}
