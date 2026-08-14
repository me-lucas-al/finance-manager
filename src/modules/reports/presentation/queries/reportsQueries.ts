import { db } from '@/db/connection';
import { incomes } from '@/db/schema/incomes';
import { expenses } from '@/db/schema/expenses';
import { investments } from '@/db/schema/investments';
import { financialPeriods } from '@/db/schema/financialPeriods';
import { and, eq, gte, lte, ilike } from 'drizzle-orm';

export interface ReportFilters {
  userId: string;
  periodId?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
}

export async function getReportData(filters: ReportFilters) {
  const { userId, periodId, startDate, endDate, category } = filters;

  // Incomes
  const incomesConditions = [eq(incomes.userId, userId)];
  if (periodId) incomesConditions.push(eq(incomes.periodId, periodId));
  if (startDate) incomesConditions.push(gte(incomes.receivedAt, startDate));
  if (endDate) incomesConditions.push(lte(incomes.receivedAt, endDate));
  if (category) incomesConditions.push(ilike(incomes.category, `%${category}%`));

  const incomesData = await db
    .select({ amount: incomes.amount, category: incomes.category })
    .from(incomes)
    .where(and(...incomesConditions));

  // Expenses
  const expensesConditions = [eq(expenses.userId, userId)];
  if (periodId) expensesConditions.push(eq(expenses.periodId, periodId));
  if (startDate) expensesConditions.push(gte(expenses.date, startDate));
  if (endDate) expensesConditions.push(lte(expenses.date, endDate));
  if (category) expensesConditions.push(ilike(expenses.category, `%${category}%`));

  const expensesData = await db
    .select({ amount: expenses.amount, category: expenses.category })
    .from(expenses)
    .where(and(...expensesConditions));

  // Investments
  const investmentsConditions = [eq(investments.userId, userId)];
  if (periodId) investmentsConditions.push(eq(investments.periodId, periodId));
  if (startDate) investmentsConditions.push(gte(investments.date, startDate));
  if (endDate) investmentsConditions.push(lte(investments.date, endDate));
  if (category) investmentsConditions.push(ilike(investments.type, `%${category}%`));

  const investmentsData = await db
    .select({ amount: investments.amount })
    .from(investments)
    .where(and(...investmentsConditions));

  return {
    incomes: incomesData,
    expenses: expensesData,
    investments: investmentsData,
  };
}
