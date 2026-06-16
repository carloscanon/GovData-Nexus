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
    console.log("Reading sql/saas_audit_system.sql...");
    const sql = fs.readFileSync('sql/saas_audit_system.sql', 'utf8');
    console.log("Running central audit system migration...");
    await pool.query(sql);
    console.log("Central audit migration executed successfully!");
  } catch (err) {
    console.error("Migration execution failed:", err);
  } finally {
    await pool.end();
  }
}

run();
