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
    const resCount = await pool.query('SELECT count(*) FROM public.saas_connections');
    console.log(`Total connections seeded: ${resCount.rows[0].count}`);
    
    const resSample = await pool.query('SELECT user_name, user_email, user_role, status FROM public.saas_connections LIMIT 5');
    console.log('Sample connections:');
    console.log(resSample.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
