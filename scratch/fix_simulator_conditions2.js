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
      SET check_condition = '{"requires_fields": ["field_name", "data_type", "is_sensitive"]}'::jsonb
      WHERE key_name = 'asset_fields';
    `);
    console.log("Updated asset_fields check_conditions successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
