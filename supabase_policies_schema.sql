-- ==========================================
-- EXTENSIÓN PARA POLÍTICAS
-- ==========================================
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS type VARCHAR(100);
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS expiry VARCHAR(50);
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS owner VARCHAR(255);
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS guidelines JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS controls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.data_policies ADD COLUMN IF NOT EXISTS sancions TEXT;
