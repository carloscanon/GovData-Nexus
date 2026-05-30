-- =========================================================
-- MASTER PRODUCTION SCHEMA SYNCHRONIZATION
-- GovData Nexus - Enterprise Multi-Tenant Edition
-- =========================================================

-- IMPORTANTE: Este script añade las tablas y columnas necesarias para 
-- soportar todas las inserciones del frontend (Launchpad, AutoScan, Quality, etc.)
-- y asegura el aislamiento multi-tenant a través de RLS.

-- =========================================================
-- 1. EXTENSIÓN DE TABLAS EXISTENTES
-- =========================================================

-- Tabla: data_assets (Catálogo)
ALTER TABLE public.data_assets 
ADD COLUMN IF NOT EXISTS table_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS criticality VARCHAR(50),
ADD COLUMN IF NOT EXISTS owner VARCHAR(255),
ADD COLUMN IF NOT EXISTS tags JSONB;

-- Tabla: quality_rules
ALTER TABLE public.quality_rules 
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS config JSONB,
ADD COLUMN IF NOT EXISTS severity VARCHAR(50);

-- Tabla: quality_incidents
ALTER TABLE public.quality_incidents
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS total_records INTEGER,
ADD COLUMN IF NOT EXISTS affected_records INTEGER,
ADD COLUMN IF NOT EXISTS compliant_records INTEGER,
ADD COLUMN IF NOT EXISTS compliance_pct DECIMAL(5,2);

-- Tabla: tenant_users
ALTER TABLE public.tenant_users
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- =========================================================
-- 2. CREACIÓN O EXTENSIÓN DE TABLAS NUEVAS
-- =========================================================

-- Tabla: data_connections (Escaneo Automático)
CREATE TABLE IF NOT EXISTS public.data_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID,
    name VARCHAR(255) NOT NULL,
    source_id VARCHAR(100) NOT NULL,
    host VARCHAR(255),
    username VARCHAR(100),
    password_encrypted VARCHAR(255),
    connection_string TEXT,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.data_connections ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Tabla: notification_channels (Calidad de Datos)
CREATE TABLE IF NOT EXISTS public.notification_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID,
    type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    config JSONB,
    status VARCHAR(50) DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.notification_channels ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- =========================================================
-- 3. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - AISLAMIENTO)
-- =========================================================

-- Asegurar RLS en nuevas tablas
ALTER TABLE public.data_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;

-- Utilizamos un bloque DO para ejecutar las políticas de forma dinámica.
-- Esto evita el error "column tenant_id does not exist" durante la fase 
-- de parseo inicial de PostgreSQL cuando las tablas acaban de ser alteradas.
DO $$ 
BEGIN
    -- Políticas para data_connections
    DROP POLICY IF EXISTS "Aislamiento por Tenant - data_connections" ON public.data_connections;
    EXECUTE '
    CREATE POLICY "Aislamiento por Tenant - data_connections" 
    ON public.data_connections FOR ALL 
    USING (tenant_id IS NULL OR tenant_id = current_setting(''app.current_tenant'', true)::uuid);
    ';

    -- Políticas para notification_channels
    DROP POLICY IF EXISTS "Aislamiento por Tenant - notification_channels" ON public.notification_channels;
    EXECUTE '
    CREATE POLICY "Aislamiento por Tenant - notification_channels" 
    ON public.notification_channels FOR ALL 
    USING (tenant_id IS NULL OR tenant_id = current_setting(''app.current_tenant'', true)::uuid);
    ';
END $$;
