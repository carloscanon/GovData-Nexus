-- =============================================================
-- GovData Nexus – Supabase Storage: policy-documents bucket
-- Run this script once in the Supabase SQL Editor
-- =============================================================

-- 1. Create the bucket (public = false → signed URLs required)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'policy-documents',
  'policy-documents',
  false,
  52428800,   -- 50 MB max per file
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS: authenticated users can upload to their own tenant folder
CREATE POLICY "Tenant users can upload policy documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'policy-documents'
);

CREATE POLICY "Tenant users can read policy documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'policy-documents'
);

CREATE POLICY "Tenant users can delete own policy documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'policy-documents'
);

-- 3. Also ensure governance-docs bucket exists (used by Committees module)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'governance-docs',
  'governance-docs',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit;

CREATE POLICY "Tenant users can upload governance docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'governance-docs');

CREATE POLICY "Tenant users can read governance docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'governance-docs');

CREATE POLICY "Tenant users can delete governance docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'governance-docs');
