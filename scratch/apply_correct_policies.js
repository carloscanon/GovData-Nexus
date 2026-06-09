const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  user: 'postgres.vojsoqmhqorysapimutp',
  password: 'Consultores2026*',
  port: 5432, // port 5432 or 6543
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- 1. Crear el bucket (si no existe)
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

-- Habilitar RLS en storage.objects si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Permitir SELECT (descarga)
DROP POLICY IF EXISTS "governance_docs_select" ON storage.objects;
CREATE POLICY "governance_docs_select"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'governance-docs'
);

-- 3. Policy: Permitir INSERT (subida)
DROP POLICY IF EXISTS "governance_docs_insert" ON storage.objects;
CREATE POLICY "governance_docs_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'governance-docs'
);

-- 4. Policy: Permitir DELETE
DROP POLICY IF EXISTS "governance_docs_delete" ON storage.objects;
CREATE POLICY "governance_docs_delete"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'governance-docs'
);
`;

async function main() {
  try {
    console.log('Connecting to database...');
    // Drop / create bucket and RLS policies
    await pool.query(sql);
    console.log('SUCCESS: governance-docs bucket and policies created successfully!');
    
    // Let's verify by listing buckets
    const res = await pool.query('SELECT * FROM storage.buckets');
    console.log('Buckets list in database:', res.rows.map(r => r.name));
  } catch (err) {
    console.error('Error applying policies:', err.message);
  } finally {
    pool.end();
  }
}

main();
