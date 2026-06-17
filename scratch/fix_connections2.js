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
    // Check column types
    const typeRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'data_assets' AND column_name IN ('connection_id', 'tenant_id')
    `);
    console.log("data_assets types:", typeRes.rows);

    const typeRes2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'data_connections' AND column_name IN ('id', 'tenant_id')
    `);
    console.log("data_connections types:", typeRes2.rows);

    // Try to infer from data_assets using explicit cast
    const updated = await pool.query(`
      UPDATE data_connections dc
      SET tenant_id = da.tenant_id
      FROM data_assets da
      WHERE da.connection_id::text = dc.id::text AND dc.tenant_id IS NULL
      RETURNING dc.id
    `);
    console.log("Updated via data_assets.connection_id:", updated.rowCount);

    // Check remaining nulls  
    const remaining = await pool.query(`SELECT id, name FROM data_connections WHERE tenant_id IS NULL`);
    console.log("Still null after fix:", remaining.rowCount);
    
    // Find which tenant has the most connections (non-null) to use as reference
    const topTenant = await pool.query(`
      SELECT tenant_id, COUNT(*) as cnt 
      FROM data_connections 
      WHERE tenant_id IS NOT NULL 
      GROUP BY tenant_id 
      ORDER BY cnt DESC 
      LIMIT 1
    `);
    console.log("Top tenant for connections:", topTenant.rows);

    // Assign remaining null connections to that tenant
    if (remaining.rowCount > 0 && topTenant.rowCount > 0) {
      const fallbackTenantId = topTenant.rows[0].tenant_id;
      const assignRes = await pool.query(`
        UPDATE data_connections SET tenant_id = $1 WHERE tenant_id IS NULL RETURNING id
      `, [fallbackTenantId]);
      console.log("Assigned to tenant:", fallbackTenantId, "count:", assignRes.rowCount);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
