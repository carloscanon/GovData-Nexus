-- =========================================================
-- SCRIPT DE REPARACIÓN DE ESQUEMA PARTE 2 (COLUMNAS FALTANTES)
-- =========================================================

-- 1. Agregar 'allocation' a team_members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS allocation INTEGER DEFAULT 100;

-- 2. Agregar 'priority' a team_domains
ALTER TABLE public.team_domains 
ADD COLUMN IF NOT EXISTS priority VARCHAR(50);

-- 3. Agregar 'owner' a data_policies
ALTER TABLE public.data_policies 
ADD COLUMN IF NOT EXISTS owner VARCHAR(100);

-- NOTA: Si Supabase muestra un error de caché (Schema Cache) luego de 
-- correr esto, asegúrate de recargar la página del navegador para 
-- que el cliente JS descargue la definición fresca de Supabase.
