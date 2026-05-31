-- ==============================================================================
-- GOVDATA NEXUS - SCHEMA UPDATE PARA POLÍTICAS DINÁMICAS
-- Añade trazabilidad de workflows y frameworks a las políticas
-- ==============================================================================

-- Añadir columnas para seguimiento documental en data_policies
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.policy_workflows(id) ON DELETE SET NULL;
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0;
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS framework_origin VARCHAR(100);
