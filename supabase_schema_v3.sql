-- ==========================================
-- SCRIPT V3: METADATA INTELLIGENCE ENGINE
-- ==========================================
-- Crea las tablas núcleo para que Metadata actúe como
-- el motor central de la plataforma GovData Nexus.

-- 1. FUENTES DE METADATA (Sistemas Conectados)
CREATE TABLE IF NOT EXISTS metadata_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL, -- Ej: 'Oracle ERP'
    type VARCHAR(100) NOT NULL, -- Ej: 'RDBMS', 'Data Lake', 'API'
    connection_status VARCHAR(50) DEFAULT 'Active',
    last_scan TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ACTIVOS DE METADATA (Tablas, Vistas, Archivos)
CREATE TABLE IF NOT EXISTS metadata_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    source_id UUID REFERENCES metadata_sources(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Ej: 'CLIENTES'
    type VARCHAR(50) NOT NULL, -- 'Table', 'View', 'File'
    schema_name VARCHAR(100),
    owner VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. COLUMNAS DE METADATA (Campos dentro de los activos)
CREATE TABLE IF NOT EXISTS metadata_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    asset_id UUID REFERENCES metadata_assets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Ej: 'EMAIL'
    data_type VARCHAR(100) NOT NULL, -- Ej: 'VARCHAR(100)'
    is_nullable BOOLEAN DEFAULT true,
    is_primary_key BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLASIFICACIONES DE METADATA (IA Sensitivity, PII)
CREATE TABLE IF NOT EXISTS metadata_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    column_id UUID REFERENCES metadata_columns(id) ON DELETE CASCADE,
    classification_tag VARCHAR(100) NOT NULL, -- Ej: 'PII', 'Financial'
    confidence_score NUMERIC(5,2), -- Confianza de la IA (0-100)
    classified_by VARCHAR(50) DEFAULT 'AI_SCANNER', -- 'AI_SCANNER' o 'MANUAL'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RELACIONES Y LINAJE (Trazabilidad)
CREATE TABLE IF NOT EXISTS metadata_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    source_column_id UUID REFERENCES metadata_columns(id) ON DELETE CASCADE,
    target_column_id UUID REFERENCES metadata_columns(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- Ej: 'FOREIGN_KEY', 'ETL_TRANSFORM', 'API_FEED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GLOSARIO DE NEGOCIO
CREATE TABLE IF NOT EXISTS glossary_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    domain VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR SEGURIDAD (RLS) PARA TODAS LAS TABLAS
ALTER TABLE metadata_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

-- POLITICAS BÁSICAS MULTI-TENANT (Permiten leer/escribir aislando por tenant)
CREATE POLICY "Tenant Access metadata_sources" ON metadata_sources FOR ALL USING (true);
CREATE POLICY "Tenant Access metadata_assets" ON metadata_assets FOR ALL USING (true);
CREATE POLICY "Tenant Access metadata_columns" ON metadata_columns FOR ALL USING (true);
CREATE POLICY "Tenant Access metadata_classifications" ON metadata_classifications FOR ALL USING (true);
CREATE POLICY "Tenant Access metadata_relationships" ON metadata_relationships FOR ALL USING (true);
CREATE POLICY "Tenant Access glossary_terms" ON glossary_terms FOR ALL USING (true);

-- NOTA: Las políticas anteriores tienen 'true' temporalmente asumiendo 
-- que GovData Nexus aplica el filtro 'tenant_id' en la capa de la aplicación, 
-- similar a la configuración que se ha manejado en las tablas anteriores.
