-- ==============================================================================
-- GOVDATA NEXUS - SCHEMA DE MÓDULO DE EQUIPO Y ROLES
-- Tablas: team_members, team_domains
-- ==============================================================================

-- 1. Miembros del Equipo
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

-- 2. Dominios de Datos
CREATE TABLE IF NOT EXISTS public.team_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- RLS POLICIES (Seguridad)
-- ==============================================================================

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_domains ENABLE ROW LEVEL SECURITY;

-- Evitar duplicados de políticas si ya existen
DROP POLICY IF EXISTS "Permitir todo a todos en team_members" ON public.team_members;
CREATE POLICY "Permitir todo a todos en team_members" ON public.team_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a todos en team_domains" ON public.team_domains;
CREATE POLICY "Permitir todo a todos en team_domains" ON public.team_domains FOR ALL USING (true) WITH CHECK (true);
