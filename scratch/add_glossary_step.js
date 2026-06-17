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
    // Check if glossary_terms step already exists
    const exists = await pool.query(`SELECT id FROM simulator_steps WHERE key_name = 'glossary_terms'`);
    if (exists.rowCount === 0) {
      await pool.query(`
        INSERT INTO simulator_steps (module_id, key_name, title, description, check_table, check_condition, min_count)
        VALUES (
          'session_3',
          'glossary_terms',
          'Glosario de Datos',
          'Define al menos 3 términos de negocio con su definición y dominio en el Glosario de Datos.',
          'glossary_terms',
          '{"requires_fields": ["term", "definition", "domain"]}'::jsonb,
          3
        )
      `);
      console.log("Added glossary_terms step.");
    } else {
      console.log("Glossary step already exists.");
    }

    // Check glossary per tenant
    const glossaryCount = await pool.query(`SELECT tenant_id::text, COUNT(*) FROM glossary_terms GROUP BY tenant_id ORDER BY count DESC`);
    console.log("Glossary per tenant:", glossaryCount.rows);

    // Final step list
    const steps = await pool.query(`
      SELECT s.module_id, s.key_name, s.check_table, s.min_count
      FROM simulator_steps s
      ORDER BY s.module_id, s.key_name
    `);
    console.log("\nFinal steps:");
    steps.rows.forEach(r => console.log(` [${r.module_id}] ${r.key_name} -> ${r.check_table} min:${r.min_count}`));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
