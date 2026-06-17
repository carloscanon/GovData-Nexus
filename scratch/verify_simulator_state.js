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
    // 1. Verify dictionary steps were deleted
    const dictSteps = await pool.query(`SELECT key_name FROM simulator_steps WHERE key_name IN ('semantic_dictionary', 'glossary_terms')`);
    console.log("Dictionary steps remaining:", dictSteps.rows);

    // 2. Check connections step config
    const connStep = await pool.query(`SELECT key_name, check_table, check_condition, min_count FROM simulator_steps WHERE key_name = 'data_connections'`);
    console.log("Connections step:", JSON.stringify(connStep.rows, null, 2));

    // 3. Verify Colmotores connections exist with tenant_id
    const colmotores = '60a45549-b6e2-4399-9357-9f09572c248c';
    const conns = await pool.query(`SELECT id, name, source_id, tenant_id FROM data_connections WHERE tenant_id = $1::uuid`, [colmotores]);
    console.log("Colmotores connections:", conns.rowCount);
    conns.rows.forEach(r => console.log(" -", r.name, "source:", r.source_id));

    // 4. Also verify the step check_condition uses fields that exist in the table
    // data_connections has: id, name, source_id, host, username, password_encrypted, connection_string, tenant_id
    // Step requires_fields: ["name", "source_id"] -> BOTH exist, should work!
    console.log("\nValidation simulation for Colmotores:");
    const validConns = conns.rows.filter(r => r.name && r.name.trim() !== '' && r.source_id && r.source_id.trim() !== '');
    console.log("Valid connections (have name + source_id):", validConns.length, "/ min_count:", connStep.rows[0]?.min_count);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
