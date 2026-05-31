-- Migración: Añadir soporte para documentos en Estándares y Procedimientos

ALTER TABLE public.policy_standards
ADD COLUMN IF NOT EXISTS document_url TEXT;

ALTER TABLE public.policy_procedures
ADD COLUMN IF NOT EXISTS document_url TEXT;
