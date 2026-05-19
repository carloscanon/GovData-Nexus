-- ==============================================================================
-- GovData Nexus - Multi-Tenant Architecture Setup
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase
-- ==============================================================================

-- 1. Crear tabla de Empresas (Tenants)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    subscription_plan VARCHAR(50) DEFAULT 'starter', -- starter, professional, enterprise
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
    billing_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla de Módulos por Empresa
-- Controla a qué módulos tiene acceso cada empresa
CREATE TABLE IF NOT EXISTS public.tenant_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL, -- catalog, quality, security, workflows, ai
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, module_name)
);

-- 3. Crear tabla de Límites y Uso (Opcional pero recomendado para facturación)
CREATE TABLE IF NOT EXISTS public.tenant_usage_limits (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    max_users INTEGER DEFAULT 10,
    max_assets INTEGER DEFAULT 100,
    api_calls_limit BIGINT DEFAULT 10000,
    api_calls_used BIGINT DEFAULT 0,
    storage_limit_mb INTEGER DEFAULT 500,
    storage_used_mb INTEGER DEFAULT 0,
    reset_date TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 4. ADAPTACIÓN DE TABLAS EXISTENTES
-- ==============================================================================

-- Ejemplo: Si ya tienes una tabla `users`, debemos agregarle el `tenant_id`
-- Descomenta y adapta estas líneas según las tablas que ya existan en tu base de datos:

/*
ALTER TABLE public.users 
ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Ejemplo para una tabla de 'assets' o 'catalog'
ALTER TABLE public.assets 
ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
*/

-- ==============================================================================
-- 5. SEGURIDAD A NIVEL DE FILAS (Row Level Security - RLS)
-- ==============================================================================
-- Esto es crucial para que una empresa no pueda ver los datos de otra.

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;

-- Políticas para tenants (Solo un superadmin puede ver todas, un usuario normal solo ve la suya)
-- NOTA: Asumimos que el usuario autenticado tiene su tenant_id en sus metadatos (app_metadata o user_metadata)

/*
-- Política para que un usuario vea solo los datos de su empresa en la tabla 'assets'
CREATE POLICY "Usuarios ven solo assets de su empresa" 
ON public.assets 
FOR ALL 
USING (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
);
*/

-- ==============================================================================
-- 6. INSERTAR DATOS DE PRUEBA (Opcional)
-- ==============================================================================
-- Insertar una empresa por defecto (tu primer cliente o tu entorno demo)
INSERT INTO public.tenants (id, name, domain, subscription_plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Corp', 'demo.govdata.com', 'enterprise')
ON CONFLICT DO NOTHING;

-- Darle acceso a todos los módulos
INSERT INTO public.tenant_modules (tenant_id, module_name, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'catalog', true),
    ('00000000-0000-0000-0000-000000000001', 'quality', true),
    ('00000000-0000-0000-0000-000000000001', 'security', true),
    ('00000000-0000-0000-0000-000000000001', 'workflows', true),
    ('00000000-0000-0000-0000-000000000001', 'ai', true)
ON CONFLICT DO NOTHING;
