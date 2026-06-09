const { Pool } = require('pg');
const pool = new Pool({
  host: 'aws-1-us-west-2.pooler.supabase.com',
  user: 'postgres.dthsvjhffydkzxvhthpj',
  password: 'Consultores2026*',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
`)
  .then(r => console.log(r.rows.map(row => row.table_name)))
  .catch(console.error)
  .finally(() => pool.end());
