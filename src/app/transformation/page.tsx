'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  TrendingUp, 
  RefreshCw, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Database, 
  Layers, 
  CheckCircle2, 
  Target,
  Building2,
  BookOpen
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './transformation.module.css';

const SECTORS = [
  {
    id: 'financiero',
    name: 'Sector Financiero',
    companyName: 'Nexus Bank S.A.',
    desc: 'Bancos, Fintechs y Cooperativas reguladas con alta exigencia en cumplimiento y seguridad de datos.',
    industryContext: 'La banca comercial gestiona flujos transaccionales críticos. Cualquier inconsistencia de datos tiene consecuencias financieras inmediatas, multas regulatorias y pérdida de confianza de los ahorradores.',
    companyContext: 'Nexus Bank S.A. se encuentra migrando su core bancario hacia una arquitectura cloud. Tienen discrepancias de saldos entre los sistemas legacy locales y el nuevo Data Lake en Snowflake, lo que retrasa los cierres contables mensuales hasta por 5 días hábiles. El diagnóstico DAMA inicial de 100 preguntas reveals que la organización opera en Nivel 1 (Inicial) y de forma reactiva: no existe un glosario de términos unificado y cada área define las variables a su manera. Para alinearse con las mejores prácticas DAMA, el participante debe rechazar los scripts manuales de TI o parches de fin de mes, e institucionalizar un Glosario Técnico centralizado y comités formalizados.',
    regulations: [
      'Circular Básica Jurídica de la SuperFinanciera (Circular 007/2018 - Riesgo Operativo)',
      'Estándar Internacional de Seguridad para Tarjetas de Pago (PCI-DSS)',
      'Ley 1581 de Protección de Datos Personales (Habeas Data Financiero)',
      'Estándar de Reportes Financieros Internacionales IFRS-9 / Basilea III',
      'Regulaciones Anti-Lavado de Activos y Financiación del Terrorismo (SARLAFT)'
    ],
    actionPlan: [
      'Realizar un diagnóstico DAMA de madurez base para justificar presupuesto de gobierno.',
      'Definir responsabilidades del equipo y matriz RACI para conciliación contable.',
      'Configurar el diccionario técnico y linaje del core financiero en el Catálogo.',
      'Desplegar reglas de calidad automáticas para validar descuadres mayores al 0.01%.',
      'Registrar los incidentes críticos de descuadre y trazar la mitigación en la mesa de ayuda.',
      'Establecer controles obligatorios de cifrado y auditoría de accesos PII ante PCI-DSS.',
      'Aprobar formalmente la política de privacidad mediante flujos de workflows del comité.'
    ],
    problems: [
      'Discrepancia en saldos de cuentas de clientes entre sistemas transaccionales y contables.',
      'Falta de trazabilidad en los linajes de datos para reportes de cumplimiento de entes de control.',
      'Fugas potenciales de información de tarjetas de crédito y datos personales PII.',
      'Altos tiempos de conciliación bancaria debido a la fragmentación de catálogos.',
      'Reportes regulatorios IFRS/SARLAFT demorados y con errores manuales recurrentes.',
      'Riesgos de sanciones por incumplimiento de logs de auditoría ante la Superintendencia.'
    ],
    capabilities: [
      'Glosario unificado de términos financieros (CIF, saldos, carteras).',
      'Políticas de privacidad y enmascaramiento de datos críticos en entornos no productivos.',
      'Linaje técnico e histórico de datos automatizado para la auditoría de riesgos.',
      'Reglas de calidad continuas sobre depósitos y transacciones.',
      'Políticas de retención y purga automática de logs de transacciones históricas.',
      'Monitoreo automatizado de alertas de seguridad y accesos anómalos.'
    ],
    outcomes: [
      'Cumplimiento del 100% de los requerimientos de la Superintendencia Financiera.',
      'Reducción del 45% en tiempos de conciliación de reportes mensuales.',
      'Cero incidentes de filtración de datos financieros o multas por privacidad.',
      '100% de reportes IFRS-9 y SARLAFT emitidos a tiempo y sin inconsistencias.',
      'Cero hallazgos graves en auditorías externas de seguridad e integridad.'
    ]
  },
  {
    id: 'salud',
    name: 'Sector Salud',
    companyName: 'Clínica Santa Cruz',
    desc: 'Clínicas, Hospitales y Aseguradoras que manejan datos sensibles de pacientes y regulaciones de privacidad.',
    industryContext: 'Las organizaciones prestadoras de salud gestionan historias clínicas electrónicas y consentimientos informados. La calidad y veracidad del dato clínico impacta de forma directa sobre la vida de los pacientes.',
    companyContext: 'La Clínica Santa Cruz integró recientemente 3 centros médicos afiliados en su red. Al no estar homologados sus sistemas, el 12% de los pacientes tienen historias clínicas duplicadas con diagnósticos cruzados y alergias omitidas en admisiones. El diagnóstico de 100 preguntas DAMA señala un estado caótico de Datos Maestros (Nivel 1): no existe la figura de Data Steward para definir reglas de validación de identidad en la captura de admisiones. El participante debe descartar la verificación manual en consulta o la compra de bases de datos externas sin gobernar, y priorizar la asignación de Stewards de negocio con reglas automatizadas de integridad única.',
    regulations: [
      'Ley de Protección de Datos Sensibles de Salud (Habeas Data Médico - Ley 1581)',
      'Estándar Internacional de Interoperabilidad HL7/FHIR para intercambio clínico',
      'Directivas de Privacidad de la Información del Paciente (HIPAA / Ley de Ética Médica)',
      'Estándares de Acreditación de Calidad en Salud (Ministerio de Salud)',
      'Estándar SNOMED-CT para codificación de diagnósticos médicos e interoperabilidad'
    ],
    actionPlan: [
      'Mapear y validar la matriz RACI de acceso a historias clínicas por rol médico.',
      'Catalogar los activos de información hospitalarios definiendo campos PII y sensibles.',
      'Registrar e investigar incidentes de calidad sobre alergias omitidas en el ERP.',
      'Establecer flujos de aprobación (workflows) para cambios en datos sensibles de pacientes.',
      'Realizar el perfilamiento de calidad en el ingreso de admisiones médicas.',
      'Documentar las políticas de retención histórica de expedientes clínicos.',
      'Auditar logs de acceso a historias clínicas mediante alertas de ciberseguridad.'
    ],
    problems: [
      'Historias clínicas duplicadas de pacientes debido a falta de un identificador global único.',
      'Uso indebido o no autorizado de datos de pacientes PII.',
      'Inconsistencia en los diagnósticos médicos al consolidar datos para epidemiología.',
      'Falta de control sobre el consentimiento informado para el tratamiento de datos.',
      'Dificultades de interoperabilidad entre clínicas asociadas bajo el estándar HL7/FHIR.',
      'Falta de auditoría forense ante accesos no autorizados a datos de pacientes.'
    ],
    capabilities: [
      'Catálogo centralizado de datos clínicos y datos demográficos del paciente.',
      'Matriz RACI estricta de accesos a historias clínicas por rol médico.',
      'Monitoreo continuo de calidad de datos en admisiones y urgencias.',
      'Políticas de cifrado de extremo a extremo de datos de salud.',
      'Anonimización y seudonimización de datos clínicos para investigación epidemiológica.',
      'Flujo automatizado de reporte de brechas de seguridad física y lógica.'
    ],
    outcomes: [
      'Reducción del 95% en la duplicidad de historias clínicas en admisiones.',
      'Protección garantizada de los derechos del paciente (cumplimiento Ley Habeas Data / HIPAA).',
      'Disponibilidad del 100% de datos confiables para análisis de efectividad clínica.',
      'Homologación del 100% de diagnósticos bajo el estándar SNOMED-CT.',
      'Reducción del 80% en reclamos de pacientes por errores en expedientes médicos.'
    ]
  },
  {
    id: 'gobierno',
    name: 'Sector Gobierno',
    companyName: 'Agencia Nacional de Catastro',
    desc: 'Entidades públicas nacionales y municipales orientadas a la transparencia, datos abiertos e interoperabilidad.',
    industryContext: 'Las agencias del estado deben garantizar la interoperabilidad de trámites de cara al ciudadano y habilitar datos abiertos confiables para combatir la opacidad institucional.',
    companyContext: 'La Agencia Nacional de Catastro y Tierras gestiona los títulos de propiedad del país. Tienen discrepancias catastrales de predios duplicados en un 8%, lo que retrasa los trámites de titulación y genera inconsistencias al exportar metadatos a Datos Abiertos. El diagnóstico DAMA califica la transparencia en Nivel 1: se publican datos abiertos crudos en archivos planos exponiendo datos sensibles PII, violando la Ley 1581 y el Marco Nacional de Interoperabilidad. El participante debe rechazar la publicación cruda o la suspensión de trámites por falta de software, y priorizar el enmascaramiento dinámico de metadatos públicos catalogados y comités de arbitraje predial.',
    regulations: [
      'Marco Nacional de Interoperabilidad de Gobierno Digital (X-Road / MinTIC)',
      'Ley de Transparencia y del Derecho de Acceso a la Información Pública (Ley 1712)',
      'Directiva de Clasificación y Catalogación de Activos de Información Pública',
      'Directiva de Datos Abiertos de MinTIC (Guía Nacional de Metadatos)',
      'Marco de Ciberseguridad del Estado (Modelo de Seguridad de la Información MGD)'
    ],
    actionPlan: [
      'Constituir formalmente el Comité de Gobierno de Datos para resolver límites prediales.',
      'Catalogar los orígenes de datos catastrales e inventariar sus activos.',
      'Fijar reglas de calidad de completitud para validar el registro único de predios.',
      'Generar los entregables y evidencias auditables de cumplimiento de Gobierno Digital.',
      'Anonimizar y enmascarar datos personales de ciudadanos antes de publicarlos en portales abiertos.',
      'Mapear el linaje de datos catastrales interconectados por X-Road.',
      'Resolver formalmente solicitudes de acceso a la información pública por ley de transparencia.'
    ],
    problems: [
      'Silos de información entre distintas entidades y ministerios que impiden trámites eficientes.',
      'Bajo nivel de confianza de los ciudadanos en los datos publicados en portales de datos abiertos.',
      'Ausencia de dueños responsables de la calidad de datos de registros ciudadanos.',
      'Riesgos de suplantación de identidad debido a fallas en la integridad referencial.',
      'Vulneración de Habeas Data por publicación errónea de datos privados en portales del estado.',
      'Demoras en trámites interinstitucionales por falta de interoperabilidad y linaje.'
    ],
    capabilities: [
      'Establecimiento formal de Comités e Institucionalidad del Gobierno de Datos.',
      'Políticas de interoperabilidad y datos abiertos estandarizadas.',
      'Catálogo de Activos de Información alineado con marcos nacionales de gobierno.',
      'Auditoría y alertas ante modificaciones no autorizadas en registros de identidad.',
      'Flujos de aprobación del comité de gobierno para liberar datasets de datos abiertos.',
      'Reglas de calidad automatizadas para validación geográfica y predial.'
    ],
    outcomes: [
      'Trámites de ciudadanos unificados e interoperables (Reducción de tiempos en un 60%).',
      'Cumplimiento del marco nacional de Gobierno Digital.',
      'Transparencia y fiabilidad del 100% en portales de datos abiertos.',
      'Calificación superior en el índice de Gobierno Digital de MinTIC.',
      'Cero incidentes por violación de privacidad de Habeas Data de ciudadanos.'
    ]
  },
  {
    id: 'retail',
    name: 'Sector Retail & E-commerce',
    companyName: 'Makro Tiendas Omnicanal',
    desc: 'Comercio minorista y plataformas online enfocadas en omnicanalidad, segmentación y logística.',
    industryContext: 'Las cadenas de comercio masivo requieren una visión 360° del cliente y consistencia extrema en inventario para operar de forma ágil y evitar pérdidas de ventas por stock erróneo.',
    companyContext: 'Makro Tiendas Omnicanal reporta inconsistencias del 15% de inventario entre la web y el ERP físico de tiendas. Adicionalmente, sus campañas de marketing fallan porque su base CRM tiene un 22% de clientes duplicados por correos vacíos. El diagnóstico DAMA muestra que la organización carece de gobernanza de dominios (Nivel 1): no hay Data Owners responsables y Marketing realiza campañas sin validar el consentimiento (Opt-in). El participante debe evitar culpar a los desarrolladores de la web o depurar manualmente los fines de semana en Excel, y priorizar la asignación de dueños de dominio e incidentes formales de validación en la captura.',
    regulations: [
      'Leyes de Protección al Consumidor y Garantía de Inventario (E-commerce)',
      'Políticas de Privacidad y Tratamiento de Datos Personales para Campañas Comerciales',
      'Normativa DIAN para Factura Electrónica y reporte de trazabilidad fiscal',
      'Estatuto del Consumidor (Ley 1480 - Publicidad engañosa y disponibilidad)',
      'Regulación de cookies y consentimiento de tratamiento comercial de datos'
    ],
    actionPlan: [
      'Establecer el dueño (Data Owner) del dominio de "Clientes" y "Productos" en el equipo.',
      'Definir reglas de calidad de completitud y formato sobre correos y teléfonos de clientes.',
      'Catalogar e integrar las conexiones de inventario físico y del comercio electrónico.',
      'Registrar incidentes de calidad automáticos ante descuadres de stock en el canal digital.',
      'Configurar el consentimiento explícito (Opt-in) del cliente en el catálogo de privacidad.',
      'Auditar la consistencia del catálogo de productos y SKUs duplicados.',
      'Implementar políticas de minimización de datos en el registro web de clientes.'
    ],
    problems: [
      'Inconsistencia en el inventario entre tiendas físicas y canales de comercio electrónico.',
      'Campañas de marketing ineficaces debido a correos y teléfonos duplicados en la base de clientes.',
      'Falta de gobernanza en la categorización de productos (SKUs duplicados).',
      'Tiempos de respuesta lentos en soporte al cliente por falta de una visión 360°.',
      'Sanciones potenciales de la SIC por publicidad no solicitada (Spam) a clientes.',
      'Inconsistencias en el reporte contable e impositivo de facturación electrónica.'
    ],
    capabilities: [
      'Gobierno del dominio de "Clientes & CRM" y dominio de "Productos".',
      'Reglas de calidad automatizadas sobre correos electrónicos y teléfonos.',
      'Glosario unificado para conceptos de omnicanalidad.',
      'Flujos de aprobación (workflows) integrados para creación de nuevos productos.',
      'Políticas de retención y descarte seguro de datos de tarjetas de crédito.',
      'Validación automática en tiempo real de transacciones de e-commerce.'
    ],
    outcomes: [
      'Incremento del 15% en efectividad de campañas de marketing.',
      'Reducción del 30% en quejas de clientes por retrasos de inventario.',
      'Consolidación de una única verdad sobre el catálogo de productos.',
      'Cumplimiento del 100% de la normativa DIAN de facturación electrónica.',
      'Reducción del 50% en el spam comercial mediante gestión unificada del consentimiento.'
    ]
  },
  {
    id: 'telecomunicaciones',
    name: 'Telecomunicaciones',
    companyName: 'NexTel Comunicaciones S.A.',
    desc: 'Operadores de telefonía e internet móvil enfocados en la calidad de red, fraudes y churn de clientes.',
    industryContext: 'Las empresas de telecomunicaciones gestionan petabytes de registros de llamadas (CDRs) y datos de red. Requieren gobernar estos logs para facturar correctamente y mitigar riesgos de fraude telefónico.',
    companyContext: 'NexTel sufre de fugas de ingresos del 4% en facturación por la falta de conciliación de CDRs en tiempo real. Adicionalmente, detectaron incidentes recurrentes de clonación de SIM cards debido a accesos no supervisados en la DB de red. El diagnóstico DAMA de 100 preguntas alerta sobre la ausencia de metadatos técnicos y auditoría (Nivel 1): TI realiza cambios directos en producción sin flujos de aprobación ni monitoreo automático de calidad. El participante debe registrar la matriz RACI, incidentes de calidad y mitigar incidentes de seguridad mediante flujos de aprobación.',
    regulations: [
      'Regulaciones de la CRC (Comisión de Regulación de Comunicaciones) sobre calidad de servicio',
      'Ley de Retención de Datos de Conexión y Cooperación con Autoridades Judiciales',
      'Directivas de Privacidad en Redes e Interceptación de Comunicaciones',
      'Reglamentación de Protección de Usuarios de Servicios de Comunicaciones (RPU)',
      'Resoluciones del Ministerio TIC sobre el espectro y protección al consumidor'
    ],
    actionPlan: [
      'Documentar el diccionario de datos técnicos de las celdas de telefonía y redes.',
      'Registrar los riesgos de seguridad y accesos masivos a las bases de CDR transaccionales.',
      'Establecer políticas de retención y auditoría de eventos de tráfico en tiempo real.',
      'Mitigar incidentes de seguridad de red asociándolos a controles en la plataforma.',
      'Desplegar flujos de aprobación (workflows) para autorizar cambios en la base de datos de SIM cards.',
      'Monitorear e investigar incidentes de calidad de red por deserción (churn).',
      'Configurar reglas de enmascaramiento dinámico sobre el tráfico y logs de navegación.'
    ],
    problems: [
      'Altas tasas de deserción (churn) por no entender los patrones de comportamiento del cliente en tiempo real.',
      'Errores frecuentes en la facturación de servicios y consumo de datos móviles.',
      'Riesgos de fraude telefónico o clonación de cuentas sin detección temprana.',
      'Ausencia de metadatos técnicos y funcionales de la red.',
      'Fugas de ingresos por fallos de reconciliación entre CDRs de ingeniería y facturación contable.',
      'Reclamos de usuarios ante la CRC por facturación inexacta.'
    ],
    capabilities: [
      'Políticas de seguridad y auditoría de eventos de tráfico en tiempo real.',
      'Glosario de métricas de red y negocio (Churn, ARPU, CDR).',
      'Flujos automatizados para la asignación y revocación de privilegios de acceso.',
      'Calidad de datos integrada al lago de datos de tarificación.',
      'Matriz de linaje de datos de facturación móvil de extremo a extremo.',
      'Comité de arbitraje de red para conciliar fallos e incidentes.'
    ],
    outcomes: [
      'Disminución del 20% en reclamos por facturación.',
      'Detección y mitigación del 99% de los patrones de fraude detectados en auditorías.',
      'Metadatos de red documentados y accesibles para ingeniería.',
      'Reducción del 35% en multas regulatorias de la CRC y entes de control.',
      'Cero brechas de seguridad por clonación de SIM cards en bases de datos de red.'
    ]
  },
  {
    id: 'educacion',
    name: 'Sector Educación',
    companyName: 'Universidad Metropolitana de Tecnología (UMT)',
    desc: 'Universidades y Colegios enfocados en la deserción estudiantil, acreditaciones e integridad académica.',
    industryContext: 'Las universidades deben certificar el historial académico de los graduados y garantizar la integridad de las notas frente a modificaciones fraudulentas, además de reportar estadísticas a entes certificadores.',
    companyContext: 'La UMT (15,000 estudiantes) reporta una discrepancia del 7% en el historial de egresados al reportar al Ministerio de Educación, arriesgando la acreditación institucional. Detectaron además modificaciones de calificaciones no autorizadas en su base de datos local. El diagnóstico DAMA de 100 preguntas evidencia una falta de custodia del expediente académico (Nivel 1): docentes corrigen notas sin dejar traza auditable ni flujos de aprobación. El participante debe evitar la corrección manual en archivos Excel antes del reporte o culpar al Ministerio, y priorizar la matriz RACI de calificaciones y incidentes formales con alertas de validación automática.',
    regulations: [
      'Regulaciones del Ministerio de Educación Nacional y SNIES (Reportes de Egresados)',
      'Leyes de Integridad y Custodia de Archivos y Títulos Académicos',
      'Habeas Data Académico sobre la publicación y tratamiento de calificaciones',
      'Reglamento de Privacidad para Menores de Edad (Habeas Data Educativo)',
      'Estándares de Autoevaluación Institucional para Acreditación de Alta Calidad'
    ],
    actionPlan: [
      'Estructurar una matriz RACI para delimitar quién es Accountable de modificar notas.',
      'Registrar los incidentes de seguridad y modificaciones sospechosas de calificaciones.',
      'Configurar reglas de calidad para auditar la completitud del historial de egresados.',
      'Crear un flujo de aprobación formal para autorizar correcciones en el historial de notas.',
      'Catalogar y clasificar el expediente estudiantil de egresados como información reservada.',
      'Auditar periódicamente logs de base de datos de calificaciones académicas.',
      'Diseñar políticas de retención y preservación digital del historial de notas de egresados.'
    ],
    problems: [
      'Deserción estudiantil no detectada a tiempo por desconexión de datos de bienestar y académicos.',
      'Datos inconsistentes de egresados al reportar a ministerios y acreditadoras.',
      'Fallas de seguridad en calificaciones o expedición de títulos.',
      'Metadatos confusos sobre programas académicos entre facultades.',
      'Riesgo de pérdida de la acreditación de alta calidad por reportes erróneos al SNIES.',
      'Alteración fraudulenta de calificaciones por falta de custodia de expedientes.'
    ],
    capabilities: [
      'Gobierno de datos del dominio estudiantil y de egresados.',
      'Políticas y RACI rígidos para el registro y modificación de calificaciones.',
      'Reglas de calidad sobre historial académico y asistencia.',
      'Glosario unificado de terminología de acreditación de programas.',
      'Flujos de aprobación del comité de gobierno para emitir títulos de grado.',
      'Validación automática de documentos de identidad de graduandos.'
    ],
    outcomes: [
      'Automatización de reportes gubernamentales de acreditación con datos de calidad certificada.',
      'Alerta temprana de deserción estudiantil reduciendo deserción en un 12%.',
      'Cero vulneraciones de integridad de notas académicas.',
      'Acreditación de alta calidad renovada sin observaciones de gestión de información.',
      'Trazabilidad y auditoría forense del 100% de los cambios en el historial de calificaciones.'
    ]
  }
];

export default function TransformationProject() {
  const { currentTenant } = usePlatform();
  const [selectedSector, setSelectedSector] = useState<string>('financiero');
  const [activeTab, setActiveTab] = useState<'context' | 'problems' | 'compliance' | 'roadmap'>('context');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [metrics, setMetrics] = useState({
    assessmentsCount: 0,
    findingsCount: 0,
    risksCount: 0,
    incidentsCount: 0,
    progressPercent: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('govdata_selected_sector') || 'financiero';
    setSelectedSector(saved);
  }, []);

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    localStorage.setItem('govdata_selected_sector', sector);
  };

  const checkProjectProgress = useCallback(async () => {
    if (!currentTenant?.id) return;
    setIsValidating(true);
    try {
      const { data: dama } = await supabase.from('maturity_assessments').select('id, answers').eq('tenant_id', currentTenant.id);
      const valDama = dama ? dama.filter(r => r.answers && (r.answers.timestamp || r.answers.comite_gobierno)) : [];
      const damaCount = valDama.length;

      const { data: findings } = await supabase.from('maturity_findings').select('id').eq('tenant_id', currentTenant.id);
      const findingsCount = findings ? findings.length : 0;

      const { data: risks } = await supabase.from('security_risks').select('id').eq('tenant_id', currentTenant.id);
      const risksCount = risks ? risks.length : 0;

      const { data: incidents } = await supabase.from('quality_incidents').select('id').eq('tenant_id', currentTenant.id);
      const incidentsCount = incidents ? incidents.length : 0;

      let validationsFound = 0;
      const totalChecks = 20;

      if (damaCount >= 1) validationsFound++;
      if (findingsCount >= 5) validationsFound++;
      const { data: roadmaps } = await supabase.from('maturity_roadmaps').select('id').eq('tenant_id', currentTenant.id);
      if (roadmaps && roadmaps.length >= 4) validationsFound++;

      const { data: team } = await supabase.from('team_members').select('role,name,email,area').eq('tenant_id', currentTenant.id);
      if (team) {
        const roleTypes = team.map(m => m.role?.toLowerCase() || '');
        const reqRoles = ["data owner", "data steward", "data custodian", "cdo"];
        const hasAll = reqRoles.every(r => roleTypes.some(rt => rt.includes(r)));
        const fieldsOk = team.every(r => r.name && r.email && r.role && r.area);
        if (hasAll && fieldsOk && team.length >= 5) validationsFound++;
      }

      const { data: domains } = await supabase.from('team_domains').select('name').eq('tenant_id', currentTenant.id);
      if (domains) {
        const bootstrapDomains = ['CLIENTES & CRM', 'FINANZAS', 'TALENTO HUMANO', 'PROVEEDORES'];
        const validDomains = domains.filter(r => !bootstrapDomains.includes((r.name || '').trim().toUpperCase()));
        if (validDomains.length >= 3) validationsFound++;
      }

      const { data: raci } = await supabase.from('team_raci_matrix').select('*').eq('tenant_id', currentTenant.id);
      if (raci) {
        const defaultRaci = [
          { process: 'Definición de Glosario', owner_role: 'A', steward_role: 'R', custodian_role: 'C', analyst_role: 'C' },
          { process: 'Validación de Calidad', owner_role: 'A', steward_role: 'R', custodian_role: 'I', analyst_role: 'C' },
          { process: 'Aprobación de Acceso', owner_role: 'A', steward_role: 'C', custodian_role: 'R', analyst_role: 'I' },
          { process: 'Modelado de Datos', owner_role: 'C', steward_role: 'C', custodian_role: 'R', analyst_role: 'A' },
          { process: 'Gestión de Incidentes', owner_role: 'I', steward_role: 'R', custodian_role: 'A', analyst_role: 'C' },
        ];
        const validRaci = raci.filter(r => {
          return !defaultRaci.some(d => 
            d.process.toLowerCase() === (r.process || '').trim().toLowerCase() &&
            d.owner_role === r.owner_role &&
            d.steward_role === r.steward_role &&
            d.custodian_role === r.custodian_role &&
            d.analyst_role === r.analyst_role
          );
        });
        if (validRaci.length >= 7) validationsFound++;
      }

      const { data: capacity } = await supabase.from('team_capacity_assessments').select('id').eq('tenant_id', currentTenant.id);
      if (capacity && capacity.length >= 2) validationsFound++;

      const { data: committees } = await supabase.from('gov_committees').select('id').eq('tenant_id', currentTenant.id);
      if (committees && committees.length >= 2) validationsFound++;

      const { data: policies } = await supabase.from('data_policies').select('framework_origin').eq('tenant_id', currentTenant.id);
      if (policies) {
        const bootstrapFrameworks = ['DAMA', 'DCAM', 'HEALTH', 'PUBLIC', 'GDPR', 'STANDARD'];
        const validPolicies = policies.filter(r => !bootstrapFrameworks.includes((r.framework_origin || '').trim().toUpperCase()));
        if (validPolicies.length >= 5) validationsFound++;
      }

      const { data: workflows } = await supabase.from('policy_workflows').select('name').eq('tenant_id', currentTenant.id);
      if (workflows) {
        const bootstrapWfs = ['FLUJO DOCUMENTAL NORMATIVO', 'ESTÁNDAR', 'CRÍTICO / LEGAL', 'ESTANDAR', 'CRITICO / LEGAL'];
        const validWfs = workflows.filter(r => !bootstrapWfs.includes((r.name || '').trim().toUpperCase()));
        if (validWfs.length >= 2) validationsFound++;
      }

      if (risksCount >= 3) validationsFound++;

      const { data: controls } = await supabase.from('security_controls').select('id').eq('tenant_id', currentTenant.id);
      if (controls && controls.length >= 3) validationsFound++;

      const { data: conns } = await supabase.from('data_connections').select('id').eq('tenant_id', currentTenant.id);
      if (conns && conns.length >= 3) validationsFound++;

      const { data: assets } = await supabase.from('data_assets').select('id').eq('tenant_id', currentTenant.id);
      if (assets && assets.length >= 6) validationsFound++;

      const { data: rules } = await supabase.from('quality_rules').select('id').eq('tenant_id', currentTenant.id);
      if (rules && rules.length >= 5) validationsFound++;

      const { data: fields } = await supabase.from('asset_fields').select('id').eq('tenant_id', currentTenant.id);
      if (fields && fields.length >= 6) validationsFound++;

      const { data: opWfs } = await supabase.from('workflow_requests').select('status').eq('tenant_id', currentTenant.id).in('status', ['Aprobado', 'Cerrado', 'Completado']);
      if (opWfs && opWfs.length >= 3) validationsFound++;

      if (incidentsCount >= 3) validationsFound++;

      const { data: secInc } = await supabase.from('security_incidents').select('id').eq('tenant_id', currentTenant.id);
      if (secInc && secInc.length >= 3) validationsFound++;

      const { data: qHistory } = await supabase.from('quality_monitoring_history').select('id').eq('tenant_id', currentTenant.id);
      if (qHistory && qHistory.length >= 3) validationsFound++;

      const progressPercent = Math.round((validationsFound / 20) * 100);

      setMetrics({
        assessmentsCount: damaCount,
        findingsCount: findingsCount,
        risksCount: risksCount,
        incidentsCount: incidentsCount,
        progressPercent: progressPercent
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsValidating(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    checkProjectProgress();
  }, [checkProjectProgress]);

  const activeSector = SECTORS.find(s => s.id === selectedSector) || SECTORS[0];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1><Award size={36} color="#6366f1" /> Proyecto de Transformación Corporativa</h1>
          <p>Caso empresarial vivo y visualización de valor del Gobierno de Datos.</p>
        </div>
        <div>
          <button onClick={checkProjectProgress} disabled={isValidating} className={styles.refreshBtn}>
            <RefreshCw size={18} className={isValidating ? 'animate-spin' : ''} />
            {isValidating ? 'Actualizando...' : 'Recargar Datos'}
          </button>
        </div>
      </header>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#1e1b4b', margin: 0 }}>Proyecto: {activeSector.companyName}</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Sector: {activeSector.name}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sector de la Empresa:</label>
            <select
              value={selectedSector}
              onChange={(e) => handleSectorChange(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#1e293b',
                background: '#f8fafc'
              }}
            >
              <option value="financiero">Financiero</option>
              <option value="salud">Salud</option>
              <option value="gobierno">Gobierno</option>
              <option value="retail">Retail</option>
              <option value="telecomunicaciones">Telecomunicaciones</option>
              <option value="educacion">Educación</option>
            </select>
          </div>
        </div>

        {/* Internal Tabs on the Transformation Page */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '28px' }}>
          {['context', 'problems', 'compliance', 'roadmap'].map((tab) => {
            const isActive = activeTab === tab;
            const labels: Record<string, string> = {
              context: '1. Contexto Estratégico',
              problems: '2. Dolores y Situación Inicial',
              compliance: '3. Cumplimiento y Productos Clave',
              roadmap: '4. Metas y Resultados'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  background: isActive ? '#4f46e5' : 'transparent',
                  color: isActive ? 'white' : '#64748b',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none'
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'context' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contexto de la Industria:</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>{activeSector.industryContext}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contexto Particular ({activeSector.companyName}):</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>{activeSector.companyContext}</p>
              </div>
              <div style={{ background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '16px', padding: '20px' }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>Características Estratégicas del Proyecto:</h5>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#581c87', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Patrocinador Ejecutivo:</strong> Vicepresidente de Operaciones / CDO Corporate</li>
                  <li><strong>Alcance Primario:</strong> 100% de los Sistemas de Información Críticos</li>
                  <li><strong>Presupuesto de Gobierno:</strong> Asignado y Aprobado para Fase de Madurez</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Inconsistencias de Negocio Actuales:
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeSector.problems.map((prob, i) => (
                  <li key={i} style={{ fontSize: '0.95rem', color: '#7f1d1d', lineHeight: 1.5 }}>{prob}</li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', background: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                  Estado de la Base de Datos (Métricas Reales):
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 850, color: '#b45309', display: 'block', lineHeight: 1 }}>{metrics.risksCount}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78350f', textTransform: 'uppercase', display: 'block', marginTop: '6px' }}>Riesgos</span>
                  </div>
                  <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 850, color: '#b91c1c', display: 'block', lineHeight: 1 }}>{metrics.incidentsCount}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7f1d1d', textTransform: 'uppercase', display: 'block', marginTop: '6px' }}>Incidentes</span>
                  </div>
                  <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 850, color: '#0369a1', display: 'block', lineHeight: 1 }}>{metrics.findingsCount}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', display: 'block', marginTop: '6px' }}>Hallazgos</span>
                  </div>
                </div>
              </div>
              <div style={{ border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: '16px', padding: '20px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Madurez de Partida</span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#991b1b' }}>Nivel 1 (Inicial / Reactivo)</h4>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                  Falta de unificación en catálogos y políticas. La información se maneja de forma aislada e informal.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} /> Cumplimiento de Normas y Regulaciones del Sector:
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeSector.regulations.map((reg, i) => (
                  <li key={i} style={{ fontSize: '0.95rem', color: '#047857', fontWeight: 600 }}>{reg}</li>
                ))}
              </ul>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', background: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                Productos y Módulos Clave de la Plataforma Mapeados:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#4f46e5', display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>Catálogo de Datos y Glosario</strong>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Permite indexar términos de negocio y mapear linajes técnicos para auditorías.</span>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#4f46e5', display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>Módulo de Seguridad y Riesgos</strong>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Configura enmascaramientos y políticas de seguridad alineadas con Habeas Data / GDPR.</span>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#4f46e5', display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>Reglas de Calidad y Monitoreo</strong>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Despliega validaciones automáticas que evitan reportes inconsistentes a entes reguladores.</span>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#4f46e5', display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>Matriz RACI y Roles</strong>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Formaliza dueños de datos (Owners y Stewards) garantizando control de cambios auditable.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div style={{ background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} /> Plan de Acción Requerido en la Plataforma:
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeSector.actionPlan.map((plan, i) => (
                  <li key={i} style={{ fontSize: '0.95rem', color: '#581c87', lineHeight: 1.5 }}>{plan}</li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', background: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>Resultados del Negocio y KPIs Esperados:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeSector.outcomes.map((out, i) => (
                    <li key={i} style={{ fontSize: '0.92rem', color: '#047857', fontWeight: 600 }}>{out}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Madurez Objetivo</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>Nivel 3.5 (Gestionado)</h4>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Progreso del Caso</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>{metrics.progressPercent}%</h4>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
