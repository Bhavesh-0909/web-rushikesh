const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.qziibuebpvlwouanrltj:N6XpXPaCtuJtNTri@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
  });

  try {
    await client.connect();
    console.log("Connected!");

    const res = await client.query(`
      SELECT name, setting FROM pg_settings 
      WHERE name LIKE '%jwt%' OR name LIKE '%token%' OR name LIKE '%supabase%';
    `);
    console.log("Settings:", res.rows);
  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

main();
