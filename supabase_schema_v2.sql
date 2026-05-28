-- 1. Ampliar tabla de activos
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS code_id TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS data_owner TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS data_steward TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS update_frequency TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS criticality TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS risk_level TEXT; -- Bajo, Medio, Alto, Crítico
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array de etiquetas
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS records_count BIGINT; -- Número total de registros


-- 2. Tabla de Campos Internos (Data Dictionary)
CREATE TABLE IF NOT EXISTS asset_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES data_assets(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    data_type TEXT,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT FALSE,
    quality_rule TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS y políticas para asset_fields
ALTER TABLE asset_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de campos" ON asset_fields FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública de campos" ON asset_fields FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública de campos" ON asset_fields FOR UPDATE USING (true);
CREATE POLICY "Permitir borrado público de campos" ON asset_fields FOR DELETE USING (true);

-- 3. Tabla de Calidad Histórica
CREATE TABLE IF NOT EXISTS quality_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES data_assets(id) ON DELETE CASCADE,
    dimension TEXT, -- Completitud, Exactitud, etc.
    score INTEGER,
    check_date DATE DEFAULT CURRENT_DATE
);

-- 4. Datos de Prueba (Seed) para nuevos campos
UPDATE data_assets SET 
    code_id = 'AST-00' || id::text,
    data_owner = 'Juan Perez',
    data_steward = 'Maria Garcia',
    update_frequency = 'Diaria',
    criticality = 'Alta',
    risk_level = 'Medio',
    tags = ARRAY['Maestro', 'IA Ready', 'Regulado']
WHERE code_id IS NULL;
-- 5. Tabla de Workflows (Flujos de Aprobación)
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES data_assets(id) ON DELETE CASCADE,
    type TEXT, -- Cambio de Sensibilidad, Solicitud Acceso, Certificación
    requester TEXT,
    assigned_to TEXT,
    status TEXT DEFAULT 'Pendiente', -- Pendiente, Aprobado, Rechazado
    priority TEXT DEFAULT 'Media',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    description TEXT
);

-- 6. Tabla de Conexiones Persistentes
CREATE TABLE IF NOT EXISTS data_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_id TEXT NOT NULL, -- aws, azure, postgres, etc.
    host TEXT,
    username TEXT,
    password_encrypted TEXT,
    connection_string TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS y políticas
ALTER TABLE data_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de conexiones" ON data_connections FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública de conexiones" ON data_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública de conexiones" ON data_connections FOR UPDATE USING (true);


INSERT INTO workflows (asset_id, type, requester, assigned_to, status, priority, description)
SELECT id, 'Cambio de Sensibilidad', 'Carlos Admin', 'Data Owner', 'Pendiente', 'Alta', 'Solicitud para elevar a Confidencial'
FROM data_assets LIMIT 1;

-- Habilitar RLS y políticas para data_assets
ALTER TABLE data_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de activos" ON data_assets FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública de activos" ON data_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública de activos" ON data_assets FOR UPDATE USING (true);
CREATE POLICY "Permitir borrado público de activos" ON data_assets FOR DELETE USING (true);

-- 7. Motor de Reglas de Calidad
CREATE TABLE IF NOT EXISTS quality_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES data_assets(id) ON DELETE CASCADE,
    field_id UUID REFERENCES asset_fields(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Nulos, Duplicados, Formato, Rango, Negocio
    config JSONB, -- { min: 18, max: 100 } o { regex: '...' }
    severity TEXT DEFAULT 'Media', -- Baja, Media, Alta, Crítica
    status TEXT DEFAULT 'Activa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Gestión de Incidentes de Calidad
CREATE TABLE IF NOT EXISTS quality_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES data_assets(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES quality_rules(id) ON DELETE SET NULL,
    total_records INTEGER DEFAULT 0,
    affected_records INTEGER DEFAULT 0,
    compliant_records INTEGER DEFAULT 0,
    compliance_pct DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'Abierto', -- Abierto, En Análisis, Corregido, Cerrado
    priority TEXT DEFAULT 'Media',
    assigned_to TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    description TEXT
);

-- Habilitar RLS y políticas
ALTER TABLE quality_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pública lectura reglas" ON quality_rules FOR SELECT USING (true);
CREATE POLICY "Pública escritura reglas" ON quality_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Pública update reglas" ON quality_rules FOR UPDATE USING (true);
CREATE POLICY "Pública delete reglas" ON quality_rules FOR DELETE USING (true);

ALTER TABLE quality_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pública lectura incidentes" ON quality_incidents FOR SELECT USING (true);
CREATE POLICY "Pública escritura incidentes" ON quality_incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Pública update incidentes" ON quality_incidents FOR UPDATE USING (true);
CREATE POLICY "Pública delete incidentes" ON quality_incidents FOR DELETE USING (true);

-- 9. Canales de Notificación
CREATE TABLE IF NOT EXISTS notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- slack, teams, email
    webhook_url TEXT,
    config JSONB, -- { channel: '#alertas', icon: '...' }
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pública lectura canales" ON notification_channels FOR SELECT USING (true);
CREATE POLICY "Pública escritura canales" ON notification_channels FOR INSERT WITH CHECK (true);



