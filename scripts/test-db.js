import postgres from 'postgres';

async function testConnection(url) {
  try {
    const sql = postgres(url, { max: 1 });
    await sql`SELECT 1`;
    console.log(`Success: ${url}`);
    await sql.end();
  } catch (err) {
    console.log(`Failed: ${url} - ${err.message}`);
  }
}

async function main() {
  await testConnection('postgresql://postgres@localhost:5432/postgres');
  await testConnection('postgresql://postgres:postgres@localhost:5432/postgres');
  await testConnection('postgresql://postgres:password@localhost:5432/postgres');
  await testConnection('postgresql://postgres:admin@localhost:5432/postgres');
  await testConnection('postgresql://postgres:root@localhost:5432/postgres');
}

main();
