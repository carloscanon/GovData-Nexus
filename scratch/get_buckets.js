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
    const buckets = await pool.query('SELECT * FROM storage.buckets');
    console.log('Buckets:', buckets.rows);

    const policies = await pool.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'storage'
    `);
    console.log('Policies on storage:', policies.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
