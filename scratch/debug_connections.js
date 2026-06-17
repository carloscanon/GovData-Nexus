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
    const colmotores = '60a45549-b6e2-4399-9357-9f09572c248c';

    // 1. Check RLS on data_connections
    const rls = await pool.query(`
      SELECT schemaname, tablename, policyname, cmd, qual 
      FROM pg_policies 
      WHERE tablename = 'data_connections'
    `);
    console.log("RLS policies on data_connections:", rls.rows);

    // 2. Check RLS enabled/disabled
    const rlsEnabled = await pool.query(`
      SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'data_connections'
    `);
    console.log("RLS enabled:", rlsEnabled.rows);

    // 3. Verify actual connections for Colmotores
    const conns = await pool.query(`
      SELECT id, name, source_id, tenant_id FROM data_connections WHERE tenant_id = $1::uuid
    `, [colmotores]);
    console.log("\nColmotores connections count:", conns.rowCount);
    conns.rows.forEach(r => console.log(` - "${r.name}" source:"${r.source_id}"`));

    // 4. Check simulator session_3 module description
    const mod = await pool.query(`SELECT id, title, description FROM simulator_modules WHERE id = 'session_3'`);
    console.log("\nSession 3 module:", mod.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
