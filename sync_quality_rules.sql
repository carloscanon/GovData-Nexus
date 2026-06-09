-- 1. Sincronizar desde asset_fields hacia quality_rules (Crear reglas de calidad para los campos clasificados que no las tengan definidas en la tabla de calidad)
INSERT INTO public.quality_rules (id, tenant_id, asset_id, field_id, name, type, status, severity, created_at)
SELECT 
  gen_random_uuid(),
  da.tenant_id::uuid, 
  af.asset_id, 
  af.id, 
  af.quality_rule, 
  CASE WHEN LOWER(af.quality_rule) LIKE '%number%' OR LOWER(af.quality_rule) LIKE '%número%' THEN 'Formato' ELSE 'Completitud' END, 
  'Activa', 
  'Media',
  NOW()
FROM public.asset_fields af
JOIN public.data_assets da ON af.asset_id = da.id
LEFT JOIN public.quality_rules qr ON qr.field_id = af.id
WHERE af.quality_rule IS NOT NULL 
  AND af.quality_rule <> ''
  AND qr.id IS NULL;

-- 2. Sincronizar desde quality_rules hacia asset_fields (Actualizar nombres de reglas modificadas)
UPDATE public.asset_fields af
SET quality_rule = qr.name
FROM public.quality_rules qr
WHERE qr.field_id = af.id
  AND (af.quality_rule IS NULL OR af.quality_rule <> qr.name);
