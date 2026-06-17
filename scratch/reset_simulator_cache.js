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
    // 1. Delete all cached step progress for ALL tenants so simulator recalculates fresh
    const del1 = await pool.query(`DELETE FROM simulator_user_step_progress`);
    console.log("Cleared simulator_user_step_progress rows:", del1.rowCount);

    // 2. Delete all cached module completions (certificates) so they can re-earn badges
    const del2 = await pool.query(`DELETE FROM simulator_user_progress`);
    console.log("Cleared simulator_user_progress rows:", del2.rowCount);

    // 3. Verify current simulator_steps (no dict steps)
    const steps = await pool.query(`SELECT key_name, check_table, min_count FROM simulator_steps ORDER BY module_id, key_name`);
    console.log("\nCurrent simulator steps:");
    steps.rows.forEach(r => console.log(` - [${r.module_id || '?'}] ${r.key_name} -> ${r.check_table} (min: ${r.min_count})`));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
