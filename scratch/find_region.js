const { Pool } = require('pg');

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-north-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'sa-east-1'
];

async function findRegion() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Checking region: ${region} (${host})...`);
    
    // We try port 6543 which is the pooler port
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
      console.log(`>>> FOUND REGION & CONNECTED: ${region}`);
      pool.end();
      return;
    } catch (err) {
      if (err.message.includes('password authentication failed')) {
        console.log(`>>> FOUND REGION (Incorrect Password): ${region}`);
        pool.end();
        return;
      } else if (err.message.includes('Tenant or user not found')) {
        // Not this region
      } else {
        console.log(`  Error on ${region}:`, err.message);
      }
    }
    pool.end();
  }
  console.log('Done checking regions.');
}

findRegion();
