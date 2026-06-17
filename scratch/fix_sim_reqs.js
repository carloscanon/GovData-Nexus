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
    // Check data_connections
    const res = await pool.query(`SELECT id, name, source_id, tenant_id FROM data_connections LIMIT 10`);
    console.log("data_connections records:", res.rows);
    
    // Check how many have null tenant_id
    const nulls = await pool.query(`SELECT count(*) FROM data_connections WHERE tenant_id IS NULL`);
    console.log("data_connections with null tenant_id:", nulls.rows[0].count);
    
    // Delete dictionary steps
    await pool.query(`DELETE FROM simulator_steps WHERE key_name IN ('semantic_dictionary', 'glossary_terms')`);
    console.log("Deleted dictionary steps from simulator_steps");
    
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
