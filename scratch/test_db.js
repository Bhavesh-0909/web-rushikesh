const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.qziibuebpvlwouanrltj:N6XpXPaCtuJtNTri@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
  });

  try {
    await client.connect();
    console.log("Connected to the database!");
    
    // Query schemas
    const res = await client.query(`
      SELECT schema_name FROM information_schema.schemata;
    `);
    console.log("Schemas:", res.rows.map(r => r.schema_name));

    // Query tables in public schema
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("Public Tables:", tables.rows.map(r => r.table_name));

    // Query tables in auth schema
    const authTables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'auth';
    `);
    console.log("Auth Tables:", authTables.rows.map(r => r.table_name));

  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

main();
