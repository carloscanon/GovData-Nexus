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
    await pool.query(`
      UPDATE quality_rules qr
      SET tenant_id = da.tenant_id::uuid
      FROM data_assets da
      WHERE qr.asset_id = da.id AND qr.tenant_id IS NULL;
    `);
    
    await pool.query(`
      UPDATE quality_rules qr
      SET tenant_id = da.tenant_id::uuid
      FROM asset_fields af
      JOIN data_assets da ON af.asset_id = da.id
      WHERE qr.field_id = af.id AND qr.tenant_id IS NULL;
    `);
    
    const res = await pool.query(`SELECT id FROM quality_rules WHERE tenant_id IS NULL`);
    console.log("Still null:", res.rowCount);
    
    if (res.rowCount > 0 && res.rowCount <= 20) {
       const tenantRes = await pool.query(`SELECT id FROM tenants LIMIT 1`);
       if (tenantRes.rowCount > 0) {
         await pool.query(`UPDATE quality_rules SET tenant_id = $1::uuid WHERE tenant_id IS NULL`, [tenantRes.rows[0].id]);
         console.log("Assigned remaining to fallback tenant");
       }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
