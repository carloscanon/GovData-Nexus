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
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'gov_%'
    `);
    console.log('Tables in public matching gov_%:', tables.rows);

    for (let table of tables.rows) {
      const name = table.table_name;
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${name}'
      `);
      console.log(`Columns of ${name}:`, columns.rows);

      const rls = await pool.query(`
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = '${name}'
      `);
      console.log(`RLS status of ${name}:`, rls.rows);

      const policies = await pool.query(`
        SELECT policyname, roles, cmd, qual, with_check 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = '${name}'
      `);
      console.log(`Policies of ${name}:`, policies.rows);
      console.log('-----------------------------');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
