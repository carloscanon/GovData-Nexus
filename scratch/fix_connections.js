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
    // Fix: For null-tenant connections, try to find a matching data_asset by source/connection_id
    const connsNull = await pool.query(`SELECT id, name FROM data_connections WHERE tenant_id IS NULL`);
    console.log("Null tenant connections:", connsNull.rowCount);

    // Try to infer from data_assets.connection_id 
    const updated = await pool.query(`
      UPDATE data_connections dc
      SET tenant_id = da.tenant_id::uuid
      FROM data_assets da
      WHERE da.connection_id = dc.id AND dc.tenant_id IS NULL
      RETURNING dc.id
    `);
    console.log("Updated via data_assets.connection_id:", updated.rowCount);

    // Check remaining nulls
    const remaining = await pool.query(`SELECT id, name FROM data_connections WHERE tenant_id IS NULL`);
    console.log("Still null after data_assets join:", remaining.rowCount);
    
    if (remaining.rowCount > 0) {
      // Last resort: check what tenants exist with the most data and assign 
      const tenants = await pool.query(`
        SELECT t.id, t.name, COUNT(da.id) as asset_count
        FROM tenants t
        LEFT JOIN data_assets da ON da.tenant_id = t.id
        GROUP BY t.id, t.name
        ORDER BY asset_count DESC
        LIMIT 5
      `);
      console.log("Top tenants by asset count:", tenants.rows);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
