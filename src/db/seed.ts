import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  console.log('Seeding database...');
  
  // Clean up
  await db.delete(schema.users);
  
  // Insert demo user
  const [user] = await db.insert(schema.users).values({
    name: 'Demo User',
    email: 'demo@example.com',
    passwordHash: 'fake_hash',
  }).returning();

  console.log('User created:', user.id);

  // Insert settings
  await db.insert(schema.userSettings).values({
    userId: user.id,
    periodStartDay: 15,
    periodEndDay: 14,
    maxExpensesPercentage: 80,
    minInvestmentPercentage: 20,
    expenseCategories: ['Housing', 'Food', 'Transport'],
    investmentTypes: ['Stocks', 'Bonds'],
  });

  console.log('Settings created');

  // Create a period
  const [period] = await db.insert(schema.financialPeriods).values({
    userId: user.id,
    startDate: new Date('2026-09-15T00:00:00Z'),
    endDate: new Date('2026-10-14T23:59:59Z'),
    status: 'open',
  }).returning();

  console.log('Period created:', period.id);

  console.log('Database seeded successfully');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
