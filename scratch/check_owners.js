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
  SELECT tablename, tableowner 
  FROM pg_tables 
  WHERE schemaname = 'storage'
`)
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => pool.end());
