-- =========================================================
-- BANCO DE PREGUNTAS: GDPR / LEY DE DATOS (PRIVACIDAD)
-- =========================================================

DELETE FROM public.diagnostic_questions WHERE framework = 'GDPR';

INSERT INTO public.diagnostic_questions (framework, pillar, code, title, options) VALUES
('GDPR', 'Consentimiento', 'gdpr_01', '¿Existe un mecanismo claro y explícito para la recolección del consentimiento de los usuarios antes de procesar sus datos?', '[{"text": "No", "score": 1}, {"text": "Parcial", "score": 3}, {"text": "Sí", "score": 5}]'),
('GDPR', 'Consentimiento', 'gdpr_02', '¿Los usuarios pueden revocar su consentimiento de manera tan fácil como lo otorgaron?', '[{"text": "No", "score": 1}, {"text": "En desarrollo", "score": 3}, {"text": "Completamente implementado", "score": 5}]'),
('GDPR', 'Consentimiento', 'gdpr_03', '¿Se mantiene un registro auditable de cuándo, cómo y qué consintió exactamente cada usuario?', '[{"text": "No", "score": 1}, {"text": "Solo de algunos canales", "score": 3}, {"text": "Sí, centralizado y auditable", "score": 5}]'),

('GDPR', 'Derechos ARCO/GDPR', 'gdpr_04', '¿Tienen un proceso automatizado o SLA definido para responder a solicitudes de acceso a la información (Right of Access)?', '[{"text": "No definido", "score": 1}, {"text": "Manual y ad-hoc", "score": 3}, {"text": "Automatizado (SLA < 30 días)", "score": 5}]'),
('GDPR', 'Derechos ARCO/GDPR', 'gdpr_05', '¿Existe capacidad técnica para realizar el "Derecho al Olvido" (borrado seguro) en todas las bases de datos y backups?', '[{"text": "Imposible actualmente", "score": 1}, {"text": "Solo en BBDD productivas", "score": 3}, {"text": "Sí, incluyendo backups", "score": 5}]'),
('GDPR', 'Derechos ARCO/GDPR', 'gdpr_06', '¿Está implementado el derecho a la portabilidad de datos permitiendo descargar la información en un formato estructurado (ej. JSON/CSV)?', '[{"text": "No", "score": 1}, {"text": "Formatos propietarios", "score": 3}, {"text": "Formatos abiertos y legibles", "score": 5}]'),

('GDPR', 'Privacidad desde el Diseño', 'gdpr_07', '¿Se realizan Evaluaciones de Impacto de Protección de Datos (DPIA) antes de lanzar nuevos productos o tecnologías?', '[{"text": "Nunca", "score": 1}, {"text": "Solo si lo pide legal", "score": 3}, {"text": "Obligatorio por proceso", "score": 5}]'),
('GDPR', 'Privacidad desde el Diseño', 'gdpr_08', '¿Se aplican técnicas de minimización de datos asegurando que solo se recolecta la información estrictamente necesaria?', '[{"text": "Recolectamos todo lo posible", "score": 1}, {"text": "Se revisa ocasionalmente", "score": 3}, {"text": "Estricto control de minimización", "score": 5}]'),
('GDPR', 'Privacidad desde el Diseño', 'gdpr_09', '¿Los datos personales en entornos de prueba (QA/Dev) están enmascarados o anonimizados sistemáticamente?', '[{"text": "Se usa data productiva real", "score": 1}, {"text": "Proceso manual", "score": 3}, {"text": "Anonimización automática", "score": 5}]'),

('GDPR', 'Seguridad y Brechas', 'gdpr_10', '¿Están cifrados los datos personales (PII) tanto en tránsito (TLS) como en reposo (AES-256)?', '[{"text": "Ninguno", "score": 1}, {"text": "Solo en tránsito", "score": 3}, {"text": "Tránsito y Reposo", "score": 5}]'),
('GDPR', 'Seguridad y Brechas', 'gdpr_11', '¿Existe un plan de respuesta a incidentes capaz de notificar a las autoridades competentes en menos de 72 horas tras una brecha de datos?', '[{"text": "No hay plan", "score": 1}, {"text": "Plan no testeado", "score": 3}, {"text": "Plan testeado y automatizado", "score": 5}]'),
('GDPR', 'Seguridad y Brechas', 'gdpr_12', '¿Se aplica control de acceso basado en roles (RBAC) y principio de menor privilegio para acceder a datos sensibles?', '[{"text": "Acceso generalizado", "score": 1}, {"text": "Roles básicos", "score": 3}, {"text": "RBAC estricto auditado", "score": 5}]'),

('GDPR', 'Gobernanza y DPO', 'gdpr_13', '¿La organización cuenta con un Delegado de Protección de Datos (DPO) o rol equivalente debidamente empoderado?', '[{"text": "No", "score": 1}, {"text": "Rol compartido sin poder", "score": 3}, {"text": "DPO formal y empoderado", "score": 5}]'),
('GDPR', 'Gobernanza y DPO', 'gdpr_14', '¿Se mantiene un Registro de Actividades de Tratamiento (RoPA) actualizado periódicamente?', '[{"text": "No existe", "score": 1}, {"text": "Documento desactualizado", "score": 3}, {"text": "Catálogo dinámico y mantenido", "score": 5}]'),

('GDPR', 'Transferencias y Terceros', 'gdpr_15', '¿Los contratos con proveedores (Encargados de Tratamiento) incluyen cláusulas estándar de protección de datos (SCC)?', '[{"text": "No se revisan contratos", "score": 1}, {"text": "Solo proveedores grandes", "score": 3}, {"text": "Obligatorio para todos", "score": 5}]'),
('GDPR', 'Transferencias y Terceros', 'gdpr_16', '¿Se mapean y auditan las transferencias internacionales de datos fuera de la región o país principal?', '[{"text": "No", "score": 1}, {"text": "Mapeo parcial", "score": 3}, {"text": "Auditoría completa", "score": 5}]');
