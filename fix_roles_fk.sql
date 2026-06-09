-- Correct foreign key mapping for roles table to point to public.tenants(id)
-- instead of tenant_config(id).

-- Drop constraints & recreate roles properly
ALTER TABLE IF EXISTS public.roles DROP CONSTRAINT IF EXISTS roles_tenant_id_fkey;

ALTER TABLE public.roles 
  ADD CONSTRAINT roles_tenant_id_fkey 
  FOREIGN KEY (tenant_id) 
  REFERENCES public.tenants(id) 
  ON DELETE CASCADE;
