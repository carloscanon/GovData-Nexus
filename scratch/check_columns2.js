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
    const res3 = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'quality_monitoring_history'`);
    console.log("quality_monitoring_history columns:", res3.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
