-- ==========================================
-- GOVDATA NEXUS - FULL SUPABASE SCHEMA
-- ==========================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CATÁLOGO Y METADATA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.data_assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(100),
    data_owner VARCHAR(255),
    records_count VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Sincronizado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    asset_id UUID REFERENCES public.data_assets(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(100),
    is_sensitive BOOLEAN DEFAULT false,
    sensitivity VARCHAR(100),
    quality_rule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.glossary_terms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    domain VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Publicado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. CALIDAD DE DATOS (QUALITY)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.quality_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    asset_id UUID REFERENCES public.data_assets(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Activa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quality_incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    asset_id UUID REFERENCES public.data_assets(id) ON DELETE CASCADE,
    issue_type VARCHAR(255) NOT NULL,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Abierto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. GOBIERNO Y EQUIPO (TEAM)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    avatar VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. WORKFLOWS Y TICKETS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.workflow_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pendiente',
    requested_by UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. POLÍTICAS Y SEGURIDAD
-- ==========================================

CREATE TABLE IF NOT EXISTS public.data_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    objective TEXT,
    scope TEXT,
    status VARCHAR(50) DEFAULT 'Vigente',
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.security_incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Investigando',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. MADUREZ (MATURITY)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.maturity_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    dimension VARCHAR(100) NOT NULL,
    score DECIMAL(3,2) NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- HABILITAR SEGURIDAD RLS
-- ==========================================

ALTER TABLE public.data_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturity_assessments ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (para facilidad en modo desarrollo/demo)
CREATE POLICY "Permitir todo a todos" ON public.data_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.asset_fields FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.glossary_terms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.quality_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.quality_incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.team_domains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.workflow_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.data_policies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.security_incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos" ON public.maturity_assessments FOR ALL USING (true) WITH CHECK (true);
