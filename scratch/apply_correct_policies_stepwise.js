const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  user: 'postgres.vojsoqmhqorysapimutp',
  password: 'Consultores2026*',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const steps = [
  {
    name: 'Create governance-docs bucket',
    sql: `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'governance-docs',
        'governance-docs',
        false,
        52428800,  -- 50 MB
        ARRAY[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/png',
          'image/jpeg',
          'text/plain'
        ]
      )
      ON CONFLICT (id) DO NOTHING;
    `
  },
  {
    name: 'Drop old select policy',
    sql: 'DROP POLICY IF EXISTS "governance_docs_select" ON storage.objects;'
  },
  {
    name: 'Create select policy',
    sql: 'CREATE POLICY "governance_docs_select" ON storage.objects FOR SELECT TO public USING (bucket_id = \'governance-docs\');'
  },
  {
    name: 'Drop old insert policy',
    sql: 'DROP POLICY IF EXISTS "governance_docs_insert" ON storage.objects;'
  },
  {
    name: 'Create insert policy',
    sql: 'CREATE POLICY "governance_docs_insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = \'governance-docs\');'
  },
  {
    name: 'Drop old delete policy',
    sql: 'DROP POLICY IF EXISTS "governance_docs_delete" ON storage.objects;'
  },
  {
    name: 'Create delete policy',
    sql: 'CREATE POLICY "governance_docs_delete" ON storage.objects FOR DELETE TO public USING (bucket_id = \'governance-docs\');'
  }
];

async function main() {
  for (const step of steps) {
    console.log(`Running step: ${step.name}...`);
    try {
      await pool.query(step.sql);
      console.log(`  -> SUCCESS!`);
    } catch (err) {
      console.log(`  -> FAILED: ${err.message}`);
    }
  }
  
  try {
    const res = await pool.query('SELECT * FROM storage.buckets');
    console.log('Final buckets list:', res.rows.map(r => r.name));
  } catch (err) {
    console.log('Failed to list buckets:', err.message);
  }
  
  pool.end();
}

main();
