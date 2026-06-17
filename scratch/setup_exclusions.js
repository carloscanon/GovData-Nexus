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
    // 1. Add check_excluded_values column to simulator_steps
    await pool.query(`
      ALTER TABLE simulator_steps 
      ADD COLUMN IF NOT EXISTS check_excluded_values JSONB DEFAULT NULL
    `);
    console.log("Added check_excluded_values column.");

    // 2. Set bootstrap exclusion values per step
    // data_policies: exclude bootstrap frameworks
    await pool.query(`
      UPDATE simulator_steps SET check_excluded_values = $1::jsonb WHERE key_name = 'policies'
    `, [JSON.stringify({ field: 'framework_origin', values: ['DAMA','DCAM','HEALTH','PUBLIC','GDPR','STANDARD'] })]);

    // policy_workflows: exclude bootstrap workflow names
    await pool.query(`
      UPDATE simulator_steps SET check_excluded_values = $1::jsonb WHERE key_name = 'policy_workflows'
    `, [JSON.stringify({ field: 'name', values: ['FLUJO DOCUMENTAL NORMATIVO','ESTÁNDAR','CRÍTICO / LEGAL','ESTANDAR','CRITICO / LEGAL'] })]);

    // policy_standards: exclude by code prefix
    await pool.query(`
      UPDATE simulator_steps SET check_excluded_values = $1::jsonb WHERE key_name = 'policy_standards'
    `, [JSON.stringify({ field: 'code', prefixes: ['STD-DAMA','STD-DCAM','STD-HIPAA','STD-GOV','STD-GDPR','STD-001','STD-002'] })]);

    // policy_procedures: exclude by code prefix
    await pool.query(`
      UPDATE simulator_steps SET check_excluded_values = $1::jsonb WHERE key_name = 'policy_procedures'
    `, [JSON.stringify({ field: 'code', prefixes: ['PR-DAMA','PR-DCAM','PR-HIPAA','PR-GOV','PR-GDPR','PR-01','PR-02','PRC-01'] })]);

    // policy_controls: exclude by code prefix
    await pool.query(`
      UPDATE simulator_steps SET check_excluded_values = $1::jsonb WHERE key_name = 'policy_controls'
    `, [JSON.stringify({ field: 'code', prefixes: ['CTRL-DAMA','CTRL-DCAM','CTRL-HIPAA','CTRL-GOV','CTRL-GDPR','CTRL-01','CTRL-02'] })]);

    // maturity_assessments: exclude bootstrap (no timestamp/comite_gobierno in answers)
    await pool.query(`
      UPDATE simulator_steps SET check_excluded_values = $1::jsonb WHERE key_name = 'dama'
    `, [JSON.stringify({ check_answers_timestamp: true })]);

    // team_raci_matrix: exclude default RACI rows
    await pool.query(`
      UPDATE simulator_steps SET check_excluded_values = $1::jsonb WHERE key_name = 'raci'
    `, [JSON.stringify({ default_raci: [
      { process: 'Definición de Glosario', owner_role: 'A', steward_role: 'R', custodian_role: 'C', analyst_role: 'C' },
      { process: 'Validación de Calidad', owner_role: 'A', steward_role: 'R', custodian_role: 'I', analyst_role: 'C' },
      { process: 'Aprobación de Acceso', owner_role: 'A', steward_role: 'C', custodian_role: 'R', analyst_role: 'I' },
      { process: 'Modelado de Datos', owner_role: 'C', steward_role: 'C', custodian_role: 'R', analyst_role: 'A' },
      { process: 'Gestión de Incidentes', owner_role: 'I', steward_role: 'R', custodian_role: 'A', analyst_role: 'C' }
    ]})]);

    // team_domains: exclude bootstrap domain names
    await pool.query(`
      UPDATE simulator_steps SET check_excluded_values = $1::jsonb WHERE key_name = 'domains'
    `, [JSON.stringify({ field: 'name', values: ['CLIENTES & CRM','FINANZAS','TALENTO HUMANO','PROVEEDORES'] })]);

    console.log("Set all bootstrap exclusion values in DB.");

    // Verify
    const res = await pool.query(`SELECT key_name, check_excluded_values FROM simulator_steps WHERE check_excluded_values IS NOT NULL`);
    console.log("\nSteps with exclusions configured:");
    res.rows.forEach(r => console.log(` - ${r.key_name}: ${JSON.stringify(r.check_excluded_values).substring(0, 80)}...`));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
