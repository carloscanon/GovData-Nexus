const { Pool } = require('pg');
const pool = new Pool({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  user: 'postgres.dthsvjhffydkzxvhthpj',
  password: 'Consultores2026*',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT COUNT(*) as cnt FROM public."ventas"')
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => pool.end());
