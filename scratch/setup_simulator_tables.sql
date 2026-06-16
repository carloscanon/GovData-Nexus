-- Inserts standard sessions if they do not exist
INSERT INTO simulator_modules (id, title, description, badge_name, icon, order_index) VALUES
('session_1', 'Sesión 1: Fundamentos', 'Diagnóstico DAMA, Roles y RACI.', 'Arquitecto de Gobierno', 'Briefcase', 1),
('session_2', 'Sesión 2: Framework', 'Políticas, Dominios y Clasificación.', 'Policy Maker', 'BookOpen', 2),
('session_3', 'Sesión 3: Calidad y Metadatos', 'Gestión de activos, diccionario y reglas.', 'Quality Champion', 'Database', 3),
('session_4', 'Sesión 4: Operación', 'Flujos de trabajo e incidentes.', 'CDO Master', 'Activity', 4)
ON CONFLICT (id) DO NOTHING;

-- Clear steps and re-insert them to ensure they match
DELETE FROM simulator_steps;

INSERT INTO simulator_steps (module_id, key_name, title, description, check_table, check_condition, min_count) VALUES
('session_1', 'dama', 'Diagnóstico DAMA Inicial', 'Realiza la evaluación de madurez DAMA.', 'maturity_assessments', '{}', 1),
('session_1', 'roles', 'Estructura del Equipo', 'Asigna Data Owner, Steward, Custodian y CDO.', 'team_members', '{"requires_roles": ["data owner", "data steward", "data custodian", "cdo"]}', 4),
('session_1', 'raci', 'Matriz RACI Operativa', 'Configura mínimo 5 procesos operativos en tu matriz RACI.', 'team_raci_matrix', '{}', 5);

INSERT INTO simulator_steps (module_id, key_name, title, description, check_table, check_condition, min_count) VALUES
('session_2', 'policies', 'Políticas de Datos', 'Crea al menos 2 políticas de gobierno de datos.', 'policies', '{}', 2),
('session_2', 'domains', 'Dominios Definidos', 'Crea al menos 1 dominio de datos estructurado en tu organización.', 'data_domains', '{}', 1);

INSERT INTO simulator_steps (module_id, key_name, title, description, check_table, check_condition, min_count) VALUES
('session_3', 'metadata', 'Diccionario de Datos', 'Documenta al menos 3 activos con linaje y clasificación de sensibilidad completa.', 'data_assets', '{"requires_fields": ["sensitivity", "source"]}', 3),
('session_3', 'quality', 'Reglas de Calidad', 'Configura al menos 2 reglas de calidad de datos en tus activos.', 'data_quality_rules', '{}', 2);

INSERT INTO simulator_steps (module_id, key_name, title, description, check_table, check_condition, min_count) VALUES
('session_4', 'workflows', 'Flujos de Trabajo', 'Genera un flujo de trabajo (workflow) y asegúrate de que sea Aprobado o Cerrado.', 'workflows', '{"status": ["Aprobado", "Cerrado", "Completado"]}', 1),
('session_4', 'security', 'Controles SCI', 'Registra al menos 1 control de seguridad normativo.', 'security_controls', '{}', 1);

-- Ensure RLS is disabled or configure policy to allow public select
ALTER TABLE simulator_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_user_progress DISABLE ROW LEVEL SECURITY;
