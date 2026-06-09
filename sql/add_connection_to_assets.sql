-- =============================================================================
-- MIGRACIÓN: Vincular data_assets con data_connections
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- 1. Agregar columna connection_id a data_assets (si no existe)
ALTER TABLE data_assets 
  ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES data_connections(id) ON DELETE SET NULL;

-- 2. Agregar columna table_name a data_assets (nombre físico real de la tabla en la BD)
ALTER TABLE data_assets 
  ADD COLUMN IF NOT EXISTS table_name TEXT;

-- 3. Agregar columna schema_name (esquema de la BD, default 'public')
ALTER TABLE data_assets 
  ADD COLUMN IF NOT EXISTS schema_name TEXT DEFAULT 'public';

-- 4. Índice para búsquedas rápidas por conexión
CREATE INDEX IF NOT EXISTS idx_data_assets_connection_id ON data_assets(connection_id);

-- =============================================================================
-- VERIFICACIÓN: Ver estructura actual de las tablas
-- =============================================================================
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'data_assets' ORDER BY ordinal_position;

-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'data_connections' ORDER BY ordinal_position;
