import { eq, and, lte } from 'drizzle-orm';
import { db } from '@/db';
import { financialPeriods, periodSnapshots, incomes, expenses, investments, userSettings } from '@/db/schema';
import { calculateMetrics } from '../../domain/financial-metrics';

export async function closeFinancialPeriod(periodId: string, userId: string) {
  // Use a transaction
  return await db.transaction(async (tx) => {
    // 1. Get period and ensure it is open
    const [period] = await tx.select().from(financialPeriods).where(
      and(eq(financialPeriods.id, periodId), eq(financialPeriods.userId, userId))
    );

    if (!period) throw new Error('Period not found');
    if (period.status === 'CLOSED') {
      return { success: true, message: 'Period already closed' };
    }

    // 2. Get settings
    const [settings] = await tx.select().from(userSettings).where(eq(userSettings.userId, userId));
    const maxExpenses = settings?.maxExpensesPercentage ?? 80;
    const minInvestments = settings?.minInvestmentPercentage ?? 20;

    // 3. Get all transactions for the period
    const periodIncomes = await tx.select().from(incomes).where(and(eq(incomes.periodId, periodId), eq(incomes.userId, userId)));
    const periodExpenses = await tx.select().from(expenses).where(and(eq(expenses.periodId, periodId), eq(expenses.userId, userId)));
    const periodInvestments = await tx.select().from(investments).where(and(eq(investments.periodId, periodId), eq(investments.userId, userId)));

    const totalIncomes = periodIncomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpenses = periodExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalInvestments = periodInvestments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const metrics = calculateMetrics(
      periodIncomes.map(i => Number(i.amount)),
      periodExpenses.map(e => Number(e.amount)),
      periodInvestments.map(i => Number(i.amount)),
      maxExpenses,
      minInvestments
    );

    // 4. Create Snapshot
    await tx.insert(periodSnapshots).values({
      id: crypto.randomUUID(),
      userId,
      periodId,
      totalIncomes: totalIncomes.toString(),
      totalExpenses: totalExpenses.toString(),
      totalInvestments: totalInvestments.toString(),
      balance: metrics.balance.toString(),
      expensePercentage: metrics.expensePercentage.toString(),
      investmentPercentage: metrics.investmentPercentage.toString(),
      status: metrics.status,
    });

    // 5. Mark as closed
    await tx.update(financialPeriods)
      .set({ status: 'CLOSED', closedAt: new Date() })
      .where(eq(financialPeriods.id, periodId));

    // 6. Create Next Period
    // Find next period dates based on current period end
    const nextStart = new Date(period.endDate);
    nextStart.setDate(nextStart.getDate() + 1);
    
    let nextEnd = new Date(nextStart);
    nextEnd.setMonth(nextEnd.getMonth() + 1);
    // Simple logic for next end date based on settings
    nextEnd.setDate(settings?.periodEndDay ?? 14);

    await tx.insert(financialPeriods).values({
      id: crypto.randomUUID(),
      userId,
      startDate: nextStart,
      endDate: nextEnd,
      status: 'OPEN',
    });

    return { success: true, message: 'Period closed and next period created' };
  });
}
