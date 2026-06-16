const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
  console.log("Inserting modules...");
  const modules = [
    { id: 'session_1', title: 'Sesión 1: Fundamentos', description: 'Diagnóstico DAMA, Roles y RACI.', badge_name: 'Arquitecto de Gobierno', icon: 'Briefcase', order_index: 1 },
    { id: 'session_2', title: 'Sesión 2: Framework (Políticas, Dominios, Seguridad y Riesgos)', description: 'Diseño de políticas corporativas, asignación de dominios de datos, análisis de riesgos y controles de seguridad.', badge_name: 'Policy & Risk Architect', icon: 'BookOpen', order_index: 2 },
    { id: 'session_3', title: 'Sesión 3: Calidad y Metadatos (Catálogo, Calidad e Inteligencia de Metadatos)', description: 'Configuración de catálogos y conexiones de datos, reglas e incidentes de calidad, glosario de términos y linaje.', badge_name: 'Data & Quality Specialist', icon: 'Database', order_index: 3 },
    { id: 'session_4', title: 'Sesión 4: Operación (Flujos, Incidentes y Madurez)', description: 'Gestión operativa de flujos de trabajo de datos, resolución de incidentes de calidad y seguridad, y evaluación del roadmap de madurez.', badge_name: 'CDO Master Coach', icon: 'Activity', order_index: 4 }
  ];

  for (const mod of modules) {
    const res = await supabase.from('simulator_modules').upsert(mod);
    if (res.error) {
      console.error(`Error inserting module ${mod.id}:`, res.error);
    } else {
      console.log(`Inserted/upserted module ${mod.id}`);
    }
  }

  console.log("\nDeleting existing steps...");
  const delRes = await supabase.from('simulator_steps').delete().neq('module_id', 'none');
  console.log("Deleted status:", delRes.error);

  console.log("\nInserting steps...");
  const steps = [
    // Session 1: Fundamentos (8 pasos)
    { module_id: 'session_1', key_name: 'dama', title: 'Diagnóstico DAMA Inicial', description: 'Realiza la evaluación de madurez DAMA inicial. Debe incluir puntuaciones reales y completas para las dimensiones clave de la organización.', check_table: 'maturity_assessments', check_condition: { requires_fields: ["dimension", "score", "answers"] }, min_count: 1 },
    { module_id: 'session_1', key_name: 'maturity_findings', title: 'Hallazgos de Madurez', description: 'Documenta al menos 3 hallazgos clave identificados durante tu diagnóstico de madurez corporativo.', check_table: 'maturity_findings', check_condition: { requires_fields: ["dimension", "finding", "severity"] }, min_count: 3 },
    { module_id: 'session_1', key_name: 'maturity_roadmaps', title: 'Plan de Ruta (Roadmap)', description: 'Diseña la ruta de madurez de gobierno a corto/mediano plazo configurando al menos 3 hitos o fases planificadas.', check_table: 'maturity_roadmaps', check_condition: { requires_fields: ["phase", "title", "description"] }, min_count: 3 },
    { module_id: 'session_1', key_name: 'roles', title: 'Estructura del Equipo', description: 'Crea los roles de gobierno y asigna responsables para Data Owner, Data Steward, Data Custodian y CDO con datos válidos (nombre, email, área).', check_table: 'team_members', check_condition: { requires_roles: ["data owner", "data steward", "data custodian", "cdo"], requires_fields: ["name", "email", "role", "area"] }, min_count: 4 },
    { module_id: 'session_1', key_name: 'domains', title: 'Dominios de Datos', description: 'Establece los dominios de datos clave para estructurar la propiedad de la información. Registra al menos 2 dominios personalizados.', check_table: 'team_domains', check_condition: { requires_fields: ["name"] }, min_count: 2 },
    { module_id: 'session_1', key_name: 'raci', title: 'Matriz RACI Operativa', description: 'Diseña la Matriz RACI para tu organización. Configura al menos 5 procesos operativos personalizados, asignando y guardando los niveles de responsabilidad.', check_table: 'team_raci_matrix', check_condition: { requires_fields: ["process", "owner_role", "steward_role", "custodian_role", "analyst_role"] }, min_count: 5 },
    { module_id: 'session_1', key_name: 'team_capacity', title: 'Capacidad y Madurez del Equipo', description: 'Registra al menos 1 evaluación de capacidad y madurez del equipo (operatividad, herramientas, capacitación) en la matriz correspondiente.', check_table: 'team_capacity_assessments', check_condition: { requires_fields: ["capacity_score", "maturity_score"] }, min_count: 1 },
    { module_id: 'session_1', key_name: 'gov_committees', title: 'Comité de Gobierno', description: 'Constituye al menos 1 Comité de Gobierno de Datos formal con nombre y descripción corporativa.', check_table: 'gov_committees', check_condition: { requires_fields: ["name"] }, min_count: 1 },

    // Session 2: Framework (9 pasos)
    { module_id: 'session_2', key_name: 'policies', title: 'Políticas de Gobierno', description: 'Crea al menos 3 políticas corporativas completas en el módulo de Políticas. Deben incluir versión, objetivos y alcance estructurado.', check_table: 'data_policies', check_condition: { requires_fields: ["title", "objective", "scope"] }, min_count: 3 },
    { module_id: 'session_2', key_name: 'policy_workflows', title: 'Flujos de Aprobación', description: 'Genera al menos 1 flujo de aprobación para gobernar las políticas en la organización.', check_table: 'policy_workflows', check_condition: { requires_fields: ["name", "steps"] }, min_count: 1 },
    { module_id: 'session_2', key_name: 'policy_standards', title: 'Estándares Técnicos', description: 'Registra al menos 1 estándar técnico (ej. nomenclatura o clasificación de datos).', check_table: 'policy_standards', check_condition: { requires_fields: ["code", "name", "category"] }, min_count: 1 },
    { module_id: 'session_2', key_name: 'policy_procedures', title: 'Procedimientos Operativos', description: 'Define al menos 1 guía o manual de procedimiento para la operación y ciclo de vida de los datos.', check_table: 'policy_procedures', check_condition: { requires_fields: ["code", "title", "content"] }, min_count: 1 },
    { module_id: 'session_2', key_name: 'policy_controls', title: 'Controles de Políticas', description: 'Asigna al menos 2 controles operativos vinculados a tus políticas de datos.', check_table: 'policy_controls', check_condition: { requires_fields: ["code", "description"] }, min_count: 2 },
    { module_id: 'session_2', key_name: 'policy_evidences', title: 'Evidencias de Cumplimiento', description: 'Carga al menos 1 evidencia de auditoría para validar el cumplimiento normativo de tus políticas.', check_table: 'policy_evidences', check_condition: { requires_fields: ["filename", "file_url"] }, min_count: 1 },
    { module_id: 'session_2', key_name: 'security_risks', title: 'Análisis de Riesgos', description: 'Identifica y documenta al menos 2 riesgos de seguridad de datos en el módulo de Seguridad y Riesgos. Deben incluir severidad, impacto, probabilidad, y plan de mitigación.', check_table: 'security_risks', check_condition: { requires_fields: ["name", "severity", "impact", "probability", "action_plan"] }, min_count: 2 },
    { module_id: 'session_2', key_name: 'security_controls', title: 'Controles y Cumplimiento', description: 'Implementa al menos 2 controles de cumplimiento normativo (ej. bajo frameworks como ISO 27001 o NIST) con estado de evaluación y evidencia asociada.', check_table: 'security_controls', check_condition: { requires_fields: ["name", "framework", "status", "evidence"] }, min_count: 2 },
    { module_id: 'session_2', key_name: 'security_reviews', title: 'Revisiones de Acceso', description: 'Asegura que se tengan al menos 2 revisiones de acceso de usuarios evaluadas con nivel de riesgo asignado.', check_table: 'security_access_reviews', check_condition: { requires_fields: ["user_name", "asset", "access_level", "risk_level"] }, min_count: 2 },

    // Session 3: Calidad y Metadatos (7 pasos)
    { module_id: 'session_3', key_name: 'data_connections', title: 'Conexiones de Catálogo', description: 'Registra al menos 2 orígenes o conexiones de datos en tu Catálogo.', check_table: 'data_connections', check_condition: { requires_fields: ["name", "type"] }, min_count: 2 },
    { module_id: 'session_3', key_name: 'data_assets', title: 'Activos de Datos', description: 'Importa y cataloga al menos 4 activos de datos estructurados en tu organización.', check_table: 'data_assets', check_condition: { requires_fields: ["name"] }, min_count: 4 },
    { module_id: 'session_3', key_name: 'quality_rules', title: 'Reglas de Calidad', description: 'Configura al menos 3 reglas de calidad activas asociadas a tus activos catalogados.', check_table: 'quality_rules', check_condition: { requires_fields: ["rule_name", "rule_type"] }, min_count: 3 },
    { module_id: 'session_3', key_name: 'quality_incidents', title: 'Incidentes de Calidad', description: 'Reporta al menos 2 incidentes de calidad de datos para darles seguimiento y resolución.', check_table: 'quality_incidents', check_condition: { requires_fields: ["issue_type", "severity"] }, min_count: 2 },
    { module_id: 'session_3', key_name: 'asset_fields', title: 'Diccionario y Linaje', description: 'Documenta al menos 4 campos con su respectivo tipo de dato, linaje y sensibilidad en el diccionario.', check_table: 'asset_fields', check_condition: { requires_fields: ["field_name", "data_type", "sensitivity"] }, min_count: 4 },
    { module_id: 'session_3', key_name: 'glossary_terms', title: 'Glosario de Términos', description: 'Define al menos 3 términos de negocio con su definición y dominio de gobierno.', check_table: 'glossary_terms', check_condition: { requires_fields: ["term", "definition", "domain"] }, min_count: 3 },
    { module_id: 'session_3', key_name: 'semantic_dictionary', title: 'Diccionario Semántico', description: 'Agrega al menos 2 términos de negocio con sinónimos personalizados en el diccionario de inteligencia semántica.', check_table: 'semantic_dictionary', check_condition: { requires_fields: ["term", "synonyms"] }, min_count: 2 },

    // Session 4: Operación (5 pasos)
    { module_id: 'session_4', key_name: 'workflows', title: 'Flujos de Trabajo', description: 'Genera al menos 2 flujos de trabajo (workflow requests) operativos y asegúrate de que sean Aprobados, Cerrados o Completados.', check_table: 'workflow_requests', check_condition: { status: ["Aprobado", "Cerrado", "Completado"] }, min_count: 2 },
    { module_id: 'session_4', key_name: 'quality_incidents_op', title: 'Gestión de Incidentes (Calidad)', description: 'Registra y realiza el seguimiento de al menos 2 incidentes de calidad de datos.', check_table: 'quality_incidents', check_condition: { requires_fields: ["issue_type", "severity"] }, min_count: 2 },
    { module_id: 'session_4', key_name: 'security_incidents_op', title: 'Gestión de Incidentes (Seguridad)', description: 'Registra y realiza el seguimiento de al menos 2 incidentes de seguridad de la información en tu entorno.', check_table: 'security_incidents', check_condition: { requires_fields: ["title", "severity"] }, min_count: 2 },
    { module_id: 'session_4', key_name: 'security_frameworks', title: 'Marcos Regulatorios', description: 'Registra al menos 3 marcos regulatorios activos (ej. ISO 27001, GDPR o Habeas Data) aplicables a tu organización.', check_table: 'security_frameworks', check_condition: { requires_fields: ["name", "code", "status"] }, min_count: 3 },
    { module_id: 'session_4', key_name: 'quality_monitoring_history', title: 'Monitoreo Histórico', description: 'Genera al menos 2 registros en el historial de monitoreo de calidad para analizar el comportamiento histórico de tus activos.', check_table: 'quality_monitoring_history', check_condition: { requires_fields: ["asset_name", "score", "status"] }, min_count: 2 },
  ];

  const insRes = await supabase.from('simulator_steps').insert(steps);
  if (insRes.error) {
    console.error("Error inserting steps:", insRes.error);
  } else {
    console.log("Steps inserted successfully!");
  }
}

main();
