const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  user: 'postgres.vojsoqmhqorysapimutp',
  password: 'Consultores2026*',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("Reading sql/seed_real_audit_logs.sql...");
    const sql = fs.readFileSync('sql/seed_real_audit_logs.sql', 'utf8');
    console.log("Running seed sql...");
    await pool.query(sql);
    console.log("Seeding real audit logs executed successfully!");
  } catch (err) {
    console.error("Seeding execution failed:", err);
  } finally {
    await pool.end();
  }
}

run();
