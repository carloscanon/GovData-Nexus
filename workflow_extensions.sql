-- ==============================================================================
-- GOVDATA NEXUS - TABLAS PARA COMENTARIOS Y EVIDENCIAS DE WORKFLOWS
-- ==============================================================================

-- 1. Comentarios de Solicitudes/Casos
CREATE TABLE IF NOT EXISTS public.workflow_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    request_id UUID REFERENCES public.workflow_requests(id) ON DELETE CASCADE,
    author VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Evidencias/Archivos Adjuntos de Solicitudes/Casos
CREATE TABLE IF NOT EXISTS public.workflow_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    request_id UUID REFERENCES public.workflow_requests(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    description TEXT,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Seguridad)
ALTER TABLE public.workflow_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo en workflow_comments" ON public.workflow_comments;
CREATE POLICY "Permitir todo en workflow_comments" ON public.workflow_comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.workflow_evidences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo en workflow_evidences" ON public.workflow_evidences;
CREATE POLICY "Permitir todo en workflow_evidences" ON public.workflow_evidences FOR ALL USING (true) WITH CHECK (true);
