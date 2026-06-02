import { NextResponse } from 'next/server';
import { Pool as PgPool } from 'pg';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  try {
    const { database_type, host, user, key, connection_string, table_name, rules } = await req.json();

    if (!database_type || !table_name || !rules || !Array.isArray(rules)) {
      return NextResponse.json({ success: false, error: 'Parámetros inválidos' }, { status: 400 });
    }

    console.log(`[Quality Scan] Iniciando escaneo de tabla ${table_name} en ${database_type}`);

    let totalRecords = 0;
    const ruleResults: any[] = [];

    if (database_type === 'postgres') {
      const config = connection_string 
        ? { connectionString: connection_string }
        : { host, user, password: key, port: 5432, database: 'postgres' }; // defaults if no conn_string
        
      const pool = new PgPool({ ...config, ssl: { rejectUnauthorized: false } });
      
      try {
        // 1. Obtener total de registros
        const countResult = await pool.query(`SELECT COUNT(*) as cnt FROM public."${table_name}"`);
        totalRecords = parseInt(countResult.rows[0].cnt, 10);

        // 2. Evaluar cada regla
        for (const rule of rules) {
          let affected = 0;
          const fieldName = rule.fieldName;

          if (!fieldName) {
            ruleResults.push({ ruleId: rule.id, total: totalRecords, affected: 0, error: 'No field name provided' });
            continue;
          }

          if (rule.type === 'Nulos') {
            const nullResult = await pool.query(`SELECT COUNT(*) as cnt FROM public."${table_name}" WHERE "${fieldName}" IS NULL`);
            affected = parseInt(nullResult.rows[0].cnt, 10);
          } else if (rule.type === 'Duplicados') {
            // Count total non-nulls vs unique non-nulls
            const dupResult = await pool.query(`
              SELECT (COUNT("${fieldName}") - COUNT(DISTINCT "${fieldName}")) as cnt 
              FROM public."${table_name}"
              WHERE "${fieldName}" IS NOT NULL
            `);
            affected = parseInt(dupResult.rows[0].cnt, 10);
          } else if (rule.type === 'Formato') {
            // Postgres regex validation
            // Usamos patrón seguro extrayendo regex o asumiendo email si es vacío
            const pattern = rule.config?.regex || '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
            const formatResult = await pool.query(`
              SELECT COUNT(*) as cnt 
              FROM public."${table_name}" 
              WHERE "${fieldName}" IS NOT NULL AND "${fieldName}"::text !~ $1
            `, [pattern]);
            affected = parseInt(formatResult.rows[0].cnt, 10);
          }

          ruleResults.push({
            ruleId: rule.id,
            total: totalRecords,
            affected: affected,
            compliant: totalRecords - affected
          });
        }
      } finally {
        await pool.end();
      }

    } else if (database_type === 'mysql') {
      const connection = await mysql.createConnection({
        host: host || 'localhost',
        user: user,
        password: key
      });

      try {
        // 1. Obtener total de registros
        const [countResult]: any = await connection.query(`SELECT COUNT(*) as cnt FROM ??`, [table_name]);
        totalRecords = countResult[0].cnt;

        // 2. Evaluar cada regla
        for (const rule of rules) {
          let affected = 0;
          const fieldName = rule.fieldName;

          if (!fieldName) {
            ruleResults.push({ ruleId: rule.id, total: totalRecords, affected: 0, error: 'No field name provided' });
            continue;
          }

          if (rule.type === 'Nulos') {
            const [nullResult]: any = await connection.query(`SELECT COUNT(*) as cnt FROM ?? WHERE ?? IS NULL`, [table_name, fieldName]);
            affected = nullResult[0].cnt;
          } else if (rule.type === 'Duplicados') {
            const [dupResult]: any = await connection.query(`
              SELECT (COUNT(??) - COUNT(DISTINCT ??)) as cnt 
              FROM ?? 
              WHERE ?? IS NOT NULL
            `, [fieldName, fieldName, table_name, fieldName]);
            affected = dupResult[0].cnt;
          } else if (rule.type === 'Formato') {
            const pattern = rule.config?.regex || '^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$';
            const [formatResult]: any = await connection.query(`
              SELECT COUNT(*) as cnt 
              FROM ?? 
              WHERE ?? IS NOT NULL AND ?? NOT REGEXP ?
            `, [table_name, fieldName, fieldName, pattern]);
            affected = formatResult[0].cnt;
          }

          ruleResults.push({
            ruleId: rule.id,
            total: totalRecords,
            affected: affected,
            compliant: totalRecords - affected
          });
        }
      } finally {
        await connection.end();
      }

    } else {
      return NextResponse.json({ success: false, error: 'Tipo de base de datos no soportado' }, { status: 400 });
    }

    return NextResponse.json({ success: true, totalRecords, ruleResults });
    
  } catch (error: any) {
    console.error('[Quality Scan Error]', error);
    const errorMessage = error.errors ? error.errors.map((e: any) => e.message).join(', ') : error.message;
    return NextResponse.json({ success: false, error: errorMessage || 'Error desconocido' }, { status: 500 });
  }
}
