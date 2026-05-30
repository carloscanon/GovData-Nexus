-- ==========================================
-- SCRIPT DE ACTUALIZACIÓN DE TABLAS - WORKFLOWS
-- ==========================================

-- 1. Crear tabla sla_rules (Faltante)
CREATE TABLE IF NOT EXISTS public.sla_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(50),
    domain VARCHAR(100),
    hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar columnas faltantes a workflow_requests
ALTER TABLE public.workflow_requests
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS priority VARCHAR(50),
ADD COLUMN IF NOT EXISTS sla VARCHAR(50),
ADD COLUMN IF NOT EXISTS sla_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS current_step VARCHAR(100),
ADD COLUMN IF NOT EXISTS timeline JSONB;
