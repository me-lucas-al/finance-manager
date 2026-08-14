import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../src/db/schema';

async function setup() {
  console.log('Setting up e2e database...');
  // Connect to default db to create the test db
  const sql = postgres('postgresql://postgres:postgres@localhost:5433/postgres');
  
  try {
    await sql`DROP DATABASE IF EXISTS finance_manager_test;`;
    await sql`CREATE DATABASE finance_manager_test;`;
    console.log('Created database finance_manager_test');
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await sql.end();
  }

  // Connect to the new test db to run migrations
  console.log('Running migrations...');
  const testSql = postgres('postgresql://postgres:postgres@localhost:5433/finance_manager_test', { max: 1 });
  const db = drizzle(testSql, { schema });
  
  try {
    await migrate(db, { migrationsFolder: 'src/db/migrations' });
    console.log('Migrations completed');
  } catch (err) {
    console.error('Error running migrations:', err);
  } finally {
    await testSql.end();
  }
}

setup().catch(console.error);
