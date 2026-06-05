-- 1. Diccionario Semántico
CREATE TABLE IF NOT EXISTS public.semantic_dictionary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    synonyms TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Roadmap de Madurez
CREATE TABLE IF NOT EXISTS public.maturity_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    phase VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Hallazgos de Madurez
CREATE TABLE IF NOT EXISTS public.maturity_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    dimension VARCHAR(100) NOT NULL,
    finding TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Histórico de Monitoreo de Calidad
CREATE TABLE IF NOT EXISTS public.quality_monitoring_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    asset_name VARCHAR(255) NOT NULL,
    status VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Marcos Regulatorios de Seguridad
CREATE TABLE IF NOT EXISTS public.security_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.semantic_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturity_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturity_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_monitoring_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_frameworks ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
DROP POLICY IF EXISTS "Permitir todo a todos en semantic_dictionary" ON public.semantic_dictionary;
CREATE POLICY "Permitir todo a todos en semantic_dictionary" ON public.semantic_dictionary FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a todos en maturity_roadmaps" ON public.maturity_roadmaps;
CREATE POLICY "Permitir todo a todos en maturity_roadmaps" ON public.maturity_roadmaps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a todos en maturity_findings" ON public.maturity_findings;
CREATE POLICY "Permitir todo a todos en maturity_findings" ON public.maturity_findings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a todos en quality_monitoring_history" ON public.quality_monitoring_history;
CREATE POLICY "Permitir todo a todos en quality_monitoring_history" ON public.quality_monitoring_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a todos en security_frameworks" ON public.security_frameworks;
CREATE POLICY "Permitir todo a todos en security_frameworks" ON public.security_frameworks FOR ALL USING (true) WITH CHECK (true);

-- Seeding dinámico para los tenants existentes
INSERT INTO public.semantic_dictionary (tenant_id, term, synonyms)
SELECT id, 'cliente', ARRAY['cliente', 'persona', 'boleta', 'contacto', 'comprador', 'customer', 'compras', 'users', 'usuario', 'cuenta', 'socio', 'client', 'datos_personales', 'contact', 'buyer'] FROM public.tenants
ON CONFLICT DO NOTHING;

INSERT INTO public.semantic_dictionary (tenant_id, term, synonyms)
SELECT id, 'venta', ARRAY['venta', 'transaccion', 'boleta', 'ingreso', 'factura', 'pedido', 'order', 'sale', 'payment', 'pago', 'recaudación', 'boletas', 'invoice'] FROM public.tenants
ON CONFLICT DO NOTHING;

INSERT INTO public.semantic_dictionary (tenant_id, term, synonyms)
SELECT id, 'empleado', ARRAY['empleado', 'nomina', 'staff', 'recursos humanos', 'rrhh', 'worker', 'employee', 'contrato', 'colaborador', 'salario'] FROM public.tenants
ON CONFLICT DO NOTHING;

INSERT INTO public.semantic_dictionary (tenant_id, term, synonyms)
SELECT id, 'producto', ARRAY['producto', 'articulo', 'inventario', 'stock', 'item', 'product', 'catalogo', 'sku'] FROM public.tenants
ON CONFLICT DO NOTHING;

INSERT INTO public.semantic_dictionary (tenant_id, term, synonyms)
SELECT id, 'financiero', ARRAY['finanzas', 'contabilidad', 'impuesto', 'balance', 'ingreso', 'egreso', 'factura', 'caja', 'banco', 'accounting', 'tax', 'finance'] FROM public.tenants
ON CONFLICT DO NOTHING;

-- Seeding Maturity Roadmaps
INSERT INTO public.maturity_roadmaps (tenant_id, phase, title, description)
SELECT id, 'Mes 1', 'Fase: Cimentación', 'Asignar Stewards en Finanzas y Ventas. Automatizar reglas críticas de calidad.' FROM public.tenants
ON CONFLICT DO NOTHING;

INSERT INTO public.maturity_roadmaps (tenant_id, phase, title, description)
SELECT id, 'Mes 2', 'Fase: Operación', 'Configurar SLAs en Workflows. Integrar logs de auditoría automáticos.' FROM public.tenants
ON CONFLICT DO NOTHING;

INSERT INTO public.maturity_roadmaps (tenant_id, phase, title, description)
SELECT id, 'Mes 3', 'Fase: Optimización', 'Desplegar enmascaramiento dinámico. Activar portal de autoservicio.' FROM public.tenants
ON CONFLICT DO NOTHING;

-- Seeding Maturity Findings
INSERT INTO public.maturity_findings (tenant_id, dimension, finding, severity)
SELECT id, 'estrategia', 'Falta de automatización en el monitoreo de estrategia.', 'medium' FROM public.tenants UNION ALL
SELECT id, 'estrategia', 'Documentación de procesos desactualizada (última revisión hace 6 meses).', 'medium' FROM public.tenants UNION ALL
SELECT id, 'organizacion', 'Falta formalizar la asignación de Owners para activos críticos.', 'high' FROM public.tenants UNION ALL
SELECT id, 'organizacion', 'El comité de gobierno requiere sesiones periódicas mensuales.', 'medium' FROM public.tenants UNION ALL
SELECT id, 'calidad', 'Hay incidentes abiertos de severidad alta sin responsable.', 'high' FROM public.tenants UNION ALL
SELECT id, 'calidad', 'Reglas de calidad pendientes por expandir a bases de facturación.', 'medium' FROM public.tenants UNION ALL
SELECT id, 'arquitectura', 'Mapeo de linaje lógico incompleto en activos heredados.', 'medium' FROM public.tenants UNION ALL
SELECT id, 'seguridad', 'Campos confidenciales detectados sin máscara activa.', 'high' FROM public.tenants UNION ALL
SELECT id, 'compliance', 'Falta integrar logs automáticos para cumplir Habeas Data.', 'high' FROM public.tenants
ON CONFLICT DO NOTHING;

-- Seeding Quality Monitoring History
INSERT INTO public.quality_monitoring_history (tenant_id, date, asset_name, status, score)
SELECT id, NOW() - INTERVAL '3 days', 'Maestro de Clientes', 'Exitoso', 94 FROM public.tenants UNION ALL
SELECT id, NOW() - INTERVAL '4 days', 'Maestro de Clientes', 'Exitoso', 92 FROM public.tenants UNION ALL
SELECT id, NOW() - INTERVAL '5 days', 'Transacciones Q2', 'Exitoso', 88 FROM public.tenants
ON CONFLICT DO NOTHING;

-- Seeding Security Frameworks
INSERT INTO public.security_frameworks (tenant_id, name, code, status)
SELECT id, 'ISO 27001', 'ISO-27001', 'Activo' FROM public.tenants UNION ALL
SELECT id, 'Ley 1581 de 2012 (Habeas Data)', 'HABEAS-DATA', 'Activo' FROM public.tenants UNION ALL
SELECT id, 'Ley 1712 de 2014 (Transparencia)', 'TRANSPARENCIA', 'Activo' FROM public.tenants UNION ALL
SELECT id, 'GDPR', 'GDPR', 'Activo' FROM public.tenants UNION ALL
SELECT id, 'NIST Framework', 'NIST', 'Activo' FROM public.tenants
ON CONFLICT DO NOTHING;
