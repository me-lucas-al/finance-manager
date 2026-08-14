import postgres from 'postgres';

async function testConnection(url) {
  try {
    const sql = postgres(url, { max: 1 });
    await sql`SELECT 1`;
    console.log(`Success: ${url}`);
    await sql.end();
  } catch (err) {
    // console.log(`Failed: ${url} - ${err.message}`);
  }
}

async function main() {
  const passwords = ['1234', '123456', 'docker', 'test', 'postgres123'];
  for (const p of passwords) {
    await testConnection(`postgresql://postgres:${p}@localhost:5432/postgres`);
  }
}

main();
