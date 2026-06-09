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
    const res = await pool.query("SELECT * FROM public.tenants LIMIT 5;");
    console.log("Tenants in public.tenants:", res.rows);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await pool.end();
  }
}

run();
