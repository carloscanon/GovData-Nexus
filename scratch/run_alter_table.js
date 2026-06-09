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
    console.log('Adding columns to gov_committee_documents...');
    await pool.query('ALTER TABLE public.gov_committee_documents ADD COLUMN IF NOT EXISTS topic TEXT');
    await pool.query('ALTER TABLE public.gov_committee_documents ADD COLUMN IF NOT EXISTS meeting_date TIMESTAMPTZ DEFAULT now()');
    console.log('Columns added successfully.');
  } catch (err) {
    console.error('Error during database update:', err);
  } finally {
    await pool.end();
  }
}

run();
