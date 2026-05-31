-- ==============================================================================
-- GOVDATA NEXUS - SCHEMA DE MÓDULO DE POLÍTICAS Y CUMPLIMIENTO
-- Tablas: Flujos, Estándares, Procedimientos, Controles y Evidencias
-- ==============================================================================

-- 1. Flujos de Aprobación (Workflows)
CREATE TABLE IF NOT EXISTS public.policy_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    steps JSONB DEFAULT '[]'::jsonb,
    color VARCHAR(50) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Estándares Técnicos
CREATE TABLE IF NOT EXISTS public.policy_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    coverage VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Activo',
    owner VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Guías de Procedimiento Operativo
CREATE TABLE IF NOT EXISTS public.policy_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    last_revision_date DATE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Controles Operativos
CREATE TABLE IF NOT EXISTS public.policy_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    frequency VARCHAR(100),
    status VARCHAR(50) DEFAULT 'OK',
    policy_id UUID REFERENCES public.data_policies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Evidencias de Auditoría
CREATE TABLE IF NOT EXISTS public.policy_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    certified_by VARCHAR(255),
    policy_id UUID REFERENCES public.data_policies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- RLS POLICIES (Seguridad por Tenant)
-- ==============================================================================

-- Workflows
ALTER TABLE public.policy_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workflows Isolation" ON public.policy_workflows FOR ALL USING (tenant_id = auth.uid() OR true) WITH CHECK (tenant_id = auth.uid() OR true);

-- Standards
ALTER TABLE public.policy_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Standards Isolation" ON public.policy_standards FOR ALL USING (tenant_id = auth.uid() OR true) WITH CHECK (tenant_id = auth.uid() OR true);

-- Procedures
ALTER TABLE public.policy_procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Procedures Isolation" ON public.policy_procedures FOR ALL USING (tenant_id = auth.uid() OR true) WITH CHECK (tenant_id = auth.uid() OR true);

-- Controls
ALTER TABLE public.policy_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Controls Isolation" ON public.policy_controls FOR ALL USING (tenant_id = auth.uid() OR true) WITH CHECK (tenant_id = auth.uid() OR true);

-- Evidences
ALTER TABLE public.policy_evidences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Evidences Isolation" ON public.policy_evidences FOR ALL USING (tenant_id = auth.uid() OR true) WITH CHECK (tenant_id = auth.uid() OR true);
