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
      SET check_condition = '{"requires_fields": ["name", "type"]}'::jsonb
      WHERE key_name = 'quality_rules';

      UPDATE simulator_steps
      SET check_condition = '{"requires_fields": ["status", "priority"]}'::jsonb
      WHERE key_name = 'quality_incidents';

      UPDATE simulator_steps
      SET check_condition = '{"requires_fields": ["status", "priority"]}'::jsonb
      WHERE key_name = 'quality_incidents_op';

      UPDATE simulator_steps
      SET check_condition = '{"requires_fields": ["type", "severity"]}'::jsonb
      WHERE key_name = 'security_incidents_op';
    `);
    console.log("Updated check_conditions successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
