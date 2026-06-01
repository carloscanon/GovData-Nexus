-- ============================================================
-- SEGURIDAD Y RIESGOS — Tablas Supabase
-- ============================================================

-- 1. Registro de Riesgos
CREATE TABLE IF NOT EXISTS security_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  asset TEXT,
  severity TEXT DEFAULT 'Medio',
  impact TEXT DEFAULT 'Medio',
  probability TEXT DEFAULT 'Media',
  status TEXT DEFAULT 'Abierto',
  owner TEXT,
  action_plan TEXT,
  controls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Incidentes de Seguridad
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  code TEXT,
  type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'Medio',
  status TEXT DEFAULT 'Investigando',
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Controles de Cumplimiento
CREATE TABLE IF NOT EXISTS security_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  control_id TEXT,
  framework TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Parcial',
  last_evaluated DATE DEFAULT CURRENT_DATE,
  evidence TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Revisiones de Acceso (vinculado a tenant_users)
CREATE TABLE IF NOT EXISTS security_access_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  user_id UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
  user_name TEXT,
  role TEXT,
  asset TEXT,
  access_level TEXT DEFAULT 'Viewer',
  last_activity TEXT,
  risk_level TEXT DEFAULT 'Bajo',
  status TEXT DEFAULT 'Activo',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_security_risks_tenant ON security_risks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_tenant ON security_incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_controls_tenant ON security_controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_access_tenant ON security_access_reviews(tenant_id);
