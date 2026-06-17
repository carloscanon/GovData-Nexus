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
    const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'glossary_terms'`);
    console.log("glossary_terms columns:", res.rows.map(r => r.column_name));
    
    const res2 = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'semantic_dictionary'`);
    console.log("semantic_dictionary columns:", res2.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
