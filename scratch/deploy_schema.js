const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.qziibuebpvlwouanrltj:N6XpXPaCtuJtNTri@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
  });

  try {
    await client.connect();
    console.log("Connected to the database!");

    const sqlPath = path.join(__dirname, '../supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Deploying Supabase schema...");
    await client.query(sql);
    console.log("Supabase schema deployed successfully!");

  } catch (err) {
    console.error("Error deploying schema:", err.message);
  } finally {
    await client.end();
  }
}

main();
