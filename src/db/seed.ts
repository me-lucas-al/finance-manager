import { eq } from 'drizzle-orm';
import { db } from './index';
import * as schema from './schema';
import { hashPassword } from '../modules/auth/domain/password';

async function main() {
  console.log('Seeding database...');
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, 'test@example.com'));
  if (existing.length > 0) {
    console.log('Database already seeded (user test@example.com exists).');
    process.exit(0);
  }

  const passwordHash = await hashPassword('123456');

  const [user] = await db.insert(schema.users).values({
    id: crypto.randomUUID(),
    name: 'Test User',
    email: 'test@example.com',
    passwordHash,
  }).returning();

  await db.insert(schema.userSettings).values({
    id: crypto.randomUUID(),
    userId: user.id,
    periodStartDay: 15,
    periodEndDay: 14,
    maxExpensesPercentage: 80,
    minInvestmentPercentage: 20,
    expenseCategories: ['Moradia', 'Alimentação', 'Transporte'],
    investmentTypes: ['Renda Fixa', 'Ações'],
  });

  const [period] = await db.insert(schema.financialPeriods).values({
    id: crypto.randomUUID(),
    userId: user.id,
    startDate: new Date('2026-09-15'),
    endDate: new Date('2026-10-14'),
    status: 'OPEN',
  }).returning();

  await db.insert(schema.incomes).values({
    id: crypto.randomUUID(),
    userId: user.id,
    periodId: period.id,
    description: 'Salário',
    amount: '5000.00',
    category: 'Salário',
    receivedAt: new Date('2026-09-20'),
  });

  console.log('Seeding completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

