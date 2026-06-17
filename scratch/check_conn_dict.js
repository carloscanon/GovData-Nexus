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
    const res = await pool.query(`SELECT key_name, check_condition FROM simulator_steps WHERE key_name IN ('data_connections', 'semantic_dictionary')`);
    console.log(JSON.stringify(res.rows, null, 2));
    
    // Check table columns to see if they match the conditions
    const connCols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'data_connections'`);
    console.log("data_connections columns:", connCols.rows.map(r => r.column_name));
    
    const semCols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'semantic_dictionary'`);
    console.log("semantic_dictionary columns:", semCols.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
