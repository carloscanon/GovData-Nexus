-- Tabla para almacenar las Reglas de Calidad configuradas por Activo
CREATE TABLE IF NOT EXISTS quality_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    asset_id UUID NOT NULL REFERENCES data_assets(id) ON DELETE CASCADE,
    field_id UUID, -- Referencia opcional al campo específico dentro del activo
    rule_name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL, -- Integridad, Completitud, Exactitud, Unicidad, Nulos, Formato, Duplicados, Rango, Negocio
    status TEXT DEFAULT 'Activa',
    severity TEXT DEFAULT 'Media', -- Crítica, Alta, Media, Baja
    config JSONB, -- Configuraciones extra (ej. Regex, mín/máx, listados permitidos)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar el historial de incidentes y resultados de ejecución de validación de calidad
CREATE TABLE IF NOT EXISTS quality_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    asset_id UUID NOT NULL REFERENCES data_assets(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES quality_rules(id) ON DELETE SET NULL,
    description TEXT,
    priority TEXT NOT NULL, -- Crítico, Alto, Medio, Bajo
    status TEXT DEFAULT 'Abierto', -- Abierto, En Progreso, Corregido, Cerrado
    total_records INT DEFAULT 0,
    affected_records INT DEFAULT 0,
    compliant_records INT DEFAULT 0,
    compliance_pct NUMERIC(5,2) DEFAULT 0.00,
    assigned_to TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modificar el default de data_assets para garantizar que parta en 0 si no se ha validado
ALTER TABLE data_assets ALTER COLUMN quality_score SET DEFAULT 0;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE quality_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_incidents ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para quality_rules
CREATE POLICY "tenant_isolation_select_quality_rules" 
ON quality_rules FOR SELECT 
USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "tenant_isolation_insert_quality_rules" 
ON quality_rules FOR INSERT 
WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "tenant_isolation_update_quality_rules" 
ON quality_rules FOR UPDATE 
USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "tenant_isolation_delete_quality_rules" 
ON quality_rules FOR DELETE 
USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Políticas de Seguridad para quality_incidents
CREATE POLICY "tenant_isolation_select_quality_incidents" 
ON quality_incidents FOR SELECT 
USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "tenant_isolation_insert_quality_incidents" 
ON quality_incidents FOR INSERT 
WITH CHECK (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "tenant_isolation_update_quality_incidents" 
ON quality_incidents FOR UPDATE 
USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "tenant_isolation_delete_quality_incidents" 
ON quality_incidents FOR DELETE 
USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);
