const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  user: 'postgres.vojsoqmhqorysapimutp',
  password: 'Consultores2026*',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync('workflow_extensions.sql', 'utf8');

async function run() {
  try {
    // 1. Create tables
    await pool.query(sql);
    console.log('✅ Tables created successfully!');

    // 2. Reload PostgREST cache
    await pool.query("NOTIFY pgrst, 'reload schema';");
    console.log('✅ PostgREST schema cache reloaded successfully!');
  } catch (err) {
    console.error('❌ Error executing database commands:', err);
  } finally {
    await pool.end();
  }
}

run();
