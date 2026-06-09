const { Pool } = require('pg');

const prefixes = ['aws-0', 'aws-1'];
const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'sa-east-1'
];

async function findRegion() {
  for (const prefix of prefixes) {
    for (const region of regions) {
      const host = `${prefix}-${region}.pooler.supabase.com`;
      console.log(`Checking: ${host}...`);
      
      const pool = new Pool({
        host,
        user: 'postgres.vojsoqmhqorysapimutp',
        password: 'Consultores2026*',
        port: 6543,
        database: 'postgres',
        connectionTimeoutMillis: 3000,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await pool.query('SELECT 1');
        console.log(`>>> SUCCESS CONNECTED: ${host}`);
        pool.end();
        return;
      } catch (err) {
        if (err.message.includes('password authentication failed')) {
          console.log(`>>> FOUND REGION (Incorrect Password): ${host}`);
          pool.end();
          return;
        } else if (err.message.includes('Tenant or user not found')) {
          // Not this one
        } else {
          console.log(`  Error on ${host}:`, err.message);
        }
      }
      pool.end();
    }
  }
  console.log('Finished search.');
}

findRegion();
