import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  financialPeriods,
  periodSnapshots,
  incomes,
  expenses,
  investments,
  userSettings,
  notifications,
  notificationPreferences,
} from '@/db/schema';
import { calculateMetrics } from '../domain/financial-metrics';
import { getFinancialPeriod } from '@/modules/periods/domain/financial-period';
import { NotificationFactory } from '@/modules/notifications/domain/NotificationFactory';
import { NotificationPayload } from '@/modules/notifications/domain/NotificationTypes';
import { PushService } from '@/modules/notifications/push/PushService';

async function notifyUser(payload: NotificationPayload, pushEnabled: boolean) {
  await db.insert(notifications).values({
    id: crypto.randomUUID(),
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
  });

  if (pushEnabled) {
    await PushService.sendNotificationToUser(payload.userId, payload).catch((error) => {
      console.error('Failed to send push notification:', error);
    });
  }
}

// neon-http does not support transactions, so idempotency is guaranteed by a
// conditional UPDATE (OPEN -> CLOSED) that acts as a single-winner lock instead.
export async function closeFinancialPeriod(periodId: string, userId: string) {
  const [period] = await db.select().from(financialPeriods).where(
    and(eq(financialPeriods.id, periodId), eq(financialPeriods.userId, userId))
  );

  if (!period) throw new Error('Period not found');
  if (period.status === 'CLOSED') {
    return { success: true, message: 'Period already closed' };
  }

  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
  const maxExpenses = settings?.maxExpensesPercentage ?? 80;
  const minInvestments = settings?.minInvestmentPercentage ?? 20;

  const [periodIncomes, periodExpenses, periodInvestments] = await Promise.all([
    db.select().from(incomes).where(and(eq(incomes.periodId, periodId), eq(incomes.userId, userId))),
    db.select().from(expenses).where(and(eq(expenses.periodId, periodId), eq(expenses.userId, userId))),
    db.select().from(investments).where(and(eq(investments.periodId, periodId), eq(investments.userId, userId))),
  ]);

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

  // Only one caller can win this conditional update; a concurrent/duplicate
  // call sees 0 affected rows and returns early below.
  const [closedPeriod] = await db.update(financialPeriods)
    .set({ status: 'CLOSED', closedAt: new Date() })
    .where(and(eq(financialPeriods.id, periodId), eq(financialPeriods.status, 'OPEN')))
    .returning();

  if (!closedPeriod) {
    return { success: true, message: 'Period already closed' };
  }

  await db.insert(periodSnapshots).values({
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
  }).onConflictDoNothing({ target: periodSnapshots.periodId });

  const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  const closingNotificationsEnabled = prefs?.closingNotificationsEnabled ?? true;
  const pushNotificationsEnabled = prefs?.pushNotificationsEnabled ?? false;

  if (closingNotificationsEnabled) {
    await notifyUser(NotificationFactory.createPeriodClosed(userId), pushNotificationsEnabled);
  }

  const existingOpenPeriods = await db.select().from(financialPeriods).where(
    and(eq(financialPeriods.userId, userId), eq(financialPeriods.status, 'OPEN'))
  );

  if (existingOpenPeriods.length === 0) {
    const nextReferenceDate = new Date(period.endDate);
    nextReferenceDate.setDate(nextReferenceDate.getDate() + 1);

    const { start: nextStart, end: nextEnd } = getFinancialPeriod(
      nextReferenceDate,
      settings?.periodStartDay ?? 15,
      settings?.periodEndDay ?? 14
    );

    await db.insert(financialPeriods).values({
      id: crypto.randomUUID(),
      userId,
      startDate: nextStart,
      endDate: nextEnd,
      status: 'OPEN',
    });

    if (closingNotificationsEnabled) {
      await notifyUser(NotificationFactory.createNewPeriod(userId), pushNotificationsEnabled);
    }
  }

  return { success: true, message: 'Period closed and next period created' };
}
