-- =========================================================
-- AMPLIACIÓN DE FRAMEWORKS DINÁMICOS
-- =========================================================

-- 1. Agregar la columna framework
ALTER TABLE public.diagnostic_questions 
ADD COLUMN IF NOT EXISTS framework VARCHAR(100) DEFAULT 'DAMA';

-- Actualizar preguntas existentes a DAMA (por si acaso)
UPDATE public.diagnostic_questions 
SET framework = 'DAMA' 
WHERE framework IS NULL OR framework = '';

-- =========================================================
-- 2. INSERTAR PREGUNTAS SEMILLA PARA OTROS FRAMEWORKS
-- =========================================================

-- Las siguientes inserciones son de ejemplo para demostrar
-- la funcionalidad de distintos frameworks de gobierno.

INSERT INTO public.diagnostic_questions (framework, pillar, code, title, options) VALUES
-- EDM Council (DCAM)
('EDM Council (DCAM)', 'Data Management Strategy', 'edm_strat_01', '¿Existe un Business Case formalizado para la gestión de datos aprobado por ejecutivos?', '[{"text": "No iniciado", "score": 1}, {"text": "En desarrollo", "score": 3}, {"text": "Aprobado y fondeado", "score": 5}]'),
('EDM Council (DCAM)', 'Data Management Strategy', 'edm_strat_02', '¿Los requerimientos de negocio para el análisis de datos están priorizados?', '[{"text": "No iniciado", "score": 1}, {"text": "En desarrollo", "score": 3}, {"text": "Aprobado y fondeado", "score": 5}]'),
('EDM Council (DCAM)', 'Data Quality', 'edm_qual_01', '¿Se cuenta con reglas de calidad certificadas por los propietarios de datos empresariales?', '[{"text": "Inexistente", "score": 1}, {"text": "Implementación parcial", "score": 3}, {"text": "Operación continua", "score": 5}]'),
('EDM Council (DCAM)', 'Data Quality', 'edm_qual_02', '¿Existe control de cambios estricto sobre las reglas de calidad?', '[{"text": "Inexistente", "score": 1}, {"text": "Implementación parcial", "score": 3}, {"text": "Operación continua", "score": 5}]'),
('EDM Council (DCAM)', 'Data Architecture', 'edm_arch_01', '¿Existe un modelo de datos lógico empresarial estandarizado transversalmente?', '[{"text": "Inexistente", "score": 1}, {"text": "Aislado por área", "score": 3}, {"text": "Estandarizado", "score": 5}]'),

-- Gobierno Abierto
('Gobierno Abierto', 'Transparencia', 'gov_trans_01', '¿Existe un portal de datos abiertos actualizado automáticamente mediante APIs?', '[{"text": "Manual o inexistente", "score": 1}, {"text": "Parcialmente automatizado", "score": 3}, {"text": "100% automatizado", "score": 5}]'),
('Gobierno Abierto', 'Transparencia', 'gov_trans_02', '¿Los conjuntos de datos públicos cumplen con esquemas estandarizados interoperables?', '[{"text": "Formatos propietarios", "score": 1}, {"text": "Formatos semi-abiertos (CSV, XLS)", "score": 3}, {"text": "Estándares abiertos e interoperables (JSON/RDF)", "score": 5}]'),
('Gobierno Abierto', 'Participación Ciudadana', 'gov_part_01', '¿Existen canales digitales para que la ciudadanía sugiera nuevos conjuntos de datos?', '[{"text": "Sin canales", "score": 1}, {"text": "Canal informal (Email)", "score": 3}, {"text": "Plataforma formal con trazabilidad", "score": 5}]'),
('Gobierno Abierto', 'Rendición de Cuentas', 'gov_rend_01', '¿Se publica la trazabilidad de la inversión pública vinculada a los presupuestos?', '[{"text": "No se publica", "score": 1}, {"text": "Publicación agregada anual", "score": 3}, {"text": "Publicación granular y frecuente", "score": 5}]'),
('Gobierno Abierto', 'Privacidad', 'gov_priv_01', '¿Cuentan con un marco estricto de anonimización antes de liberar datos públicos?', '[{"text": "Sin marco", "score": 1}, {"text": "Procesos manuales ad-hoc", "score": 3}, {"text": "Anonimización por diseño certificada", "score": 5}]'),

-- Sector Salud
('Sector Salud', 'Interoperabilidad Clínica', 'hlth_int_01', '¿Utilizan estándares internacionales (HL7 FHIR) para el intercambio de datos clínicos?', '[{"text": "No se utiliza", "score": 1}, {"text": "HL7 v2 / C-CDA", "score": 3}, {"text": "FHIR nativo", "score": 5}]'),
('Sector Salud', 'Interoperabilidad Clínica', 'hlth_int_02', '¿Cuentan con un Índice Maestro de Pacientes (EMPI) único?', '[{"text": "Múltiples registros aislados", "score": 1}, {"text": "Procesos de conciliación manual", "score": 3}, {"text": "EMPI central y algorítmico", "score": 5}]'),
('Sector Salud', 'Seguridad y HIPAA', 'hlth_sec_01', '¿El acceso a Historias Clínicas Electrónicas está protegido por MFA y control basado en roles?', '[{"text": "Acceso genérico", "score": 1}, {"text": "RBAC básico", "score": 3}, {"text": "MFA y RBAC estricto con auditoría total", "score": 5}]'),
('Sector Salud', 'Calidad de Datos', 'hlth_qual_01', '¿La codificación CIE-10/SNOMED se valida automáticamente durante la captura?', '[{"text": "Sin validación / Texto libre", "score": 1}, {"text": "Validación post-captura", "score": 3}, {"text": "Validación semántica en tiempo real", "score": 5}]'),
('Sector Salud', 'Análisis Epidemiológico', 'hlth_ana_01', '¿Disponen de repositorios de datos integrados para vigilancia epidemiológica?', '[{"text": "Inexistente", "score": 1}, {"text": "Silos por patología", "score": 3}, {"text": "Data Lake epidemiológico integrado", "score": 5}]')

ON CONFLICT (code) DO UPDATE 
SET title = EXCLUDED.title, 
    options = EXCLUDED.options, 
    framework = EXCLUDED.framework;
