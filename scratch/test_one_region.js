const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  user: 'postgres.vojsoqmhqorysapimutp',
  password: 'Consultores2026*',
  port: 6543,
  database: 'postgres',
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false }
});

console.log('Connecting to us-east-1...');
pool.query('SELECT 1')
  .then(res => console.log('SUCCESS:', res.rows))
  .catch(err => console.error('FAILED ERROR CODE/MSG:', err.code, err.message))
  .finally(() => pool.end());
