-- =========================================================
-- CREACIÓN DE TABLA DEL BANCO DE PREGUNTAS DIAGNÓSTICAS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.diagnostic_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID, -- Si es NULL, aplica como plantilla global para todos
    pillar VARCHAR(100) NOT NULL, -- Área de Conocimiento DAMA
    code VARCHAR(50) UNIQUE, -- Identificador de la pregunta
    title TEXT NOT NULL,
    options JSONB NOT NULL, -- [{ "text": "...", "score": X }]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.diagnostic_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura global o del tenant" 
ON public.diagnostic_questions FOR SELECT 
USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY "Permitir todo a todos temporalmente" 
ON public.diagnostic_questions FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- POBLAR PREGUNTAS ALINEADAS CON DAMA DMBOK (Plantilla Global)
-- =========================================================

-- Limpiar tabla en caso de rerunning
DELETE FROM public.diagnostic_questions WHERE tenant_id IS NULL;

INSERT INTO public.diagnostic_questions (pillar, code, title, options) VALUES
-- 1. Data Governance
('Data Governance', 'dama_gov_1', '¿Existe un Comité de Gobierno de Datos formalizado y sesionando?', 
'[{"text": "No existe.", "score": 1}, {"text": "Está en diseño o se reúne informalmente.", "score": 3}, {"text": "Sí, formalizado y toma decisiones activamente.", "score": 5}]'),

('Data Governance', 'dama_gov_2', '¿El CDO (Chief Data Officer) o Líder de Datos reporta a nivel ejecutivo (C-Level)?', 
'[{"text": "No existe el rol.", "score": 1}, {"text": "Reporta a mandos medios o dentro de TI.", "score": 3}, {"text": "Reporta directamente a la Alta Dirección.", "score": 5}]'),

('Data Governance', 'dama_gov_3', '¿Tienen identificados y formalizados los roles de Data Owner y Data Steward en las áreas de negocio?', 
'[{"text": "No existen.", "score": 1}, {"text": "Roles asignados informalmente.", "score": 3}, {"text": "Asignados formalmente y evaluados en su desempeño.", "score": 5}]'),

-- 2. Data Architecture
('Data Architecture', 'dama_arc_1', '¿Cuentan con un diseño arquitectónico corporativo que garantice el flujo eficiente de datos (Data Mesh, Fabric, etc.)?', 
'[{"text": "Silos de información desconectados.", "score": 1}, {"text": "Iniciativas en progreso pero sin estándar corporativo.", "score": 3}, {"text": "Arquitectura moderna y gobernada empresarialmente.", "score": 5}]'),

-- 3. Data Modeling & Design
('Data Modeling & Design', 'dama_mod_1', '¿Existe un modelo de datos lógico y conceptual aprobado por negocio antes de crear bases de datos físicas?', 
'[{"text": "Se crean tablas en producción al vuelo.", "score": 1}, {"text": "Se documentan modelos ocasionalmente.", "score": 3}, {"text": "Modelado estricto, gobernado y gestionado por Data Architects.", "score": 5}]'),

-- 4. Data Storage & Operations
('Data Storage & Operations', 'dama_ops_1', '¿Tienen definidos y probados planes de continuidad de negocio y recuperación (Disaster Recovery) para los datos críticos?', 
'[{"text": "No hay plan, o rara vez se prueba.", "score": 1}, {"text": "Copias de seguridad regulares, pero recuperación lenta.", "score": 3}, {"text": "Planes testeados frecuentemente con SLAs de recuperación (RTO/RPO) cumplidos.", "score": 5}]'),

-- 5. Data Security
('Data Security', 'dama_sec_1', '¿El acceso a datos confidenciales está gestionado por el principio de Menor Privilegio (RBAC/ABAC)?', 
'[{"text": "Los accesos son amplios y no regulados.", "score": 1}, {"text": "Controles de acceso por rol, a veces permisivos.", "score": 3}, {"text": "Estricto control de privilegios, enmascaramiento dinámico y auditoría.", "score": 5}]'),

('Data Security', 'dama_sec_2', '¿Se cuenta con un inventario actualizado de dónde residen los datos sensibles o PII?', 
'[{"text": "No sabemos dónde está la información sensible.", "score": 1}, {"text": "Listado estático gestionado manualmente.", "score": 3}, {"text": "Inventario vivo, escaneado y etiquetado automáticamente.", "score": 5}]'),

-- 6. Data Integration & Interoperability
('Data Integration', 'dama_int_1', '¿Las integraciones de datos corporativas están estandarizadas?', 
'[{"text": "Cientos de integraciones punto a punto frágiles.", "score": 1}, {"text": "Principalmente procesos ETL masivos (batch) nocturnos.", "score": 3}, {"text": "Uso de APIs, eventos en tiempo real y pipelines orquestados.", "score": 5}]'),

-- 7. Document & Content Management
('Document & Content Management', 'dama_doc_1', '¿Existe una taxonomía corporativa oficial para clasificar documentos y contenido no estructurado?', 
'[{"text": "Archivos compartidos desorganizados.", "score": 1}, {"text": "Algunas áreas tienen sus propias carpetas y reglas.", "score": 3}, {"text": "Taxonomía oficial adoptada transversalmente.", "score": 5}]'),

-- 8. Reference & Master Data (MDM)
('Reference & Master Data', 'dama_mdm_1', '¿Existe gestión centralizada del Golden Record de Datos Maestros (Ej: Clientes únicos, Productos)?', 
'[{"text": "Múltiples versiones contradictorias.", "score": 1}, {"text": "Esfuerzos aislados de consolidación manual.", "score": 3}, {"text": "Plataforma MDM operando con sincronización a sistemas fuente.", "score": 5}]'),

-- 9. Data Warehousing & Business Intelligence
('Data Warehousing & BI', 'dama_bi_1', '¿Disponen de un entorno analítico unificado para reportería confiable y analítica predictiva?', 
'[{"text": "Reportes extraídos en Excel directamente de transaccionales.", "score": 1}, {"text": "Data Warehouse básico, pero con múltiples silos de BI.", "score": 3}, {"text": "Plataforma Lakehouse o DWH moderno que empodera el Self-Service BI seguro.", "score": 5}]'),

-- 10. Metadata Management
('Metadata Management', 'dama_meta_1', '¿Tienen implementado un Catálogo de Datos corporativo automatizado?', 
'[{"text": "No hay catálogo de datos.", "score": 1}, {"text": "Inventario manual en Excel.", "score": 3}, {"text": "Catálogo dinámico automatizado y consultado regularmente.", "score": 5}]'),

('Metadata Management', 'dama_meta_2', '¿Cuentan con un Glosario de Negocio formal y Linaje de Datos técnico documentado?', 
'[{"text": "Nadie sabe qué significa cada dato.", "score": 1}, {"text": "Glosario aislado sin conexión a los sistemas.", "score": 3}, {"text": "Glosario conectado al diccionario técnico mostrando linaje (End-to-End).", "score": 5}]'),

-- 11. Data Quality
('Data Quality', 'dama_qual_1', '¿Miden continuamente las dimensiones de calidad de los Elementos de Datos Críticos (CDEs)?', 
'[{"text": "No se mide la calidad.", "score": 1}, {"text": "Validaciones manuales o queries esporádicos.", "score": 3}, {"text": "Monitoreo automatizado con reglas en tiempo real.", "score": 5}]'),

('Data Quality', 'dama_qual_2', '¿Existe un proceso formal para remediar incidentes de calidad desde el sistema de origen?', 
'[{"text": "Los errores se parchean en los reportes finales.", "score": 1}, {"text": "TI hace limpiezas masivas periódicamente.", "score": 3}, {"text": "Remediación en la fuente (Root-cause) gestionada mediante mesa de tickets (Workflows).", "score": 5}]');
