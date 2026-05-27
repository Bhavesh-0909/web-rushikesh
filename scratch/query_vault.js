const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.qziibuebpvlwouanrltj:N6XpXPaCtuJtNTri@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
  });

  try {
    await client.connect();
    console.log("Connected!");

    // Check tables in vault schema
    const vaultTables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'vault';
    `);
    console.log("Vault Tables:", vaultTables.rows.map(r => r.table_name));

    // Try reading decrypted_secrets or secrets
    try {
      const secrets = await client.query(`
        SELECT * FROM vault.decrypted_secrets;
      `);
      console.log("Decrypted Secrets:", secrets.rows);
    } catch (e) {
      console.log("Error querying vault.decrypted_secrets:", e.message);
    }

  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

main();
