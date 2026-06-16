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
    console.log("Reading SQL file...");
    const sql = fs.readFileSync('supabase_modal_config.sql', 'utf8');
    console.log("Executing migration on Supabase PostgreSQL...");
    const res = await pool.query(sql);
    console.log("Migration executed successfully!", res);
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

run();
