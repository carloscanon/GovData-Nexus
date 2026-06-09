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
    console.log('1. Ensuring governance-docs bucket exists...');
    await pool.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'governance-docs',
        'governance-docs',
        false,
        52428800,
        ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'text/plain']
      )
      ON CONFLICT (id) DO UPDATE
      SET file_size_limit = EXCLUDED.file_size_limit,
          allowed_mime_types = EXCLUDED.allowed_mime_types;
    `);
    console.log('governance-docs bucket configured.');

    console.log('2. Ensuring policy-documents bucket exists...');
    await pool.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'policy-documents',
        'policy-documents',
        false,
        52428800,
        ARRAY[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/png',
          'image/jpeg',
          'text/plain',
          'text/csv'
        ]
      )
      ON CONFLICT (id) DO UPDATE
      SET file_size_limit = EXCLUDED.file_size_limit,
          allowed_mime_types = EXCLUDED.allowed_mime_types;
    `);
    console.log('policy-documents bucket configured.');

    console.log('3. Configuring SELECT policy on storage.buckets...');
    // Drop existing first to avoid duplicate name errors if any
    await pool.query('DROP POLICY IF EXISTS "Allow public select on buckets" ON storage.buckets');
    await pool.query('CREATE POLICY "Allow public select on buckets" ON storage.buckets FOR SELECT TO public USING (true)');
    console.log('storage.buckets policy configured.');

    console.log('4. Configuring storage.objects policies for governance-docs...');
    await pool.query('DROP POLICY IF EXISTS "governance_docs_select" ON storage.objects');
    await pool.query('DROP POLICY IF EXISTS "governance_docs_insert" ON storage.objects');
    await pool.query('DROP POLICY IF EXISTS "governance_docs_delete" ON storage.objects');
    await pool.query('DROP POLICY IF EXISTS "Tenant users can read governance docs" ON storage.objects');
    await pool.query('DROP POLICY IF EXISTS "Tenant users can upload governance docs" ON storage.objects');
    await pool.query('DROP POLICY IF EXISTS "Tenant users can delete governance docs" ON storage.objects');

    await pool.query(`
      CREATE POLICY "governance_docs_select" ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'governance-docs')
    `);
    await pool.query(`
      CREATE POLICY "governance_docs_insert" ON storage.objects FOR INSERT TO public
      WITH CHECK (bucket_id = 'governance-docs')
    `);
    await pool.query(`
      CREATE POLICY "governance_docs_delete" ON storage.objects FOR DELETE TO public
      USING (bucket_id = 'governance-docs')
    `);
    console.log('governance-docs objects policies configured.');

    console.log('5. Configuring storage.objects policies for policy-documents...');
    await pool.query('DROP POLICY IF EXISTS "Tenant users can read policy documents" ON storage.objects');
    await pool.query('DROP POLICY IF EXISTS "Tenant users can upload policy documents" ON storage.objects');
    await pool.query('DROP POLICY IF EXISTS "Tenant users can delete own policy documents" ON storage.objects');

    await pool.query(`
      CREATE POLICY "policy_documents_select" ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'policy-documents')
    `);
    await pool.query(`
      CREATE POLICY "policy_documents_insert" ON storage.objects FOR INSERT TO public
      WITH CHECK (bucket_id = 'policy-documents')
    `);
    await pool.query(`
      CREATE POLICY "policy_documents_delete" ON storage.objects FOR DELETE TO public
      USING (bucket_id = 'policy-documents')
    `);
    console.log('policy-documents objects policies configured.');

    console.log('All storage configuration completed successfully!');
  } catch (err) {
    console.error('Error during database setup:', err);
  } finally {
    await pool.end();
  }
}

run();
