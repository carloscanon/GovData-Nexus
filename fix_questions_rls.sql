-- =========================================================
-- SOLUCIÓN: HABILITAR LECTURA PÚBLICA PARA LAS PREGUNTAS
-- =========================================================
-- Este script soluciona el problema donde el frontend no puede 
-- leer las preguntas debido a políticas de seguridad estrictas (RLS).

-- 1. Nos aseguramos que RLS está activo (buenas prácticas)
ALTER TABLE public.diagnostic_questions ENABLE ROW LEVEL SECURITY;

-- 2. Eliminamos políticas anteriores si existieran
DROP POLICY IF EXISTS "Permitir lectura global o del tenant" ON public.diagnostic_questions;
DROP POLICY IF EXISTS "Permitir todo a todos temporalmente" ON public.diagnostic_questions;
DROP POLICY IF EXISTS "Permitir lectura publica" ON public.diagnostic_questions;

-- 3. Creamos una política que permita a la aplicación leer todas las preguntas (Select) libremente
CREATE POLICY "Permitir lectura publica" 
ON public.diagnostic_questions 
FOR SELECT 
USING (true);

-- 4. Opcional: Desactivamos temporalmente RLS si lo anterior falla
-- ALTER TABLE public.diagnostic_questions DISABLE ROW LEVEL SECURITY;
