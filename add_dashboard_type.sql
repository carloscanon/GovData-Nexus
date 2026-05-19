-- MIGRACIÓN PARA GOVDATA NEXUS: AGREGAR TIPO DE DASHBOARD PREFERIDO
-- Ejecuta esta consulta en tu editor SQL de Supabase para poder persistir la preferencia en la base de datos.

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS dashboard_type VARCHAR(50) DEFAULT 'executive';
