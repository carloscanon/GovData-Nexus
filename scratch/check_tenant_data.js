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
    // Check which tenant the user is actually using (by most active data)
    const res = await pool.query(`
      SELECT t.id, t.name,
        (SELECT COUNT(*) FROM data_connections WHERE tenant_id = t.id) as connections,
        (SELECT COUNT(*) FROM data_assets WHERE tenant_id::uuid = t.id) as assets,
        (SELECT COUNT(*) FROM quality_rules WHERE tenant_id = t.id) as rules
      FROM tenants t
      ORDER BY connections DESC
      LIMIT 10
    `);
    console.log("Tenants summary:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
