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
    // Show all current steps with module
    const steps = await pool.query(`
      SELECT s.module_id, m.title as module_title, s.key_name, s.check_table, s.check_condition, s.min_count
      FROM simulator_steps s
      JOIN simulator_modules m ON m.id = s.module_id
      ORDER BY m.order_index, s.key_name
    `);
    console.log("Current steps:");
    steps.rows.forEach(r => console.log(` [${r.module_title}] ${r.key_name} -> ${r.check_table} min:${r.min_count}`));

    // Check if glossary_terms step exists
    const glossary = await pool.query(`SELECT key_name FROM simulator_steps WHERE key_name = 'glossary_terms'`);
    console.log("\nGlossary step exists:", glossary.rowCount > 0);

    // Check lineage-related steps
    const lineage = await pool.query(`SELECT key_name FROM simulator_steps WHERE key_name ILIKE '%lineage%' OR key_name ILIKE '%linaje%'`);
    console.log("Lineage steps:", lineage.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
