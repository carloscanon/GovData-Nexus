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
    console.log('1. Altering team_members.avatar column to TEXT...');
    await pool.query('ALTER TABLE public.team_members ALTER COLUMN avatar TYPE TEXT');
    console.log('Column altered.');

    console.log('2. Enabling RLS on committees tables...');
    await pool.query('ALTER TABLE public.gov_committees ENABLE ROW LEVEL SECURITY');
    await pool.query('ALTER TABLE public.gov_committee_documents ENABLE ROW LEVEL SECURITY');
    console.log('RLS enabled.');

    console.log('3. Dropping old restrictive policies...');
    await pool.query('DROP POLICY IF EXISTS "tenant_isolation" ON public.gov_committees');
    await pool.query('DROP POLICY IF EXISTS "tenant_isolation_docs" ON public.gov_committee_documents');
    console.log('Restrictive policies dropped.');

    console.log('4. Creating open policies for gov_committees...');
    await pool.query('DROP POLICY IF EXISTS "Permitir todo a todos en gov_committees" ON public.gov_committees');
    await pool.query('CREATE POLICY "Permitir todo a todos en gov_committees" ON public.gov_committees FOR ALL TO public USING (true) WITH CHECK (true)');
    console.log('gov_committees policy created.');

    console.log('5. Creating open policies for gov_committee_documents...');
    await pool.query('DROP POLICY IF EXISTS "Permitir todo a todos en gov_committee_documents" ON public.gov_committee_documents');
    await pool.query('CREATE POLICY "Permitir todo a todos en gov_committee_documents" ON public.gov_committee_documents FOR ALL TO public USING (true) WITH CHECK (true)');
    console.log('gov_committee_documents policy created.');

    console.log('Database updates completed successfully!');
  } catch (err) {
    console.error('Error during database update:', err);
  } finally {
    await pool.end();
  }
}

run();
