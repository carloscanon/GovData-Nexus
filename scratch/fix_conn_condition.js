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
    await pool.query(`
      UPDATE simulator_steps
      SET check_condition = '{"requires_fields": ["name", "source_id"]}'::jsonb
      WHERE key_name = 'data_connections';
    `);
    console.log("Updated data_connections check_condition.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
