const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  user: 'postgres.vojsoqmhqorysapimutp',
  password: 'Consultores2026*',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- Habilitar RLS en storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Crear policy SELECT para public en storage.buckets
DROP POLICY IF EXISTS "governance_buckets_select" ON storage.buckets;
CREATE POLICY "governance_buckets_select"
ON storage.buckets FOR SELECT
TO public
USING (true);
`;

async function main() {
  try {
    console.log('Connecting to database...');
    await pool.query(sql);
    console.log('SUCCESS: Policy on storage.buckets created successfully!');
  } catch (err) {
    console.error('Error applying policy:', err.message);
  } finally {
    pool.end();
  }
}

main();
