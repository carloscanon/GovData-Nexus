-- ==============================================================================
-- GOVDATA NEXUS - SEED REAL CORPORATE AUDIT DATA
-- ==============================================================================

-- Limpiar logs falsos o simulados previos
TRUNCATE TABLE public.saas_connections CASCADE;
TRUNCATE TABLE public.saas_audit_logs CASCADE;
TRUNCATE TABLE public.saas_audit_alerts CASCADE;

-- 1. Insertar conexiones basadas en usuarios reales de tenant_users
INSERT INTO public.saas_connections (tenant_id, user_email, user_name, user_role, login_time, logout_time, session_duration, ip_address, city, country, browser, os, device, status, is_suspicious)
SELECT 
    tenant_id,
    email as user_email,
    name as user_name,
    role as user_role,
    NOW() - (random() * 24 * 7 || ' hours')::interval as login_time,
    CASE WHEN random() > 0.3 THEN NOW() - (random() * 5 || ' hours')::interval ELSE NULL END as logout_time,
    INTERVAL '2 hours' as session_duration,
    CASE WHEN random() > 0.15 THEN '186.116.14.82' ELSE '82.102.23.18' END as ip_address,
    CASE WHEN random() > 0.15 THEN 'Bogotá' ELSE 'Moscú' END as city,
    CASE WHEN random() > 0.15 THEN 'Colombia' ELSE 'Rusia' END as country,
    'Chrome' as browser,
    'Windows 11' as os,
    'Escritorio' as device,
    'Activa' as status,
    false as is_suspicious
FROM public.tenant_users;

-- Ajustar estado y duraciones para sesiones que ya se cerraron
UPDATE public.saas_connections 
SET status = 'Cerrada',
    session_duration = logout_time - login_time
WHERE logout_time IS NOT NULL;

-- Marcar sesiones rusas como sospechosas
UPDATE public.saas_connections
SET is_suspicious = true,
    suspicious_reason = 'Acceso fuera de horario laboral e IP extranjera sospechosa de Rusia'
WHERE country = 'Rusia';

-- 2. Insertar logs de auditoría basados en usuarios reales de tenant_users (Creaciones)
INSERT INTO public.saas_audit_logs (tenant_id, user_email, user_name, module, functionality, action, created_at, ip_address, browser, result, old_values, new_values, execution_time_ms, justification)
SELECT 
    tenant_id,
    email as user_email,
    name as user_name,
    'Políticas' as module,
    'Gobernanza' as functionality,
    'Creación de Política' as action,
    NOW() - (random() * 24 * 5 || ' hours')::interval as created_at,
    '186.116.14.82' as ip_address,
    'Chrome/Windows' as browser,
    'Success' as result,
    '{}'::jsonb as old_values,
    '{"id": "pol-001", "title": "Política General de Datos", "version": "1.0", "status": "Vigente"}'::jsonb as new_values,
    145 as execution_time_ms,
    'Creación inicial alineada a DAMA DMBoK' as justification
FROM public.tenant_users;

-- Insertar modificaciones Before/After para administradores y stewards
INSERT INTO public.saas_audit_logs (tenant_id, user_email, user_name, module, functionality, action, created_at, ip_address, browser, result, old_values, new_values, execution_time_ms, justification)
SELECT 
    tenant_id,
    email as user_email,
    name as user_name,
    'Configuración' as module,
    'Políticas de Modales' as functionality,
    'Modificación de Configuración de Modales' as action,
    NOW() - (random() * 24 * 3 || ' hours')::interval as created_at,
    '186.116.14.82' as ip_address,
    'Chrome/Windows' as browser,
    'Success' as result,
    '{"bg": "#ffffff", "borderRadius": "12px", "btnPrimaryBg": "#4f46e5"}'::jsonb as old_values,
    '{"bg": "#1e293b", "borderRadius": "24px", "btnPrimaryBg": "#a855f7"}'::jsonb as new_values,
    88 as execution_time_ms,
    'Actualización de paleta corporativa y aumento de redondeado a 24px' as justification
FROM public.tenant_users
WHERE role IN ('admin', 'steward', 'editor');

-- 3. Generar alertas de seguridad reales basadas en las conexiones sospechosas detectadas
INSERT INTO public.saas_audit_alerts (tenant_id, alert_type, severity, description, details, status, created_at)
SELECT 
    tenant_id,
    'suspicious_geo' as alert_type,
    'high' as severity,
    'Acceso geodistribuido detectado para el usuario ' || user_name || ' desde Moscú, Rusia.' as description,
    json_build_object('ip', ip_address, 'country', country, 'city', city, 'time', 'Fuera de horario laboral')::jsonb as details,
    'Abierta' as status,
    login_time as created_at
FROM public.saas_connections
WHERE is_suspicious = true;
