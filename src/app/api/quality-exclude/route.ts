import { NextResponse } from 'next/server';
import { Pool as PgPool } from 'pg';
import mysql from 'mysql2/promise';

function buildPgConfig(params: any) {
  if (params.connection_string) {
    return { connectionString: params.connection_string };
  }
  return {
    host: params.host,
    user: params.user,
    password: params.key,
    port: params.port || 5432,
    database: params.database_name || 'postgres'
  };
}

async function resolvePgTable(
  pool: PgPool,
  tableName: string
): Promise<{ schema: string; table: string } | null> {
  let schemaHint: string | null = null;
  let tableHint = tableName;

  if (tableName.includes('.')) {
    const parts = tableName.split('.');
    schemaHint = parts[0].replace(/"/g, '');
    tableHint = parts[1].replace(/"/g, '');
  }

  try {
    let query: string;
    let params: string[];

    if (schemaHint) {
      query = `
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE LOWER(table_schema) = LOWER($1) AND LOWER(table_name) = LOWER($2)
        LIMIT 1
      `;
      params = [schemaHint, tableHint];
    } else {
      query = `
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
          AND LOWER(table_name) = LOWER($1)
        ORDER BY CASE WHEN table_schema = 'public' THEN 0 ELSE 1 END
        LIMIT 1
      `;
      params = [tableHint];
    }

    const result = await pool.query(query, params);
    if (result.rows.length > 0) {
      return { schema: result.rows[0].table_schema, table: result.rows[0].table_name };
    }
  } catch (err) {
    console.warn('[Quality Scan] Error en resolvePgTable:', err);
  }
  return null;
}

async function resolvePgColumn(pool: PgPool, schema: string, table: string, colName: string): Promise<string> {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE LOWER(table_schema) = LOWER($1) AND LOWER(table_name) = LOWER($2)
    `, [schema, table]);
    const found = res.rows.find(r => r.column_name.toLowerCase() === colName.toLowerCase());
    return found ? found.column_name : colName;
  } catch {
    return colName;
  }
}

async function fetchKeysFromPg(config: any, tableName: string, keyColumn: string): Promise<any[]> {
  const pool = new PgPool({ ...config, ssl: { rejectUnauthorized: false } });
  try {
    const resolved = await resolvePgTable(pool, tableName);
    if (!resolved) {
      throw new Error(`La tabla "${tableName}" no se encontró en la base de datos.`);
    }

    const resolvedCol = await resolvePgColumn(pool, resolved.schema, resolved.table, keyColumn);
    const tableRef = `"${resolved.schema}"."${resolved.table}"`;
    const colRef = `"${resolvedCol}"`;

    const query = `SELECT ${colRef}::text as keyval FROM ${tableRef} WHERE ${colRef} IS NOT NULL`;
    const res = await pool.query(query);
    return res.rows.map(r => r.keyval);
  } finally {
    try { await pool.end(); } catch {}
  }
}

async function fetchKeysFromMysql(config: any, tableName: string, keyColumn: string): Promise<any[]> {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.key,
    database: config.database_name
  });
  try {
    // Resolver columnas del mysql para asegurar case
    const [cols]: any = await connection.query(`DESCRIBE ??`, [tableName]);
    const colNames = cols.map((c: any) => c.Field);
    const resolvedCol = colNames.find((c: any) => c.toLowerCase() === keyColumn.toLowerCase()) || keyColumn;

    const [rows]: any = await connection.query(
      `SELECT CAST(?? AS CHAR) as keyval FROM ?? WHERE ?? IS NOT NULL`,
      [resolvedCol, tableName, resolvedCol]
    );
    return rows.map((r: any) => r.keyval);
  } finally {
    try { await connection.end(); } catch {}
  }
}

async function getKeys(conn: any, tableName: string, keyColumn: string): Promise<any[]> {
  const dbType = conn.source_id || 'postgres';
  const pgConfig = buildPgConfig(conn);

  if (dbType === 'postgres') {
    return fetchKeysFromPg(pgConfig, tableName, keyColumn);
  } else if (dbType === 'mysql') {
    return fetchKeysFromMysql(conn, tableName, keyColumn);
  }
  throw new Error(`Database type ${dbType} not supported`);
}

async function getTableColumnsPg(config: any, tableName: string): Promise<string[]> {
  const pool = new PgPool({ ...config, ssl: { rejectUnauthorized: false } });
  try {
    const resolved = await resolvePgTable(pool, tableName);
    if (!resolved) return [];
    const res = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE LOWER(table_schema) = LOWER($1) AND LOWER(table_name) = LOWER($2)`,
      [resolved.schema, resolved.table]
    );
    return res.rows.map(r => r.column_name);
  } finally {
    try { await pool.end(); } catch {}
  }
}

async function getTableColumnsMysql(config: any, tableName: string): Promise<string[]> {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.key,
    database: config.database_name
  });
  try {
    const [rows]: any = await connection.query(`DESCRIBE ??`, [tableName]);
    return rows.map((r: any) => r.Field);
  } finally {
    try { await connection.end(); } catch {}
  }
}

async function getTableColumns(conn: any, tableName: string): Promise<string[]> {
  const dbType = conn.source_id || 'postgres';
  const pgConfig = buildPgConfig(conn);
  if (dbType === 'postgres') {
    return getTableColumnsPg(pgConfig, tableName);
  } else if (dbType === 'mysql') {
    return getTableColumnsMysql(conn, tableName);
  }
  return [];
}

async function fetchRowsByKeysPg(config: any, tableName: string, keyColumn: string, columns: string[], keys: any[]): Promise<any[]> {
  if (keys.length === 0) return [];
  const pool = new PgPool({ ...config, ssl: { rejectUnauthorized: false } });
  try {
    const resolved = await resolvePgTable(pool, tableName);
    if (!resolved) return [];

    const resolvedKeyCol = await resolvePgColumn(pool, resolved.schema, resolved.table, keyColumn);
    const resolvedCols = await Promise.all(columns.map(c => resolvePgColumn(pool, resolved.schema, resolved.table, c)));

    const tableRef = `"${resolved.schema}"."${resolved.table}"`;
    const colEscaped = resolvedCols.map(c => `"${c}"`).join(', ');
    const keyEscaped = `"${resolvedKeyCol}"`;
    
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `SELECT ${keyEscaped}::text as keyval, ${colEscaped} FROM ${tableRef} WHERE ${keyEscaped}::text IN (${placeholders})`;
    
    const res = await pool.query(query, keys.map(String));
    return res.rows;
  } finally {
    try { await pool.end(); } catch {}
  }
}

async function fetchRowsByKeysMysql(config: any, tableName: string, keyColumn: string, columns: string[], keys: any[]): Promise<any[]> {
  if (keys.length === 0) return [];
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.key,
    database: config.database_name
  });
  try {
    const [cols]: any = await connection.query(`DESCRIBE ??`, [tableName]);
    const colNames = cols.map((c: any) => c.Field);

    const resolvedKeyCol = colNames.find((c: any) => c.toLowerCase() === keyColumn.toLowerCase()) || keyColumn;
    const resolvedCols = columns.map(col => colNames.find((c: any) => c.toLowerCase() === col.toLowerCase()) || col);

    const colEscaped = resolvedCols.map(() => `??`).join(', ');
    const queryParams = [resolvedKeyCol, ...resolvedCols, tableName, resolvedKeyCol, ...keys];
    
    const placeholders = keys.map(() => '?').join(', ');
    const query = `SELECT CAST(?? AS CHAR) as keyval, ${colEscaped} FROM ?? WHERE ?? IN (${placeholders})`;
    
    const [rows]: any = await connection.query(query, queryParams);
    return rows;
  } finally {
    try { await connection.end(); } catch {}
  }
}

async function fetchRowsByKeys(conn: any, tableName: string, keyColumn: string, columns: string[], keys: any[]): Promise<any[]> {
  const dbType = conn.source_id || 'postgres';
  const pgConfig = buildPgConfig(conn);
  if (dbType === 'postgres') {
    return fetchRowsByKeysPg(pgConfig, tableName, keyColumn, columns, keys);
  } else if (dbType === 'mysql') {
    return fetchRowsByKeysMysql(conn, tableName, keyColumn, columns, keys);
  }
  return [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      connA,
      connB,
      tableNameA,
      tableNameB,
      keyA,
      keyB,
      exclusionMode
    } = body;

    if (!connA || !connB || !tableNameA || !tableNameB || !keyA || !keyB) {
      return NextResponse.json({ success: false, error: 'Parámetros incompletos' }, { status: 400 });
    }

    console.log(`[Exclusion API] Comparando. A: ${tableNameA}.${keyA} ↔ B: ${tableNameB}.${keyB}. Modo: ${exclusionMode}`);

    let keysA: any[] = [];
    let keysB: any[] = [];

    try {
      keysA = await getKeys(connA, tableNameA, keyA);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: `Error leyendo llaves de Tabla A: ${err.message}` }, { status: 500 });
    }

    try {
      keysB = await getKeys(connB, tableNameB, keyB);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: `Error leyendo llaves de Tabla B: ${err.message}` }, { status: 500 });
    }

    const totalA = keysA.length;
    const totalB = keysB.length;

    const setA = new Set(keysA.map(String));
    const setB = new Set(keysB.map(String));

    let matched = 0;
    let mismatched = 0;
    let pct = 100;
    let samples: any[] = [];

    if (exclusionMode === 'A_EXCLUDE_B') {
      const diff = keysA.filter(k => !setB.has(String(k)));
      mismatched = diff.length;
      matched = totalA - mismatched;
      pct = totalA > 0 ? (matched / totalA) * 100 : 100;
      samples = diff.slice(0, 10).map(k => ({
        key: String(k),
        reason: `Llave '${k}' de la columna '${keyA}' existe en ${tableNameA} pero no tiene correspondencia en ${tableNameB}.`
      }));
    } else if (exclusionMode === 'B_EXCLUDE_A') {
      const diff = keysB.filter(k => !setA.has(String(k)));
      mismatched = diff.length;
      matched = totalB - mismatched;
      pct = totalB > 0 ? (matched / totalB) * 100 : 100;
      samples = diff.slice(0, 10).map(k => ({
        key: String(k),
        reason: `Llave '${k}' de la columna '${keyB}' existe en ${tableNameB} pero no tiene correspondencia en ${tableNameA}.`
      }));
    } else if (exclusionMode === 'MATCHING_WITH_DIFF') {
      const colsA = await getTableColumns(connA, tableNameA);
      const colsB = await getTableColumns(connB, tableNameB);

      const commonCols = colsA.filter(c => colsB.includes(c) && c.toLowerCase() !== keyA.toLowerCase() && c.toLowerCase() !== keyB.toLowerCase());

      const commonKeys = keysA.filter(k => setB.has(String(k)));
      matched = commonKeys.length;

      if (commonCols.length > 0 && commonKeys.length > 0) {
        const batchKeys = commonKeys.slice(0, 150);
        const rowsA = await fetchRowsByKeys(connA, tableNameA, keyA, commonCols, batchKeys);
        const rowsB = await fetchRowsByKeys(connB, tableNameB, keyB, commonCols, batchKeys);

        const mapRowsA = new Map(rowsA.map(r => [String(r.keyval), r]));
        const mapRowsB = new Map(rowsB.map(r => [String(r.keyval), r]));

        const diffSamples: any[] = [];
        let checkedDiffCount = 0;

        for (const k of batchKeys) {
          const rA = mapRowsA.get(String(k));
          const rB = mapRowsB.get(String(k));
          if (rA && rB) {
            for (const col of commonCols) {
              const valA = rA[col];
              const valB = rB[col];
              if (String(valA || '').trim() !== String(valB || '').trim()) {
                checkedDiffCount++;
                if (diffSamples.length < 10) {
                  diffSamples.push({
                    key: String(k),
                    reason: `Discrepancia detectada en la columna "${col}" (en "${tableNameA}": "${valA ?? 'NULL'}" vs "${tableNameB}": "${valB ?? 'NULL'}").`
                  });
                }
                break;
              }
            }
          }
        }

        const diffRatio = batchKeys.length > 0 ? checkedDiffCount / batchKeys.length : 0;
        mismatched = Math.round(matched * diffRatio);
        samples = diffSamples;
      } else {
        mismatched = 0;
        samples = [];
      }

      pct = matched > 0 ? ((matched - mismatched) / matched) * 100 : 100;
    }

    return NextResponse.json({
      success: true,
      exclusionResult: {
        mode: exclusionMode,
        keyA,
        keyB,
        totalA,
        totalB,
        matched,
        mismatched,
        pct,
        samples
      }
    });

  } catch (error: any) {
    console.error('[Exclusion API Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Error interno' }, { status: 500 });
  }
}
