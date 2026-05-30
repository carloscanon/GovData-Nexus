-- ==========================================
-- TABLA DE CONFIGURACIÓN Y COLORES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.tenant_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, config_key)
);

-- Habilitar RLS
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a todos en tenant_config" ON public.tenant_config FOR ALL USING (true) WITH CHECK (true);
