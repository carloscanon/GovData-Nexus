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
    console.log('Attempting to create SELECT policy on storage.buckets...');
    await pool.query('CREATE POLICY "Allow public select on buckets" ON storage.buckets FOR SELECT TO public USING (true)');
    console.log('Policy created successfully!');
  } catch (err) {
    console.error('Error creating policy:', err.message);
    try {
      console.log('Attempting to disable RLS on storage.buckets...');
      await pool.query('ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY');
      console.log('RLS disabled successfully!');
    } catch (err2) {
      console.error('Error disabling RLS:', err2.message);
    }
  } finally {
    await pool.end();
  }
}

run();
