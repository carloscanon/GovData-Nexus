-- GovData Nexus: Esquema Inicial de Base de Datos

-- 1. Catálogo de Activos de Datos
CREATE TABLE IF NOT EXISTS data_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Tabla SQL, API, Vista, etc.
    source TEXT NOT NULL, -- SAP, Salesforce, Oracle
    owner TEXT NOT NULL,
    sensitivity TEXT NOT NULL, -- Confidencial, Público, etc.
    quality_score INT DEFAULT 0,
    status TEXT DEFAULT 'Vigente',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Métricas de Calidad
CREATE TABLE IF NOT EXISTS quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension TEXT NOT NULL, -- Completitud, Exactitud, etc.
    score INT NOT NULL,
    status TEXT NOT NULL,
    system_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Riesgos de Seguridad
CREATE TABLE IF NOT EXISTS security_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    asset_affected TEXT,
    severity TEXT NOT NULL, -- Alto, Medio, Bajo
    status TEXT NOT NULL, -- Mitigando, Abierto, Cerrado
    discovery_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Workflows (Solicitudes)
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY, -- Ej: REQ-001
    title TEXT NOT NULL,
    requester TEXT NOT NULL,
    type TEXT NOT NULL, -- Acceso, Integración, etc.
    status TEXT NOT NULL, -- Pendiente, Aprobado, Rechazado
    priority TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar Datos Iniciales (Seed Data)
INSERT INTO data_assets (name, type, source, owner, sensitivity, quality_score, status)
VALUES 
('Maestro de Clientes', 'Tabla SQL', 'SAP ERP', 'Ventas', 'Confidencial', 94, 'Vigente'),
('Leads Marketing', 'API', 'Salesforce', 'Marketing', 'Público', 72, 'En Revisión'),
('Transacciones Q2', 'Vista', 'Oracle DB', 'Finanzas', 'Restringido', 88, 'Vigente')
ON CONFLICT DO NOTHING;

INSERT INTO quality_metrics (dimension, score, status)
VALUES 
('Completitud', 92, 'Saludable'),
('Exactitud', 88, 'Riesgo'),
('Consistencia', 95, 'Saludable')
ON CONFLICT DO NOTHING;
