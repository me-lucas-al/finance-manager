import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

async function main() {
  console.log('Seeding database...');
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = `${salt}:${hashPassword('123456', salt)}`;

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
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
