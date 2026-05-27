const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.qziibuebpvlwouanrltj:N6XpXPaCtuJtNTri@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
  });

  try {
    await client.connect();
    console.log("Connected!");

    const tables = ['employees'];
    for (const table of tables) {
      const res = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1;
      `, [table]);
      console.log(`Columns for ${table}:`, res.rows);
    }
  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

main();
