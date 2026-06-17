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
    // data_assets.tenant_id is text, data_connections.tenant_id is uuid → cast text to uuid
    const updated = await pool.query(`
      UPDATE data_connections dc
      SET tenant_id = da.tenant_id::uuid
      FROM data_assets da
      WHERE da.connection_id::text = dc.id::text AND dc.tenant_id IS NULL
      RETURNING dc.id
    `);
    console.log("Updated via data_assets:", updated.rowCount);

    const remaining = await pool.query(`SELECT COUNT(*) FROM data_connections WHERE tenant_id IS NULL`);
    console.log("Still null:", remaining.rows[0].count);

    // Find the tenant with the most non-null connections to assign remainders
    const topTenant = await pool.query(`
      SELECT tenant_id::text, COUNT(*) as cnt 
      FROM data_connections 
      WHERE tenant_id IS NOT NULL 
      GROUP BY tenant_id 
      ORDER BY cnt DESC 
      LIMIT 1
    `);
    console.log("Top tenant:", topTenant.rows);

    if (parseInt(remaining.rows[0].count) > 0 && topTenant.rowCount > 0) {
      const fallback = topTenant.rows[0].tenant_id;
      const assignRes = await pool.query(`
        UPDATE data_connections SET tenant_id = $1::uuid WHERE tenant_id IS NULL RETURNING id
      `, [fallback]);
      console.log("Assigned remaining to tenant:", fallback, "count:", assignRes.rowCount);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
