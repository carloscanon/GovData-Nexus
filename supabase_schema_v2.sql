-- 1. Ampliar tabla de activos
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS code_id TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS data_owner TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS data_steward TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS update_frequency TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS criticality TEXT;
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS risk_level TEXT; -- Bajo, Medio, Alto, Crítico
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array de etiquetas
ALTER TABLE data_assets ADD COLUMN IF NOT EXISTS description TEXT;

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
