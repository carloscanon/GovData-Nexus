const { Pool } = require('pg');
const pool = new Pool({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  user: 'postgres.vojsoqmhqorysapimutp',
  password: 'Consultores2026*',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query(`
  SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity 
  FROM pg_class c 
  JOIN pg_namespace n ON n.oid = c.relnamespace 
  WHERE n.nspname = 'storage' AND c.relname IN ('buckets', 'objects')
`)
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => pool.end());
