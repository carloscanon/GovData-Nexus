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

async function fetchKeysFromPg(config: any, tableName: string, keyColumn: string): Promise<any[]> {
  const pool = new PgPool({ ...config, ssl: { rejectUnauthorized: false } });
  try {
    let resolvedSchema = 'public';
    let resolvedTable = tableName;
    if (tableName.includes('.')) {
      const parts = tableName.split('.');
      resolvedSchema = parts[0].replace(/"/g, '');
      resolvedTable = parts[1].replace(/"/g, '');
    }

    const tableRef = `"${resolvedSchema}"."${resolvedTable}"`;
    const colRef = `"${keyColumn}"`;

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
    const [rows]: any = await connection.query(
      `SELECT CAST(?? AS CHAR) as keyval FROM ?? WHERE ?? IS NOT NULL`,
      [keyColumn, tableName, keyColumn]
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
    let resolvedSchema = 'public';
    let resolvedTable = tableName;
    if (tableName.includes('.')) {
      const parts = tableName.split('.');
      resolvedSchema = parts[0].replace(/"/g, '');
      resolvedTable = parts[1].replace(/"/g, '');
    }
    const res = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE LOWER(table_schema) = LOWER($1) AND LOWER(table_name) = LOWER($2)`,
      [resolvedSchema, resolvedTable]
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
    let resolvedSchema = 'public';
    let resolvedTable = tableName;
    if (tableName.includes('.')) {
      const parts = tableName.split('.');
      resolvedSchema = parts[0].replace(/"/g, '');
      resolvedTable = parts[1].replace(/"/g, '');
    }
    const tableRef = `"${resolvedSchema}"."${resolvedTable}"`;
    const colEscaped = columns.map(c => `"${c}"`).join(', ');
    const keyEscaped = `"${keyColumn}"`;
    
    // Postgres placeholder parameters
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
    const colEscaped = columns.map(c => `??`).join(', ');
    const queryParams = [keyColumn, ...columns, tableName, keyColumn, ...keys];
    
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
      // 1. Obtener columnas de ambas tablas
      const colsA = await getTableColumns(connA, tableNameA);
      const colsB = await getTableColumns(connB, tableNameB);

      // 2. Encontrar columnas comunes (excluyendo llaves)
      const commonCols = colsA.filter(c => colsB.includes(c) && c.toLowerCase() !== keyA.toLowerCase() && c.toLowerCase() !== keyB.toLowerCase());

      const commonKeys = keysA.filter(k => setB.has(String(k)));
      matched = commonKeys.length;

      if (commonCols.length > 0 && commonKeys.length > 0) {
        // Consultar valores de filas para las primeras 100 llaves comunes para comparar
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
            // Comparar columna por columna
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
                break; // Detener chequeo de esta llave al encontrar la primera diferencia
              }
            }
          }
        }

        // Estrapolar discrepancia si el lote es una muestra
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
