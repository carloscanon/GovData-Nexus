-- Tabla para Activos de Datos (Scanner)
CREATE TABLE IF NOT EXISTS public.data_assets (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(100),
    data_owner VARCHAR(255),
    records_count VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Sincronizado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para Campos de los Activos (Clasificación)
CREATE TABLE IF NOT EXISTS public.asset_fields (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    asset_id UUID REFERENCES public.data_assets(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(100),
    is_sensitive BOOLEAN DEFAULT false,
    sensitivity VARCHAR(100),
    quality_rule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para Términos de Negocio (Glosario Corporativo)
CREATE TABLE IF NOT EXISTS public.glossary_terms (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    domain VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Publicado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (Opcional) Habilitar Seguridad de Nivel de Fila (RLS) para desarrollo
ALTER TABLE public.data_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo a todos en data_assets" ON public.data_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos en asset_fields" ON public.asset_fields FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos en glossary_terms" ON public.glossary_terms FOR ALL USING (true) WITH CHECK (true);
