import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  financialPeriods,
  periodSnapshots,
  incomes,
  investments,
  userSettings,
  notificationPreferences,
} from '@/db/schema';
import { calculateMetrics } from '../domain/financial-metrics';
import { NotificationFactory } from '@/modules/notifications/domain/notification-factory';
import type { ExpenseBreakdownReader } from '@/modules/open-finance/application/shared/expense-totals';
import { notifyPeriodUser } from './notify-period-user';
import { openNextPeriodIfMissing } from './open-next-period';

export type ClosePeriodResult = { success: boolean; message: string; snapshotId?: string };

const ALREADY_CLOSED: ClosePeriodResult = { success: true, message: 'Period already closed' };
const EMPTY_BREAKDOWN = { total: 0, byCategory: {} };

export async function closeFinancialPeriod(
  periodId: string,
  userId: string,
  readExpenseBreakdown: ExpenseBreakdownReader
): Promise<ClosePeriodResult> {
  const [period] = await db.select().from(financialPeriods).where(
    and(eq(financialPeriods.id, periodId), eq(financialPeriods.userId, userId))
  );

  if (!period) throw new Error('Period not found');
  if (period.status === 'CLOSED') return ALREADY_CLOSED;

  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
  const maxExpenses = settings?.maxExpensesPercentage ?? 80;
  const minInvestments = settings?.minInvestmentPercentage ?? 20;

  const [periodIncomes, periodInvestments, expenseBreakdown] = await Promise.all([
    db.select().from(incomes).where(and(eq(incomes.periodId, periodId), eq(incomes.userId, userId))),
    db.select().from(investments).where(and(eq(investments.periodId, periodId), eq(investments.userId, userId))),
    readExpenseBreakdown(userId, period.startDate, period.endDate).catch(() => EMPTY_BREAKDOWN),
  ]);

  const totalIncomes = periodIncomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpenses = expenseBreakdown.total;
  const totalInvestments = periodInvestments.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const metrics = calculateMetrics(
    periodIncomes.map(i => Number(i.amount)),
    [totalExpenses],
    periodInvestments.map(i => Number(i.amount)),
    maxExpenses,
    minInvestments
  );

  const [closedPeriod] = await db.update(financialPeriods)
    .set({ status: 'CLOSED', closedAt: new Date() })
    .where(and(eq(financialPeriods.id, periodId), eq(financialPeriods.status, 'OPEN')))
    .returning();

  if (!closedPeriod) return ALREADY_CLOSED;

  const snapshotId = crypto.randomUUID();
  await db.insert(periodSnapshots).values({
    id: snapshotId,
    userId,
    periodId,
    totalIncomes: totalIncomes.toString(),
    totalExpenses: totalExpenses.toString(),
    totalInvestments: totalInvestments.toString(),
    balance: metrics.balance.toString(),
    expensePercentage: metrics.expensePercentage.toString(),
    investmentPercentage: metrics.investmentPercentage.toString(),
    status: metrics.status,
  }).onConflictDoNothing({ target: periodSnapshots.periodId });

  const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  const closingNotificationsEnabled = prefs?.closingNotificationsEnabled ?? true;
  const pushNotificationsEnabled = prefs?.pushNotificationsEnabled ?? false;

  if (closingNotificationsEnabled) {
    await notifyPeriodUser(NotificationFactory.createPeriodClosed(userId), pushNotificationsEnabled);
  }

  const openedNext = await openNextPeriodIfMissing(userId, period, settings);
  if (openedNext && closingNotificationsEnabled) {
    await notifyPeriodUser(NotificationFactory.createNewPeriod(userId), pushNotificationsEnabled);
  }

  return { success: true, message: 'Period closed and next period created', snapshotId };
}
