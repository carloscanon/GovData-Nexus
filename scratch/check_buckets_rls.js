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
    const tableInfo = await pool.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'storage'
    `);
    console.log('Tables and RLS status:', tableInfo.rows);

    const policies = await pool.query(`
      SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'storage' AND tablename = 'buckets'
    `);
    console.log('Policies on storage.buckets:', policies.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
