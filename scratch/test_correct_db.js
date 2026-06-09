const { Pool } = require('pg');

const configs = [
  {
    name: 'Direct IPv6 Host (port 5432)',
    host: 'db.vojsoqmhqorysapimutp.supabase.co',
    user: 'postgres',
    password: 'Consultores2026*',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Pooler us-east-1 (port 5432)',
    host: 'aws-0-us-east-1.pooler.supabase.com',
    user: 'postgres.vojsoqmhqorysapimutp',
    password: 'Consultores2026*',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Pooler us-east-1 (port 6543)',
    host: 'aws-0-us-east-1.pooler.supabase.com',
    user: 'postgres.vojsoqmhqorysapimutp',
    password: 'Consultores2026*',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  }
];

async function testAll() {
  for (const config of configs) {
    console.log(`Testing: ${config.name}...`);
    const pool = new Pool(config);
    try {
      const res = await pool.query('SELECT current_database(), current_user');
      console.log(`  -> SUCCESS! Result:`, res.rows);
      pool.end();
      return; // Stop on first success
    } catch (err) {
      console.log(`  -> FAILED:`, err.message);
    }
    pool.end();
  }
}

testAll();
