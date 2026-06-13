-- ==============================================================================
-- GOVDATA NEXUS - ARCHITECTURE: CENTRALIZED AUDIT SYSTEM SCHEMA
-- ==============================================================================

-- 1. Configuraciones de Auditoría (Tiempos de Retención)
CREATE TABLE IF NOT EXISTS public.saas_audit_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retention_days INT NOT NULL DEFAULT 8,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'admin@govdata.com'
);

-- Registrar configuración por defecto
INSERT INTO public.saas_audit_settings (retention_days)
VALUES (8)
ON CONFLICT DO NOTHING;

-- 2. Historial de Conexiones de Sesión
CREATE TABLE IF NOT EXISTS public.saas_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(100),
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    session_duration INTERVAL,
    ip_address VARCHAR(45),
    city VARCHAR(100),
    country VARCHAR(100),
    browser VARCHAR(100),
    os VARCHAR(100),
    device VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Activa', -- 'Activa', 'Expirada', 'Cerrada', 'Forzada'
    is_suspicious BOOLEAN DEFAULT false,
    suspicious_reason TEXT
);

-- 3. Registro de Actividades Críticas
CREATE TABLE IF NOT EXISTS public.saas_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    module VARCHAR(100) NOT NULL,
    functionality VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(45),
    browser VARCHAR(255),
    result VARCHAR(50) DEFAULT 'Success', -- 'Success', 'Failure'
    old_values JSONB DEFAULT '{}'::jsonb,
    new_values JSONB DEFAULT '{}'::jsonb,
    execution_time_ms INTEGER DEFAULT 0,
    justification TEXT
);

-- 4. Alertas de Seguridad Automáticas
CREATE TABLE IF NOT EXISTS public.saas_audit_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL, -- 'failed_logins', 'suspicious_geo', 'bulk_delete', 'critical_permission', 'integration_change'
    severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'Abierta', -- 'Abierta', 'Investigando', 'Resuelta', 'Ignorada'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATED PURGE POLICIES (Triggers and functions)
-- ==============================================================================

CREATE OR REPLACE FUNCTION purge_expired_audit_records()
RETURNS trigger AS $$
DECLARE
    v_retention_days integer;
BEGIN
    -- Obtener la retención configurada (default 8)
    SELECT COALESCE((SELECT retention_days FROM public.saas_audit_settings LIMIT 1), 8) INTO v_retention_days;
    
    -- Purgar conexiones viejas
    DELETE FROM public.saas_connections WHERE login_time < (NOW() - (v_retention_days || ' days')::interval);
    
    -- Purgar logs de actividad viejos
    DELETE FROM public.saas_audit_logs WHERE created_at < (NOW() - (v_retention_days || ' days')::interval);
    
    -- Purgar alertas resueltas viejas
    DELETE FROM public.saas_audit_alerts WHERE status = 'Resuelta' AND created_at < (NOW() - (v_retention_days || ' days')::interval);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar la purga al actualizar configuración
DROP TRIGGER IF EXISTS trigger_purge_on_settings_update ON public.saas_audit_settings;
CREATE TRIGGER trigger_purge_on_settings_update
AFTER INSERT OR UPDATE ON public.saas_audit_settings
FOR EACH STATEMENT
EXECUTE FUNCTION purge_expired_audit_records();

-- ==============================================================================
-- PERFORMANCE INDEXING (Para soportar millones de registros)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_connections_tenant_time ON public.saas_connections(tenant_id, login_time DESC);
CREATE INDEX IF NOT EXISTS idx_connections_user ON public.saas_connections(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_time ON public.saas_audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.saas_audit_logs(module, action);
CREATE INDEX IF NOT EXISTS idx_audit_alerts_status ON public.saas_audit_alerts(status, severity);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================
ALTER TABLE public.saas_audit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_audit_alerts ENABLE ROW LEVEL SECURITY;

-- Permitir acceso global a SuperAdmins (Demo simplificada con true)
DROP POLICY IF EXISTS "Permitir todo a todos en saas_audit_settings" ON public.saas_audit_settings;
CREATE POLICY "Permitir todo a todos en saas_audit_settings" ON public.saas_audit_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a todos en saas_connections" ON public.saas_connections;
CREATE POLICY "Permitir todo a todos en saas_connections" ON public.saas_connections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a todos en saas_audit_logs" ON public.saas_audit_logs;
CREATE POLICY "Permitir todo a todos en saas_audit_logs" ON public.saas_audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a todos en saas_audit_alerts" ON public.saas_audit_alerts;
CREATE POLICY "Permitir todo a todos en saas_audit_alerts" ON public.saas_audit_alerts FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA (MOCK CORPORATE LOGS)
-- ==============================================================================

-- Seeding Conexiones
INSERT INTO public.saas_connections (tenant_id, user_email, user_name, user_role, login_time, logout_time, session_duration, ip_address, city, country, browser, os, device, status, is_suspicious, suspicious_reason)
SELECT 
    id as tenant_id, 
    'carlos.director@' || lower(replace(name, ' ', '')) || '.com' as user_email,
    'Carlos Director' as user_name,
    'CDO' as user_role,
    NOW() - INTERVAL '3 hours' as login_time,
    NOW() - INTERVAL '1 hour' as logout_time,
    INTERVAL '2 hours' as session_duration,
    '186.116.14.82' as ip_address,
    'Bogotá' as city,
    'Colombia' as country,
    'Chrome' as browser,
    'Windows 11' as os,
    'Escritorio' as device,
    'Cerrada' as status,
    false as is_suspicious,
    NULL as suspicious_reason
FROM public.tenants LIMIT 5;

INSERT INTO public.saas_connections (tenant_id, user_email, user_name, user_role, login_time, logout_time, session_duration, ip_address, city, country, browser, os, device, status, is_suspicious, suspicious_reason)
SELECT 
    id as tenant_id, 
    'ana.steward@' || lower(replace(name, ' ', '')) || '.com' as user_email,
    'Ana Garcia' as user_name,
    'Data Steward' as user_role,
    NOW() - INTERVAL '15 minutes' as login_time,
    NULL as logout_time,
    NULL as session_duration,
    '190.143.2.11' as ip_address,
    'Medellín' as city,
    'Colombia' as country,
    'Safari' as browser,
    'macOS Sonoma' as os,
    'Escritorio' as device,
    'Activa' as status,
    false as is_suspicious,
    NULL as suspicious_reason
FROM public.tenants LIMIT 5;

-- Conexión Sospechosa (Fuera de horario e IP extraña)
INSERT INTO public.saas_connections (tenant_id, user_email, user_name, user_role, login_time, logout_time, session_duration, ip_address, city, country, browser, os, device, status, is_suspicious, suspicious_reason)
SELECT 
    id as tenant_id, 
    'luis.owner@' || lower(replace(name, ' ', '')) || '.com' as user_email,
    'Luis Martinez' as user_name,
    'Data Owner' as user_role,
    NOW() - INTERVAL '12 hours' as login_time,
    NOW() - INTERVAL '11 hours' as logout_time,
    INTERVAL '1 hour' as session_duration,
    '82.102.23.18' as ip_address,
    'Moscú' as city,
    'Rusia' as country,
    'Firefox' as browser,
    'Linux Ubuntu' as os,
    'Servidor' as device,
    'Cerrada' as status,
    true as is_suspicious,
    'Acceso fuera de horario laboral e IP extranjera no habitual' as suspicious_reason
FROM public.tenants LIMIT 3;

-- Seeding logs de actividades
INSERT INTO public.saas_audit_logs (tenant_id, user_email, user_name, module, functionality, action, created_at, ip_address, browser, result, old_values, new_values, execution_time_ms, justification)
SELECT 
    id as tenant_id, 
    'carlos.director@' || lower(replace(name, ' ', '')) || '.com' as user_email,
    'Carlos Director' as user_name,
    'Políticas' as module,
    'Gobernanza' as functionality,
    'Creación de Política' as action,
    NOW() - INTERVAL '2 hours' as created_at,
    '186.116.14.82' as ip_address,
    'Chrome/Windows' as browser,
    'Success' as result,
    '{}'::jsonb as old_values,
    '{"id": "pol-001", "title": "Política de Ética en IA y Modelado", "version": "1.0", "status": "Vigente"}'::jsonb as new_values,
    145 as execution_time_ms,
    'Creación inicial alineada a DAMA DMBoK' as justification
FROM public.tenants LIMIT 5;

-- Cambio Tracing (Before/After)
INSERT INTO public.saas_audit_logs (tenant_id, user_email, user_name, module, functionality, action, created_at, ip_address, browser, result, old_values, new_values, execution_time_ms, justification)
SELECT 
    id as tenant_id, 
    'ana.steward@' || lower(replace(name, ' ', '')) || '.com' as user_email,
    'Ana Garcia' as user_name,
    'Seguridad y Privacidad' as module,
    'Políticas de Modales' as functionality,
    'Modificación de Configuración de Modales' as action,
    NOW() - INTERVAL '40 minutes' as created_at,
    '190.143.2.11' as ip_address,
    'Safari/macOS' as browser,
    'Success' as result,
    '{"bg": "#ffffff", "borderRadius": "12px", "btnPrimaryBg": "#4f46e5"}'::jsonb as old_values,
    '{"bg": "#1e293b", "borderRadius": "24px", "btnPrimaryBg": "#a855f7"}'::jsonb as new_values,
    88 as execution_time_ms,
    'Actualización de paleta corporativa y aumento de redondeado a 24px' as justification
FROM public.tenants LIMIT 5;

-- Eliminación masiva sospechosa
INSERT INTO public.saas_audit_logs (tenant_id, user_email, user_name, module, functionality, action, created_at, ip_address, browser, result, old_values, new_values, execution_time_ms, justification)
SELECT 
    id as tenant_id, 
    'hacker.invader@external.com' as user_email,
    'Invasor Anónimo' as user_name,
    'Calidad de Datos' as module,
    'Reglas Operativas' as functionality,
    'Eliminación Masiva de Reglas' as action,
    NOW() - INTERVAL '10 minutes' as created_at,
    '45.239.12.180' as ip_address,
    'Unknown/Linux' as browser,
    'Success' as result,
    '{"rules_deleted_count": 142}'::jsonb as old_values,
    '{}'::jsonb as new_values,
    412 as execution_time_ms,
    'Limpieza rutinaria de logs de calidad desactualizados' as justification
FROM public.tenants LIMIT 1;

-- Seeding Alertas Automáticas
INSERT INTO public.saas_audit_alerts (tenant_id, alert_type, severity, description, details, status, created_at)
SELECT 
    id as tenant_id,
    'suspicious_geo' as alert_type,
    'high' as severity,
    'Acceso geodistribuido detectado para el usuario Luis Martinez desde Moscú, Rusia.' as description,
    '{"ip": "82.102.23.18", "country": "Rusia", "city": "Moscú", "time": "Acceso fuera de horario laboral"}'::jsonb as details,
    'Abierta' as status,
    NOW() - INTERVAL '12 hours' as created_at
FROM public.tenants LIMIT 3;

INSERT INTO public.saas_audit_alerts (tenant_id, alert_type, severity, description, details, status, created_at)
SELECT 
    id as tenant_id,
    'bulk_delete' as alert_type,
    'critical' as severity,
    'Se eliminaron 142 reglas de calidad de datos críticas en un solo comando.' as description,
    '{"user": "Invasor Anónimo", "module": "Calidad de Datos", "ip": "45.239.12.180"}'::jsonb as details,
    'Abierta' as status,
    NOW() - INTERVAL '10 minutes' as created_at
FROM public.tenants LIMIT 1;
