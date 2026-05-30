-- ==========================================
-- EXTENSIÓN PARA MADUREZ Y WORKFLOWS
-- ==========================================

-- 1. Ampliar la tabla de Workflows para soportar la UI completa
ALTER TABLE public.workflow_requests ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE public.workflow_requests ADD COLUMN IF NOT EXISTS priority VARCHAR(50);
ALTER TABLE public.workflow_requests ADD COLUMN IF NOT EXISTS sla VARCHAR(50);
ALTER TABLE public.workflow_requests ADD COLUMN IF NOT EXISTS sla_status VARCHAR(50);
ALTER TABLE public.workflow_requests ADD COLUMN IF NOT EXISTS current_step VARCHAR(100);
ALTER TABLE public.workflow_requests ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;

-- 2. Crear la tabla de Reglas SLA para Workflows
CREATE TABLE IF NOT EXISTS public.sla_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'Cualquiera',
    domain VARCHAR(100) DEFAULT 'General',
    hours INTEGER NOT NULL DEFAULT 48,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para SLA
ALTER TABLE public.sla_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a todos en sla_rules" ON public.sla_rules FOR ALL USING (true) WITH CHECK (true);

-- 3. Ampliar la tabla de Madurez para guardar las respuestas exactas (histórico)
ALTER TABLE public.maturity_assessments ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;
