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
  SELECT id, name, email, avatar 
  FROM tenant_users 
  LIMIT 10
`)
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => pool.end());
