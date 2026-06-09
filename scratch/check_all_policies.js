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
    const tableInfo = await pool.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    console.log('Tables and RLS status in public schema:');
    console.table(tableInfo.rows);

    const policies = await pool.query(`
      SELECT tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public'
    `);
    console.log('\nPolicies in public schema:');
    for (let policy of policies.rows) {
      console.log(`Table: ${policy.tablename} | Policy: ${policy.policyname}`);
      console.log(`- Cmd: ${policy.cmd} | Roles: ${policy.roles}`);
      console.log(`- Qual: ${policy.qual}`);
      console.log(`- With Check: ${policy.with_check}`);
      console.log('-----------------------------');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
