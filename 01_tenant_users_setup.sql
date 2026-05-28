-- ==============================================================================
-- GovData Nexus - Tabla de Usuarios por Empresa (Tenant Users)
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase
-- REQUISITO: Haber ejecutado previamente 00_multitenant_setup.sql
-- ==============================================================================

-- 1. Crear tabla de Usuarios por Empresa
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,             -- En producción real, usar Supabase Auth + hash bcrypt
    role VARCHAR(50) DEFAULT 'viewer',  -- viewer | editor | admin | steward
    status VARCHAR(50) DEFAULT 'Activo', -- Activo | Inactivo | Suspendido
    avatar TEXT,                        -- URL o base64 de imagen de perfil
    last_access TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(email)                       -- Un email único por toda la plataforma
);

-- 2. Índice para búsquedas rápidas por tenant
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON public.tenant_users(email);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Política permisiva para operaciones completas (ajustar en producción con JWT)
CREATE POLICY "Permitir lectura pública de usuarios" ON public.tenant_users
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción pública de usuarios" ON public.tenant_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de usuarios" ON public.tenant_users
    FOR UPDATE USING (true);

CREATE POLICY "Permitir borrado público de usuarios" ON public.tenant_users
    FOR DELETE USING (true);

-- ==============================================================================
-- 4. DATOS DE PRUEBA - Insertar usuarios de ejemplo para la empresa Demo Corp
-- (La empresa 'Demo Corp' fue creada en 00_multitenant_setup.sql con ID fijo)
-- ==============================================================================

-- Usuario Administrador de la empresa Demo Corp
INSERT INTO public.tenant_users (tenant_id, name, email, password, role, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Carlos Admin',
    'carlos@demo.govdata.com',
    'admin123',
    'admin',
    'Activo'
) ON CONFLICT (email) DO NOTHING;

-- Usuario Editor de la empresa Demo Corp
INSERT INTO public.tenant_users (tenant_id, name, email, password, role, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'María García',
    'maria@demo.govdata.com',
    'editor123',
    'editor',
    'Activo'
) ON CONFLICT (email) DO NOTHING;

-- Usuario Data Steward de la empresa Demo Corp
INSERT INTO public.tenant_users (tenant_id, name, email, password, role, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Juan Steward',
    'juan@demo.govdata.com',
    'steward123',
    'steward',
    'Activo'
) ON CONFLICT (email) DO NOTHING;

-- Usuario Lector de la empresa Demo Corp
INSERT INTO public.tenant_users (tenant_id, name, email, password, role, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ana Viewer',
    'ana@demo.govdata.com',
    'viewer123',
    'viewer',
    'Activo'
) ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- RESUMEN DE ROLES Y ACCESO AL MENÚ:
-- ┌──────────────┬──────────────────────────────────────────────────────────────┐
-- │    Rol       │  Acceso al Menú Lateral (Sidebar)                           │
-- ├──────────────┼──────────────────────────────────────────────────────────────┤
-- │ superadmin   │  TODO (incluyendo panel /superadmin y selector de empresas)  │
-- │ admin        │  TODO los módulos habilitados del tenant (sin restricción)    │
-- │ steward      │  Solo módulos del plan del tenant                             │
-- │ editor       │  Solo módulos del plan del tenant                             │
-- │ viewer       │  Solo módulos del plan del tenant                             │
-- └──────────────┴──────────────────────────────────────────────────────────────┘
--
-- CREDENCIALES DE PRUEBA:
-- Superadmin (hardcoded): admin@govdata.io / admin123
-- Admin empresa Demo:     carlos@demo.govdata.com / admin123
-- Editor empresa Demo:    maria@demo.govdata.com / editor123
-- Steward empresa Demo:   juan@demo.govdata.com / steward123
-- Viewer empresa Demo:    ana@demo.govdata.com / viewer123
-- ==============================================================================
