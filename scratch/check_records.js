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
    const res1 = await pool.query(`SELECT COUNT(*) FROM semantic_dictionary WHERE tenant_id = 'e76b6b77-db8f-4f24-9b81-a67b44558e0a'`); // or whatever the tenant id is
    
    const res = await pool.query(`SELECT tenant_id, COUNT(*) FROM semantic_dictionary GROUP BY tenant_id`);
    console.log("semantic_dictionary counts per tenant:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
