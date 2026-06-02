-- ================================================================
-- STORAGE: Bucket governance-docs + Policies RLS
-- Ejecutar como superadmin en el SQL Editor de Supabase Dashboard
-- ================================================================

-- 1. Crear el bucket (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'governance-docs',
  'governance-docs',
  false,
  52428800,  -- 50 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Permitir SELECT (descarga) a usuarios autenticados del mismo tenant
--    El path tiene formato: {tenant_id}/{committee_name}/{filename}
CREATE POLICY "governance_docs_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'governance-docs'
);

-- 3. Policy: Permitir INSERT (subida) a usuarios autenticados
CREATE POLICY "governance_docs_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'governance-docs'
);

-- 4. Policy: Permitir DELETE a usuarios autenticados
CREATE POLICY "governance_docs_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'governance-docs'
);
