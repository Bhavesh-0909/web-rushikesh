const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.qziibuebpvlwouanrltj:N6XpXPaCtuJtNTri@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
  });

  try {
    await client.connect();
    console.log("Connected!");

    try {
      const res = await client.query("SELECT * FROM vault.secrets;");
      console.log("Secrets:", res.rows);
    } catch (e) {
      console.log("Error querying vault.secrets:", e.message);
    }

  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

main();
