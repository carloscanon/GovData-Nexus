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
    console.log("Running migration...");
    await pool.query(`
      ALTER TABLE public.gov_committees ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE public.gov_committees ADD COLUMN IF NOT EXISTS secretary TEXT;
    `);
    console.log("Migration executed successfully!");
    const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'gov_committees'`);
    console.log(res.rows);
  } catch (err) {
    console.error("Execution failed:", err);
  } finally {
    await pool.end();
  }
}

run();

