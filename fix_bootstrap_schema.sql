-- =========================================================
-- SCRIPT DE REPARACIÓN DE ESQUEMA (BOOTSTRAP FIX)
-- =========================================================

-- 1. Arreglar el tipo de dato de `score` en `maturity_assessments`
-- Antes era DECIMAL(3,2) que solo permite valores hasta 9.99, 
-- por lo que reventaba con un "numeric field overflow" al intentar guardar 50 o 100.
ALTER TABLE public.maturity_assessments 
ALTER COLUMN score TYPE DECIMAL(5,2);

-- 2. Agregar las columnas faltantes a `data_assets` para que acepte
-- los campos que el Launchpad envía automáticamente al pre-poblar el catálogo.
ALTER TABLE public.data_assets 
ADD COLUMN IF NOT EXISTS code_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS sensitivity VARCHAR(50),
ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50);
