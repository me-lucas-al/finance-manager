import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { users } from '../src/db/schema/users';
import { financialPeriods } from '../src/db/schema/financialPeriods';
import { userSettings } from '../src/db/schema/userSettings';
import { expenses } from '../src/db/schema/expenses';
import { investments } from '../src/db/schema/investments';
import { notificationPreferences } from '../src/db/schema/notificationPreferences';
import { hashPassword } from '../src/lib/password';
import { eq } from 'drizzle-orm';

const sql = postgres('postgresql://postgres:postgres@localhost:5433/finance_manager_test');
const db = drizzle(sql);

export async function seedTestUser(email: string, passwordHash: string) {
  const [user] = await db.insert(users).values({
    name: 'Test User',
    email,
    passwordHash,
  }).returning();

  // Create settings
  await db.insert(userSettings).values({
    userId: user.id,
    expenseCategories: ['Alimentação', 'Transporte', 'Moradia', 'Lazer'],
    investmentTypes: ['Renda Fixa', 'Ações', 'Cripto'],
    maxExpensesPercentage: 70,
    minInvestmentPercentage: 20,
  });

  // Create notification preferences
  await db.insert(notificationPreferences).values({
    userId: user.id,
    expenseNotificationsEnabled: true,
  });

  // Create a period
  const [period] = await db.insert(financialPeriods).values({
    userId: user.id,
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    status: 'open',
  }).returning();

  return { user, period };
}

export async function cleanupTestUser(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (user) {
    await db.delete(expenses).where(eq(expenses.userId, user.id));
    await db.delete(investments).where(eq(investments.userId, user.id));
    await db.delete(financialPeriods).where(eq(financialPeriods.userId, user.id));
    await db.delete(userSettings).where(eq(userSettings.userId, user.id));
    await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  }
}

export async function closeDb() {
  await sql.end();
}
