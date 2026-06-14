'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle, 
  Award, 
  ArrowRight,
  RefreshCw,
  Database,
  Compass,
  Brain,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileBarChart,
  Users,
  Target,
  ShieldCheck,
  AlertTriangle,
  Building2,
  BookOpen,
  X
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './journey.module.css';
import UnifiedModal from '@/components/UnifiedModal';

// Type definitions
interface ActivityItem {
  id: string;
  title: string;
  context: string;
  expectedResult: string;
  moduleHref: string;
  btnLabel: string;
  checkTable: string;
  checkKey: string;
  whyDoIt: string;
  damaGuide: string;
  commonError: string;
  realExample: string;
  tips: string;
  whyImportant: string;
  problemSolved: string;
  riskMitigated: string;
  businessBenefit: string;
}

interface Phase {
  id: string;
  number: number;
  title: string;
  objective: string;
  importance: string;
  learning: string;
  building: string;
  modulesUsed: string;
  deliverables: string;
  activities: ActivityItem[];
}

interface DecisionChallenge {
  question: string;
  options: { key: string; text: string; feedback: string; isCorrect: boolean }[];
}

// Business Sector Configurations
const SECTORS = [
  {
    id: 'financiero',
    name: 'Sector Financiero',
    companyName: 'Nexus Bank S.A.',
    desc: 'Bancos, Fintechs y Cooperativas reguladas con alta exigencia en cumplimiento y seguridad de datos.',
    industryContext: 'La banca comercial gestiona flujos transaccionales críticos. Cualquier inconsistencia de datos tiene consecuencias financieras inmediatas, multas regulatorias y pérdida de confianza de los ahorradores.',
    companyContext: 'Nexus Bank S.A. se encuentra migrando su core bancario hacia una arquitectura cloud. Tienen discrepancias de saldos entre los sistemas legacy locales y el nuevo Data Lake en Snowflake, lo que retrasa los cierres contables mensuales hasta por 5 días hábiles. El diagnóstico DAMA inicial de 100 preguntas revela que la organización opera en Nivel 1 (Inicial) y de forma reactiva: no existe un glosario de términos unificado y cada área define las variables a su manera. Para alinearse con las mejores prácticas DAMA, el participante debe rechazar los scripts manuales de TI o parches de fin de mes, e institucionalizar un Glosario Técnico centralizado y comités formalizados.',
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

const DECISION_CHALLENGES: Record<string, Record<string, DecisionChallenge>> = {
  financiero: {
    phase_1: {
      question: 'El diagnóstico DAMA de 100 preguntas para el sector Financiero revela que el banco opera de forma Reactiva (Nivel 1). El Comité de Gobierno detecta que la discrepancia de saldos ocurre porque el área transaccional y contabilidad interpretan el término "Saldo Disponible" de manera diferente. ¿Cuál es tu primera decisión estratégica como CDO para alinearte con DAMA?',
      options: [
        { key: 'A', text: 'Aprobar e institucionalizar de inmediato un Glosario de Términos unificado con los directores de negocio involucrados, definiendo propietarios (Data Owners) y custodios en la RACI corporativa.', feedback: '¡Excelente! Resolver las discrepancias semánticas en el glosario previene errores futuros y alinea el negocio según el área de Metadatos de DAMA, superando el nivel reactivo.', isCorrect: true },
        { key: 'B', text: 'Delegar en el área de TI la construcción de un script técnico temporal o parche de fin de mes para obligar a los números a coincidir sin resolver la semántica.', feedback: 'Incorrecto. Esto representa una típica solución reactiva de Nivel 1 (parche técnico sin gobierno) que el diagnóstico de 100 preguntas de DAMA advierte que debe eliminarse por ocultar la causa raíz.', isCorrect: false },
        { key: 'C', text: 'Solicitar una consultoría externa de 6 meses para evaluar la arquitectura de bases de datos antes de definir responsables.', feedback: 'Inadecuado. Es un problema de definición de negocio y propiedad del dato (RACI/Glosario), no una falla inicial de infraestructura. Delegar la semántica externa alarga el problema.', isCorrect: false }
      ]
    },
    phase_2: {
      question: 'Bajo el pilar de Seguridad de Datos del diagnóstico de 100 preguntas, la Circular 007 exige auditoría estricta sobre quién accede a datos de tarjetas de crédito y PII en ambientes de pruebas. ¿Qué control prioritario implementas?',
      options: [
        { key: 'A', text: 'Implementar controles de enmascaramiento dinámico de datos y registro automatizado de logs de auditoría directo en la base de datos de producción y staging.', feedback: '¡Correcto! Enmascarar información sensible PII y registrar los logs mitiga riesgos de seguridad y cumple la Ley 1581 y PCI-DSS bajo el área de Seguridad de Datos de DAMA.', isCorrect: true },
        { key: 'B', text: 'Prohibir el acceso de lectura a todos los usuarios de negocio, incluyendo soporte y analistas de fraude, para evitar cualquier filtración.', feedback: 'Incorrecto. Esta es una medida reactiva extrema (seguridad por bloqueo) que paraliza la operación y fomenta la creación de copias informales (shadow IT), lo cual empeora el gobierno.', isCorrect: false },
        { key: 'C', text: 'Confiar en los accesos del Active Directory de la red interna sin enmascaramiento ni auditoría a nivel de tablas o consultas SQL.', feedback: 'Incorrecto. Active Directory no audita consultas SQL ni detecta descargas masivas o filtraciones internas a nivel de base de datos, lo cual representa una brecha crítica de control.', isCorrect: false }
      ]
    },
    phase_3: {
      question: 'Para cumplir con el pilar de Catálogo y Metadatos de DAMA (evaluado con baja madurez en el diagnóstico de 100 preguntas), deseas catalogar la base de datos core en Snowflake. ¿Cuál es el procedimiento técnico alineado a las mejores prácticas?',
      options: [
        { key: 'A', text: 'Importar los metadatos técnicos de las tablas oficiales del core, catalogar su linaje y clasificar las columnas PII mapeándolas al glosario de términos.', feedback: '¡Perfecto! Esto hace visible la estructura, clasifica el riesgo de seguridad a nivel de metadatos y crea valor real alineado con Catálogos de DAMA.', isCorrect: true },
        { key: 'B', text: 'Catalogar todas las tablas temporales, de depuración y dumps históricos creados por analistas y TI para asegurar que nada quede por fuera.', feedback: 'Incorrecto. Esto satura el catálogo con metadatos basura y ruido, dificultando que el negocio localice las fuentes oficiales de verdad.', isCorrect: false },
        { key: 'C', text: 'Mantener un inventario manual de tablas en una hoja de Excel compartida en la red interna para evitar costos de infraestructura.', feedback: 'Incorrecto. El Excel queda obsoleto al instante de su creación. DAMA exige un repositorio de metadatos dinámico, conectado y auditable.', isCorrect: false }
      ]
    },
    phase_4: {
      question: 'El pilar de Calidad de Datos del diagnóstico advierte de la falta de procesos formales de remediación. Se detecta una discrepancia del 2% en el balance contable por un error de carga. ¿Cómo procedes de forma gobernada?',
      options: [
        { key: 'A', text: 'Registrar un incidente de calidad formal en la plataforma, asignando al Steward la investigación de causa raíz y un plan correctivo auditable.', feedback: '¡Excelente! Esta es la forma madura e institucional bajo DAMA Calidad de Datos para gestionar problemas de forma auditable y prevenir su reincidencia.', isCorrect: true },
        { key: 'B', text: 'Ajustar manualmente el balance contable consolidado en una hoja de Excel local para no retrasar el reporte regulatorio de fin de mes.', feedback: 'Incorrecto. Esta práctica reactiva de Nivel 1 enmascara la inconsistencia en el origen, garantiza que el error se repita el próximo mes y viola la integridad contable.', isCorrect: false },
        { key: 'C', text: 'Echar la culpa al equipo de TI e ingenieros y exigirles que solucionen el bug de carga de inmediato sin abrir un ticket de calidad o documentar.', feedback: 'Incorrecto. Sin gobernanza de negocio (Steward/RACI), el bug podría solucionarse de forma incorrecta, alterando el linaje técnico e invalidando auditorías de control.', isCorrect: false }
      ]
    }
  },
  salud: {
    phase_1: {
      question: 'El diagnóstico DAMA de 100 preguntas califica la gestión de Datos Maestros en la Clínica en Nivel 1 (Inicial). La clínica registra un 12% de pacientes duplicados debido a la integración de nuevos centros médicos. ¿Cuál es tu primera decisión organizativa bajo DAMA?',
      options: [
        { key: 'A', text: 'Asignar al Data Steward de Admisiones la responsabilidad formal de definir reglas de negocio para un Identificador Único de Paciente y unificar el catálogo clínico.', feedback: '¡Excelente! El Steward define las reglas lógicas para evitar registros duplicados, un paso clave en el área de Datos Maestros de DAMA para lograr registros únicos.', isCorrect: true },
        { key: 'B', text: 'Pedirle a los médicos y enfermeras que verifiquen la cédula dos veces manualmente en cada consulta para corregir en caliente.', feedback: 'Incorrecto. Esta es una solución operativa ineficiente que traslada la carga administrativa al personal asistencial, incrementando el riesgo clínico durante urgencias.', isCorrect: false },
        { key: 'C', text: 'Comprar una base de datos externa de registros de identidad para cruzar datos sin gobernar ni definir roles internos en la clínica.', feedback: 'Incorrecto. Introduce graves riesgos de privacidad de datos sensibles (Ley 1581) y no soluciona la ineficiencia sistémica en la captura de información demográfica.', isCorrect: false }
      ]
    },
    phase_2: {
      question: 'Bajo el pilar de Seguridad de Datos del diagnóstico DAMA, un ciberataque expone historias clínicas. ¿Qué control preventivo falló críticamente en el diagnóstico de madurez?',
      options: [
        { key: 'A', text: 'La directiva de cifrado de datos sensibles en reposo y el control de accesos basado en roles (RBAC) con privilegios mínimos sobre el core clínico.', feedback: '¡Correcto! Encriptar datos de salud y restringir accesos mitiga el impacto de filtraciones y cumple las normas HIPAA y Ley 1581.', isCorrect: true },
        { key: 'B', text: 'La contraseña de seguridad del módem de recepción y el firewall de la red wifi de invitados.', feedback: 'Incorrecto. Esta es una respuesta periférica clásica. El control DAMA debe residir directamente sobre el activo de datos (historias clínicas) y no solo en la red externa.', isCorrect: false },
        { key: 'C', text: 'No tener instalado un antivirus local en cada tablet de enfermería de la clínica.', feedback: 'Incorrecto. Aunque ayuda, no protege el servidor de base de datos central ni evita la extracción masiva de datos en reposo desprotegidos.', isCorrect: false }
      ]
    },
    phase_3: {
      question: 'Para alinearse con el pilar de Catálogos de DAMA y habilitar interoperabilidad HL7/FHIR, deseas catalogar los diagnósticos y alergias. ¿Cuál es el enfoque correcto?',
      options: [
        { key: 'A', text: 'Catalogar la tabla clínica central en GovData, mapear el campo alergias al glosario estándar y clasificarlo como Altamente Confidencial.', feedback: '¡Perfecto! Garantiza la visibilidad técnica del activo de datos a la vez que impone las directivas de seguridad adecuadas para el intercambio clínico seguro.', isCorrect: true },
        { key: 'B', text: 'Guardar la lista de alergias homologadas en una hoja de Word guardada en una carpeta compartida en la intranet de la clínica.', feedback: 'Incorrecto. Esta documentación manual queda obsoleta de inmediato, no se integra con las bases de datos y viola las normas de protección de datos sensibles.', isCorrect: false },
        { key: 'C', text: 'Evitar catalogar o documentar la base de datos de pacientes argumentando que ocultar las tablas previene hackeos.', feedback: 'Incorrecto. La seguridad por oscuridad es una mala práctica de Nivel 1. Impide el uso legítimo de la información por médicos y analistas autorizados.', isCorrect: false }
      ]
    },
    phase_4: {
      question: 'El diagnóstico DAMA de 100 preguntas señala una falta de trazabilidad en la edición de datos clínicos. Un paciente reporta que su tipo de sangre está mal registrado. ¿Cuál es la ruta gobernada?',
      options: [
        { key: 'A', text: 'Registrar un incidente crítico de calidad, activar el flujo RACI de rectificación y dejar registro auditable en la bitácora técnica.', feedback: '¡Excelente! En salud, la precisión del dato salva vidas. DAMA exige una bitácora de auditoría estricta de cambios clínicos y responsabilidad clara.', isCorrect: true },
        { key: 'B', text: 'Pedirle al paciente que traiga un carnet físico impreso y archivarlo en una carpeta de recepción para consulta futura.', feedback: 'Incorrecto. Esta solución reactiva y manual mantiene el dato electrónico incorrecto, exponiendo al paciente a un riesgo fatal en urgencias.', isCorrect: false },
        { key: 'C', text: 'Cambiar el tipo de sangre directamente en la base de datos en caliente mediante consola SQL sin dejar registro de auditoría.', feedback: 'Incorrecto. Modificar datos clínicos en producción de forma directa sin flujo de aprobación ni bitácora de auditoría viola la Ley 1581 y las normas sanitarias.', isCorrect: false }
      ]
    }
  },
  gobierno: {
    phase_1: {
      question: 'El diagnóstico DAMA de 100 preguntas del sector Gobierno revela que la entidad trabaja en silos. La Agencia Nacional de Catastro detecta predios duplicados en un 8%. ¿Cuál es la decisión inicial bajo el marco de Gobierno Digital?',
      options: [
        { key: 'A', text: 'Constituir formalmente el Comité de Gobierno de Datos con representación jurídica, catastral y de registro para unificar la propiedad del dato predial.', feedback: '¡Excelente! Establecer la institucionalidad y comités previene pleitos prediales y silos de información entre entidades del Estado.', isCorrect: true },
        { key: 'B', text: 'Permitir que cada alcaldía municipal e IGAC maneje su propio estándar predial de manera independiente para agilizar trámites.', feedback: 'Incorrecto. Esta práctica reactiva (anarquía catastral) fragmenta los datos del país y viola las directivas de interoperabilidad nacional de Gobierno Digital.', isCorrect: false },
        { key: 'C', text: 'Suspender todos los trámites catastrales del país hasta que se adquiera un nuevo software geográfico (GIS).', feedback: 'Incorrecto. La falta de software no es la causa raíz; es la ausencia de gobernanza, estándares compartidos y dueños de datos de registros nacionales.', isCorrect: false }
      ]
    },
    phase_2: {
      question: 'La Ley de Transparencia (Ley 1712) exige publicar datos abiertos. Bajo el pilar de Seguridad y Privacidad de las 100 preguntas DAMA, ¿cómo garantizas el cumplimiento sin exponer datos sensibles PII?',
      options: [
        { key: 'A', text: 'Clasificar los metadatos públicos en el Catálogo y aplicar políticas obligatorias de anonimización en el pipeline de publicación de Datos Abiertos.', feedback: '¡Correcto! Cumple la Ley 1712 y protege el Habeas Data de los ciudadanos (Ley 1581) mediante enmascaramiento normativo de metadatos.', isCorrect: true },
        { key: 'B', text: 'Publicar las tablas crudas de la base de datos catastral para cumplir rápidamente con los indicadores de transparencia del ministerio.', feedback: 'Incorrecto. Esto viola la Ley 1581 de protección de datos personales y expone información confidencial de los ciudadanos a fraudes de suplantación.', isCorrect: false },
        { key: 'C', text: 'No publicar ningún dato catastral o predial argumentando motivos de seguridad nacional y denegar el acceso a la ciudadanía.', feedback: 'Incorrecto. Incumple la ley de acceso a la información y reduce la confianza de los ciudadanos en las instituciones públicas de forma injustificada.', isCorrect: false }
      ]
    },
    phase_3: {
      question: 'Deseas catalogar la base de datos catastral nacional. ¿Cuál es el enfoque correcto alineado a las 100 preguntas de diagnóstico DAMA?',
      options: [
        { key: 'A', text: 'Conectar las bases de datos geográficas de Catastro al Catálogo de Metadatos de GovData y registrar la procedencia (linaje) de cada registro predial.', feedback: '¡Excelente! Habilita a los ciudadanos y auditores a buscar y trazar el origen técnico de las propiedades prediales de forma automatizada.', isCorrect: true },
        { key: 'B', text: 'Importar archivos shapefile de mapas locales de forma manual en carpetas ZIP en la nube sin documentar sus atributos técnicos.', feedback: 'Incorrecto. Los archivos sueltos se desactualizan de inmediato, no proporcionan metadatos lógicos y rompen el linaje técnico del dato estatal.', isCorrect: false },
        { key: 'C', text: 'Subir un documento en Word con la descripción general de las tablas y guardarlo en el servidor de archivos compartidos del ministerio.', feedback: 'Incorrecto. Esto no proporciona un catálogo dinámico y viola las normas de gobierno de metadatos del Marco Nacional de Interoperabilidad.', isCorrect: false }
      ]
    },
    phase_4: {
      question: 'El Ministerio de Vivienda reporta inconsistencias en el registro único de predios al cruzar datos. ¿Cómo resuelves este incidente bajo DAMA?',
      options: [
        { key: 'A', text: 'Registrar un incidente de calidad de datos en la plataforma y convocar al Data Steward de Catastro para corregir las reglas lógicas de validación predial.', feedback: '¡Excelente! Resolver las discrepancias de datos oficiales con incidentes gobernados y reglas en origen garantiza la interoperabilidad estatal.', isCorrect: true },
        { key: 'B', text: 'Crear un reporte Excel temporal para cruzar las bases de datos de vivienda y enviarlo por correo para salir del paso este mes.', feedback: 'Incorrecto. Esta solución reactiva típica de Nivel 1 duplica el esfuerzo, perpetúa el silo de información y no corrige el error en las fuentes primarias.', isCorrect: false },
        { key: 'C', text: 'Pedirle a los ciudadanos que vuelvan a registrar sus propiedades de forma manual en una plataforma nueva de vivienda.', feedback: 'Incorrecto. Aumenta de manera innecesaria la carga administrativa de los ciudadanos y evidencia una grave falta de interoperabilidad estatal.', isCorrect: false }
      ]
    }
  },
  retail: {
    phase_1: {
      question: 'El diagnóstico DAMA de 100 preguntas señala una falta total de propiedad de datos en el Retail. El e-commerce reporta un 15% de inconsistencias en stock contra las tiendas físicas. ¿Cuál es la primera decisión estratégica de gobierno DAMA?',
      options: [
        { key: 'A', text: 'Definir al Director de Logística como Data Owner del dominio "Productos e Inventarios" y estructurar una mesa de Stewards de negocio y TI.', feedback: '¡Excelente! Asignar propiedad (Ownership) previene descuadres lógicos y permite coordinar las reglas de stock entre tiendas y web de forma gobernada.', isCorrect: true },
        { key: 'B', text: 'Exigir a TI que configure sincronizaciones de inventario cada 10 segundos sin validar el origen de los descuadres de las bases de datos.', feedback: 'Incorrecto. Esta es una solución reactiva que sobrecarga los servidores y no soluciona el problema de fondo: la falta de una definición de stock unificada y de dueños del dato.', isCorrect: false },
        { key: 'C', text: 'Ignorar las discrepancias de stock y compensar de forma reactiva a los clientes inconformes con cupones de descuento.', feedback: 'Incorrecto. Afecta los márgenes comerciales de la empresa, no soluciona el dolor técnico y deteriora la confianza del cliente por falsas existencias en la web.', isCorrect: false }
      ]
    },
    phase_2: {
      question: 'Bajo el pilar de Seguridad y Privacidad de las 100 preguntas DAMA, Marketing realiza campañas de publicidad masivas y sufre quejas de clientes por violar la privacidad. ¿Qué control implementas?',
      options: [
        { key: 'A', text: 'Establecer una política corporativa sobre el consentimiento del cliente (Opt-in/Opt-out) y configurar enmascaramiento de datos personales en el CRM.', feedback: '¡Correcto! Proteger la privacidad del cliente en el CRM mitiga el riesgo de multas por Habeas Data Comercial bajo la Ley 1581.', isCorrect: true },
        { key: 'B', text: 'Seguir enviando correos masivos a toda la base de datos sin consentimiento confiando en que no habrá demandas legales ni multas.', feedback: 'Incorrecto y altamente riesgoso. Expone a la empresa a multas millonarias de la Superintendencia de Industria y Comercio por violar Habeas Data.', isCorrect: false },
        { key: 'C', text: 'Apagar todas las campañas de marketing digital y eliminar la base de datos del CRM para evitar problemas de privacidad.', feedback: 'Incorrecto. Esta es una reacción de pánico que destruye el canal de ventas. La gobernanza de datos debe habilitar el uso ético y comercial del dato de forma segura.', isCorrect: false }
      ]
    },
    phase_3: {
      question: 'La compañía detecta que tiene SKUs de productos duplicados y clasificaciones inconsistentes. ¿Cómo lo catalogas bajo DAMA?',
      options: [
        { key: 'A', text: 'Catalogar el maestro de productos en GovData y configurar reglas de calidad lógicas sobre formato, completitud y unicidad de SKUs.', feedback: '¡Perfecto! Garantiza un catálogo comercial confiable, automatizando el monitoreo y evitando productos huerfanos.', isCorrect: true },
        { key: 'B', text: 'Limpiar manualmente la base de datos de productos usando un archivo Excel compartido cada fin de semana.', feedback: 'Incorrecto. La limpieza manual en Excel no es escalable y el error volverá a ocurrir el lunes cuando se ingresen nuevos productos sin validación.', isCorrect: false },
        { key: 'C', text: 'Crear un nuevo sistema de SKUs exclusivo para el canal de e-commerce y mantener el antiguo para las tiendas físicas.', feedback: 'Incorrecto. Esta práctica reactiva de Nivel 1 agrava el problema de inconsistencia de inventario y destruye la visión de negocio omnicanal unificada.', isCorrect: false }
      ]
    },
    phase_4: {
      question: 'Las campañas de marketing de retail fallan porque el 22% de la base de datos de clientes tiene correos y teléfonos duplicados. ¿Cuál es el plan bajo DAMA Calidad de Datos?',
      options: [
        { key: 'A', text: 'Registrar un incidente crítico de calidad en GovData, definir al Steward responsable y desplegar reglas de validación de formato en la captura.', feedback: '¡Excelente! DAMA Calidad de Datos establece que los incidentes de duplicidad se mitigan con controles de validación en la captura en las aplicaciones origen.', isCorrect: true },
        { key: 'B', text: 'Comprar una base de datos externa de correos electrónicos para sustituir los registros corruptos de clientes sin validar.', feedback: 'Incorrecto. Viola la privacidad de datos (Ley 1581) y no resuelve el fallo en la captura de tu propia aplicación de registro de clientes.', isCorrect: false },
        { key: 'C', text: 'Pedirle al equipo de desarrollo que elimine de la base de datos a los clientes que tengan correos vacíos sin análisis previo.', feedback: 'Incorrecto. Esto puede eliminar registros históricos valiosos de compras de clientes reales y alterar las métricas contables y fiscales de la empresa.', isCorrect: false }
      ]
    }
  },
  telecomunicaciones: {
    phase_1: {
      question: 'El diagnóstico DAMA de 100 preguntas del sector Telecomunicaciones alerta de graves fugas de información. NexTel sufre fugas de ingresos del 4% en facturación por la falta de conciliación de CDRs. ¿Cuál es la primera acción de gobierno DAMA?',
      options: [
        { key: 'A', text: 'Definir el glosario de términos de red (CDR, ARPU, Celdas) y estructurar una matriz RACI entre Ingeniería de Red y el área de Facturación.', feedback: '¡Excelente! Resolver las discrepancias técnicas de consumo entre ingeniería y contabilidad evita fugas y aclara responsabilidades.', isCorrect: true },
        { key: 'B', text: 'Aumentar las tarifas de telefonía móvil un 4% para compensar las fugas contables de red de forma inmediata.', feedback: 'Incorrecto. Afecta la competitividad comercial del operador y no soluciona la inconsistencia en los sistemas de tarificación.', isCorrect: false },
        { key: 'C', text: 'Ignorar las fugas del 4% asumiéndolas como pérdidas operativas normales de la infraestructura de red.', feedback: 'Incorrecto. DAMA exige gobernar los datos transaccionales de alto volumen para evitar ineficiencias financieras críticas.', isCorrect: false }
      ]
    },
    phase_2: {
      question: 'Bajo el pilar de Seguridad de Datos del diagnóstico de 100 preguntas, se detecta riesgo de fraude por clonación de tarjetas SIM mediante modificaciones no autorizadas en bases de datos de red. ¿Qué control implementas?',
      options: [
        { key: 'A', text: 'Establecer políticas de auditoría en tiempo real y flujos de aprobación (workflows) para la creación y cambio de SIMs en la base de datos de producción.', feedback: '¡Correcto! Implementar seguridad gobernada y flujos de aprobación restringe cambios malintencionados en bases de datos de telecomunicaciones.', isCorrect: true },
        { key: 'B', text: 'Obligar a los técnicos a cambiar su contraseña de Active Directory cada 3 días laborales para evitar hackeos.', feedback: 'Incorrecto. Esta es una medida reactiva que fatiga al personal y no evita que usuarios autorizados realicen fraudes sin registro de auditoría SQL.', isCorrect: false },
        { key: 'C', text: 'Bloquear la base de datos de red para que ningún técnico de soporte pueda realizar modificaciones de tarjetas SIM.', feedback: 'Incorrecto. Paraliza el soporte técnico y el servicio al cliente ante pérdida legítima de dispositivos.', isCorrect: false }
      ]
    },
    phase_3: {
      question: 'Para cumplir con el pilar de Catálogo y Metadatos de DAMA, deseas catalogar la base de datos de CDRs e ingeniería de antenas que procesa petabytes diarios. ¿Cuál es el procedimiento técnico?',
      options: [
        { key: 'A', text: 'Importar metadatos técnicos de red al catálogo de GovData, documentar los logs de celdas y clasificar las columnas PII.', feedback: '¡Perfecto! Permite a los ingenieros y científicos de datos buscar variables y trazar el linaje técnico de facturación de forma segura.', isCorrect: true },
        { key: 'B', text: 'Copiar la estructura de las tablas de red en un documento Word y guardarlo en el Drive de ingeniería de red.', feedback: 'Incorrecto. La documentación estática queda obsoleta de inmediato ante cualquier actualización en la infraestructura de antenas.', isCorrect: false },
        { key: 'C', text: 'Evitar catalogar las tablas de red por considerarlo metadatos puramente de TI sin relevancia de negocio.', feedback: 'Incorrecto. DAMA indica que los metadatos de red son cruciales para el negocio de telecomunicaciones y la facturación de servicios.', isCorrect: false }
      ]
    },
    phase_4: {
      question: 'Los reportes de deserción de clientes (churn) no coinciden entre Marketing y Finanzas, retrasando la toma de decisiones. ¿Cómo procedes bajo DAMA Calidad de Datos?',
      options: [
        { key: 'A', text: 'Configurar reglas automáticas de calidad de datos sobre el estado de la cuenta en el Data Warehouse y validar el linaje desde el CRM.', feedback: '¡Excelente! Garantizar la consistencia histórica del estado de clientes en el DW soluciona discrepancias entre departamentos.', isCorrect: true },
        { key: 'B', text: 'Aprobar la métrica de Marketing por ser más optimista respecto a la pérdida de clientes y usar esa para la junta.', feedback: 'Incorrecto. Esto introduce sesgos corporativos y expone a la junta directiva a tomar decisiones erróneas basadas en datos inconsistentes.', isCorrect: false },
        { key: 'C', text: 'Pedir a TI que cree un nuevo reporte consolidado que intermedie las dos cifras para que queden conformes.', feedback: 'Incorrecto. Esta práctica reactiva de Nivel 1 enmascara la inconsistencia del origen y genera desconfianza en los reportes analíticos de la empresa.', isCorrect: false }
      ]
    }
  },
  educacion: {
    phase_1: {
      question: 'El diagnóstico DAMA de 100 preguntas del sector Educación califica la Gobernanza en Nivel 1 (Inicial). La universidad reporta un 7% de inconsistencias en el historial de egresados al reportar al Ministerio de Educación. ¿Cuál es la decisión inicial bajo DAMA?',
      options: [
        { key: 'A', text: 'Estructurar una matriz RACI clara para el registro de calificaciones e historial académico, definiendo un Steward por facultad.', feedback: '¡Excelente! Resolver las discrepancias lógicas de las notas académicas requiere roles responsables de la calidad de admisiones y registro.', isCorrect: true },
        { key: 'B', text: 'Culpar al Ministerio de Educación por el cambio de plataforma SNIES y no realizar ajustes internos en las bases de datos.', feedback: 'Incorrecto. Esta es una actitud reactiva que no soluciona la inconsistencia en tus bases de datos internas de estudiantes.', isCorrect: false },
        { key: 'C', text: 'Contratar a estudiantes de último semestre para que verifiquen y corrijan manualmente las notas en la base de datos sin supervisión.', feedback: 'Incorrecto. Viola la privacidad de datos (Ley 1581) y representa un grave riesgo de manipulación de notas fraudulentas por falta de controles.', isCorrect: false }
      ]
    },
    phase_2: {
      question: 'Bajo el pilar de Seguridad de Datos del diagnóstico de 100 preguntas DAMA, se detecta alteración de notas en la base de datos académica local. ¿Qué directiva implementas?',
      options: [
        { key: 'A', text: 'Implementar flujos de aprobación (workflows) para cambios en notas e inhabilitar accesos directos de escritura en producción.', feedback: '¡Correcto! Las calificaciones estudiantiles exigen custodia estricta y auditoría por bitácora (auditable ante entes de control).', isCorrect: true },
        { key: 'B', text: 'Cambiar la contraseña de la cuenta del Administrador de la base de datos académica cada semana.', feedback: 'Incorrecto. Esto no evita que usuarios autorizados realicen alteraciones ni audita quién o por qué se cambió una calificación.', isCorrect: false },
        { key: 'C', text: 'Prohibir a los docentes realizar cualquier modificación o corrección de notas en la plataforma académica de forma permanente.', feedback: 'Incorrecto. Esta es una respuesta reactiva permanente que paraliza el proceso legítimo de corrección de calificaciones por parte de los profesores.', isCorrect: false }
      ]
    },
    phase_3: {
      question: 'Para cumplir con el pilar de Catálogo y Metadatos de DAMA, deseas catalogar la base de datos de estudiantes y egresados para evitar títulos académicos huérfanos. ¿Cuál es la ruta técnica?',
      options: [
        { key: 'A', text: 'Catalogar la base de datos académica en GovData, mapear el expediente estudiantil e identificar datos personales sensibles en el diccionario.', feedback: '¡Perfecto! Garantiza confidencialidad, trazabilidad y visibilidad para auditorías de egresados y acreditaciones.', isCorrect: true },
        { key: 'B', text: 'Mantener un listado de egresados en archivos PDF firmados digitalmente en un repositorio interno en la red.', feedback: 'Incorrecto. No permite la interoperabilidad de datos académicos ni la automatización de certificados a través de APIs de consulta.', isCorrect: false },
        { key: 'C', text: 'No catalogarlo argumentando que la base académica es confidencial y no debe estar mapeada en ningún sistema.', feedback: 'Incorrecto. La confidencialidad exige políticas de seguridad, no falta de catalogación interna. Si no se cataloga, el área de datos maestro falla.', isCorrect: false }
      ]
    },
    phase_4: {
      question: 'El reporte de egresados tiene nombres y cédulas inconsistentes que ponen en riesgo la acreditación institucional. ¿Cómo actúas bajo DAMA Calidad de Datos?',
      options: [
        { key: 'A', text: 'Registrar un incidente de calidad de datos, establecer reglas automáticas de validación de cédulas en GovData y activar flujos correctivos.', feedback: '¡Excelente! En educación, la calidad del registro académico garantiza la validez de los títulos expedidos y automatiza las revisiones.', isCorrect: true },
        { key: 'B', text: 'Corregir manualmente el archivo final en Excel antes de enviarlo al Ministerio de Educación para salvar el reporte.', feedback: 'Incorrecto. Esta práctica reactiva enmascara la inconsistencia del origen y garantiza que el reporte se rechace en el próximo periodo SNIES.', isCorrect: false },
        { key: 'C', text: 'Culpar al equipo de admisiones de la universidad y no tomar ninguna medida correctiva en el sistema de información.', feedback: 'Incorrecto. Sin un análisis formal de negocio y gobernanza (Steward/RACI), las inconsistencias se repetirán en el siguiente ciclo.', isCorrect: false }
      ]
    }
  }
};

// Fill in other sectors dynamically if requested (using a fallback)
const getChallengeForSector = (sector: string, phaseId: string): DecisionChallenge => {
  const sect = DECISION_CHALLENGES[sector] || DECISION_CHALLENGES['financiero'];
  return sect[phaseId] || DECISION_CHALLENGES['financiero'][phaseId];
};

const PHASES: Phase[] = [
  {
    id: 'phase_1',
    number: 1,
    title: 'Fundamentos y Diagnóstico',
    objective: 'Establecer la madurez base y la estructura del equipo de gobierno de datos.',
    importance: 'Permite conocer el estado actual de la organización y asignar las responsabilidades primarias.',
    learning: 'Marcos de madurez DAMA, modelado de responsabilidades RACI, asignación de pertenencia por dominio.',
    building: 'Diagnóstico de madurez DAMA, organigrama de gobierno y matriz RACI operativa.',
    modulesUsed: 'Madurez DAMA, Roles y Equipo, Dominios, Comités.',
    deliverables: 'Diagnóstico Ejecutivo, Organigrama de Roles, Matriz RACI aprobada.',
    activities: [
      {
        id: 'p1_dama',
        title: 'Diagnóstico DAMA Inicial',
        context: 'Evalúa las 11 disciplinas de DAMA-DMBOK para entender el nivel de madurez organizativo.',
        expectedResult: 'Haber completado y guardado al menos 1 evaluación de madurez DAMA en el Command Center 360.',
        moduleHref: '/command-center',
        btnLabel: 'Ir a Evaluación DAMA',
        checkTable: 'maturity_assessments',
        checkKey: 'dama',
        whyDoIt: 'Establecer la línea base para priorizar esfuerzos en base al GAP encontrado.',
        damaGuide: 'DAMA-DMBOK estipula que la madurez de datos se evalúa en una escala de 0 a 5, cubriendo personas, procesos y tecnologías.',
        commonError: 'Responder de manera optimista. Es mejor ser conservador para justificar el presupuesto.',
        realExample: 'Un banco local descubrió que su calidad de datos estaba en nivel 1, obligándolo a crear su primer glosario corporativo.',
        tips: 'Involucra a líderes de TI y Negocio para promediar las respuestas.',
        whyImportant: 'Define el punto de partida real de la gobernanza de datos en la empresa para evitar inversiones ciegas.',
        problemSolved: 'Acaba con la especulación sobre el estado real de los procesos de información corporativos.',
        riskMitigated: 'Mitiga el riesgo de diseñar un roadmap desconectado de las brechas reales del negocio.',
        businessBenefit: 'Permite justificar el presupuesto y el ROI de gobierno ante la junta directiva en base a datos reales.'
      },
      {
        id: 'p1_findings',
        title: 'Documentar Hallazgos de Madurez',
        context: 'Registra los problemas, oportunidades y brechas identificadas en el diagnóstico inicial.',
        expectedResult: 'Tener al menos 5 hallazgos registrados e integrados en el Command Center 360.',
        moduleHref: '/command-center',
        btnLabel: 'Ir a Hallazgos',
        checkTable: 'maturity_findings',
        checkKey: 'findings',
        whyDoIt: 'Convertir la puntuación numérica en planes de acción específicos y descriptivos.',
        damaGuide: 'Los hallazgos del GAP análisis deben clasificarse por severidad e impacto de negocio.',
        commonError: 'Redactar hallazgos vagos como "falta tecnología". Sé específico sobre qué proceso falla.',
        realExample: 'Hallazgo: No existe un dueño definido para el dominio de Clientes, provocando registros duplicados en CRM.',
        tips: 'Redacta cada hallazgo explicando causa, efecto y criticidad.',
        whyImportant: 'Traduce un score numérico abstracto en necesidades tangibles de negocio para los directivos.',
        problemSolved: 'Soluciona la falta de visibilidad y el desconocimiento de fallos críticos en flujos de datos.',
        riskMitigated: 'Reduce el riesgo de ignorar vulnerabilidades en procesos operativos antes de que causen impacto financiero.',
        businessBenefit: 'Prioriza el esfuerzo del equipo sobre hallazgos de alto valor para cerrar brechas urgentes.'
      },
      {
        id: 'p1_roadmaps',
        title: 'Diseñar el Plan de Ruta (Roadmap)',
        context: 'Define las fases temporales y hitos para cerrar las brechas identificadas.',
        expectedResult: 'Configurar al menos 4 hitos o fases planificadas en el Roadmap del Command Center 360.',
        moduleHref: '/command-center',
        btnLabel: 'Ir a Plan de Ruta',
        checkTable: 'maturity_roadmaps',
        checkKey: 'roadmaps',
        whyDoIt: 'Dar visibilidad y estructura temporal a los esfuerzos de gobierno en la organización.',
        damaGuide: 'El roadmap debe priorizar iniciativas de alto valor y bajo esfuerzo (Quick Wins) en la primera etapa.',
        commonError: 'Planificar entregables gigantescos en la fase 1. Usa entregas incrementales.',
        realExample: 'Fase 1: Asignación de Roles de Clientes (Q1). Fase 2: Implementación de Reglas de Calidad (Q2).',
        tips: 'Divide el roadmap en fases de 3 meses para mantener al equipo motivado.',
        whyImportant: 'Proporciona una guía cronológica clara para que la organización sepa el camino y los hitos esperados.',
        problemSolved: 'Evita la parálisis por análisis y el desorden al querer implementar todo el marco a la vez.',
        riskMitigated: 'Mitiga el riesgo de abandono del proyecto por parte de los sponsors al no ver metas a corto plazo.',
        businessBenefit: 'Alinea los recursos y asegura entregables de valor de manera trimestral o semestral.'
      },
      {
        id: 'p1_roles',
        title: 'Estructurar el Equipo de Gobierno',
        context: 'Designa a las personas responsables de orquestar el gobierno: CDO, Data Owners, Stewards y Custodians.',
        expectedResult: 'Asignar al menos 4 miembros del equipo con roles asignados correctamente.',
        moduleHref: '/team',
        btnLabel: 'Configurar Equipo',
        checkTable: 'team_members',
        checkKey: 'roles',
        whyDoIt: 'Garantizar que cada dominio de datos tenga un responsable del negocio y técnico.',
        damaGuide: 'DAMA distingue entre Data Stewards (negocio, definen reglas) y Custodians (TI, implementan reglas).',
        commonError: 'Asignar todos los roles al director de TI. El gobierno de datos es un esfuerzo de negocio.',
        realExample: 'La Directora de Finanzas fue asignada como Data Owner del Dominio Financiero con soporte de 2 Stewards.',
        tips: 'Asegúrate de que cada rol tenga al menos su nombre, correo y área bien completados.',
        whyImportant: 'Formaliza quién rinde cuentas y quién opera la información en las áreas clave de la empresa.',
        problemSolved: 'Acaba con la cultura de "los datos son del área de sistemas" involucrando a los líderes de negocio.',
        riskMitigated: 'Previene el riesgo de decisiones inconsistentes o manipulación errónea de datos sin autorización.',
        businessBenefit: 'Agiliza la resolución de conflictos sobre reglas de negocio asignando dueños claros.'
      },
      {
        id: 'p1_domains',
        title: 'Establecer Dominios de Datos',
        context: 'Divide el ecosistema de información en dominios lógicos de negocio para asignar propiedad.',
        expectedResult: 'Tener configurados al menos 2 dominios personalizados de gobierno.',
        moduleHref: '/team',
        btnLabel: 'Crear Dominios',
        checkTable: 'team_domains',
        checkKey: 'domains',
        whyDoIt: 'Evitar zonas grises donde nadie es dueño de la veracidad de la información.',
        damaGuide: 'Los dominios comunes de gobierno son Clientes, Proveedores, Finanzas, Producto y Empleados.',
        commonError: 'Crear 50 dominios el primer día. Comienza con 2 o 3 dominios críticos.',
        realExample: 'El dominio de "Clientes & CRM" fue mapeado para solucionar discrepancias entre Ventas y Facturación.',
        tips: 'Define la criticidad de cada dominio para guiar tus prioridades de seguridad.',
        whyImportant: 'Segmenta el mapa de información de la compañía en bloques manejables con fronteras claras.',
        problemSolved: 'Resuelve la ambigüedad respecto a qué sistema o área es dueña de una entidad de datos.',
        riskMitigated: 'Evita descuidos normativos y fallas en la protección de subconjuntos de datos sensibles.',
        businessBenefit: 'Permite implementar controles de calidad y seguridad priorizados por importancia de negocio.'
      },
      {
        id: 'p1_raci',
        title: 'Diseñar la Matriz RACI Operativa',
        context: 'Define las responsabilidades (R, A, C, I) por proceso clave entre los roles del equipo.',
        expectedResult: 'Configurar y guardar al menos 5 procesos operativos personalizados en tu Matriz RACI.',
        moduleHref: '/team',
        btnLabel: 'Configurar RACI',
        checkTable: 'team_raci_matrix',
        checkKey: 'raci',
        whyDoIt: 'Eliminar confusiones operativas sobre quién toma decisiones y quién ejecuta las tareas.',
        damaGuide: 'R: Responsible, A: Accountable (solo uno por proceso), C: Consulted, I: Informed.',
        commonError: 'Asignar múltiples "A" (Accountable) a un solo proceso. Genera dilución de responsabilidad.',
        realExample: 'En el proceso de "Aprobación de Glosario", el CDO es Accountable y el Steward es Responsible.',
        tips: 'Personaliza los procesos de la matriz por defecto para adaptarlos a tu empresa.',
        whyImportant: 'Determina las reglas de juego operativas y la participación exacta de cada miembro del equipo.',
        problemSolved: 'Soluciona cuellos de botella en la aprobación de cambios en bases de datos y flujos.',
        riskMitigated: 'Mitiga el riesgo de auditoría por falta de controles organizativos documentados sobre el dato.',
        businessBenefit: 'Acelera un 50% los flujos de decisión internos sobre cambios de estructuras de datos.'
      },
      {
        id: 'p1_capacity',
        title: 'Evaluación de Capacidad y Madurez',
        context: 'Evalúa la capacidad de tus recursos y herramientas actuales para operar el gobierno.',
        expectedResult: 'Registrar al menos 1 evaluación de capacidad del equipo.',
        moduleHref: '/team',
        btnLabel: 'Evaluar Capacidad',
        checkTable: 'team_capacity_assessments',
        checkKey: 'capacity',
        whyDoIt: 'Establecer si el equipo tiene el tiempo y las herramientas necesarias para ejecutar sus tareas.',
        damaGuide: 'La capacidad operativa mide la viabilidad de la ejecución de políticas frente a la carga de trabajo diaria.',
        commonError: 'Exigir entregas complejas sin antes capacitar a los Data Stewards.',
        realExample: 'Una empresa de retail evaluó su capacidad en 30%, lo que justificó liberar 4 horas semanales para sus Stewards.',
        tips: 'Registra los comentarios justificando el nivel de madurez y herramientas actuales.',
        whyImportant: 'Valida si los delegados de datos tienen la carga y herramientas suficientes para gobernar.',
        problemSolved: 'Resuelve la sobrecarga laboral de stewards que abandonan sus tareas de gobierno por falta de tiempo.',
        riskMitigated: 'Reduce el riesgo de inoperancia del programa de gobierno por falta de recursos reales.',
        businessBenefit: 'Permite alinear las expectativas de entregas normativas con la capacidad técnica real del equipo.'
      },
      {
        id: 'p1_committees',
        title: 'Constituir el Comité de Gobierno',
        context: 'Crea el órgano de gobierno encargado de resolver conflictos de datos y aprobar políticas.',
        expectedResult: 'Registrar al menos 1 Comité de Gobierno de Datos formal con nombre y descripción corporativa.',
        moduleHref: '/team',
        btnLabel: 'Constituir Comité',
        checkTable: 'gov_committees',
        checkKey: 'committees',
        whyDoIt: 'Formalizar el foro donde el negocio y TI alinean la estrategia de información.',
        damaGuide: 'El Comité de Gobierno de Datos (DGC) sesiona periódicamente y es liderado típicamente por el CDO.',
        commonError: 'Invitar a demasiada gente. Mantén el comité con representantes clave para agilizar decisiones.',
        realExample: 'El Comité Directivo de Datos sesiona mensualmente para autorizar los cambios en la política de confidencialidad.',
        tips: 'Añade una descripción clara del objetivo del comité en tu registro.',
        whyImportant: 'Da validez ejecutiva y respaldo corporativo de alto nivel a todas las directivas de datos.',
        problemSolved: 'Termina con los impasses y desacuerdos de propiedad de datos entre departamentos de la empresa.',
        riskMitigated: 'Evita la falta de alineación estratégica entre TI y la dirección corporativa de negocio.',
        businessBenefit: 'Establece un canal de comunicación ágil para aprobar políticas y estándares globales.'
      }
    ]
  },
  {
    id: 'phase_2',
    number: 2,
    title: 'Políticas, Seguridad y Riesgos',
    objective: 'Formalizar la gobernanza corporativa, evaluar los riesgos de seguridad y establecer controles normativos.',
    importance: 'Garantiza el cumplimiento legal (como GDPR, Habeas Data) y protege los activos más críticos contra incidentes.',
    learning: 'Redacción de directivas normativas, análisis de impacto de riesgos, controles de seguridad.',
    building: 'Políticas corporativas, matriz de riesgos de seguridad, controles de cumplimiento.',
    modulesUsed: 'Políticas, Seguridad y Riesgos.',
    deliverables: 'Manual de Políticas de Datos, Matriz de Riesgos y Controles, Plan de Evidencias.',
    activities: [
      {
        id: 'p2_policies',
        title: 'Políticas de Gobierno de Datos',
        context: 'Crea las directivas que la organización debe seguir para administrar sus activos de información.',
        expectedResult: 'Tener al menos 3 políticas corporativas completas en el módulo.',
        moduleHref: '/policies',
        btnLabel: 'Crear Políticas',
        checkTable: 'data_policies',
        checkKey: 'policies',
        whyDoIt: 'Establecer la obligatoriedad y el marco legal/operativo del uso del dato en la empresa.',
        damaGuide: 'Las políticas deben ser breves, claras y obligatorias. Deben definir qué hacer, no cómo hacerlo.',
        commonError: 'Redactar políticas muy técnicas. El manual de políticas debe entenderse por el negocio.',
        realExample: 'Política de Confidencialidad: "Todo dato sensible de clientes debe enmascararse en entornos de pruebas".',
        tips: 'Completa siempre los campos de versión, objetivo y alcance de la política.',
        whyImportant: 'Establece el reglamento de uso de información obligatorio y auditable para todos los empleados.',
        problemSolved: 'Resuelve la anarquía o inconsistencia operativa en cómo se manejan y modifican los datos.',
        riskMitigated: 'Mitiga el riesgo de multas millonarias por regulaciones locales de privacidad de datos.',
        businessBenefit: 'Garantiza un estándar normativo coherente que habilita la confianza en el intercambio de datos.'
      },
      {
        id: 'p2_workflows',
        title: 'Flujos de Aprobación de Políticas',
        context: 'Define el flujo de revisión y aprobación que debe atravesar toda normativa.',
        expectedResult: 'Registrar al menos 1 flujo de aprobación en el sistema.',
        moduleHref: '/policies',
        btnLabel: 'Crear Flujos',
        checkTable: 'policy_workflows',
        checkKey: 'workflows',
        whyDoIt: 'Garantizar que las políticas no se publiquen sin consenso de TI y del comité.',
        damaGuide: 'El ciclo de vida normativo estándar incluye borrador, revisión legal, aprobación CDO y vigencia.',
        commonError: 'Poner demasiados aprobadores obligatorios en el flujo, paralizando su publicación.',
        realExample: 'Flujo Crítico: Borrador -> Aprobación Legal -> Firma CDO -> Publicado.',
        tips: 'Define flujos más ligeros para estándares operativos y robustos para políticas críticas.',
        whyImportant: 'Garantiza un proceso transparente y auditado para la creación o modificación de políticas.',
        problemSolved: 'Elimina las aprobaciones informales o unilaterales que causan fallas normativas.',
        riskMitigated: 'Previene el riesgo de publicar regulaciones contradictorias o sin sustento técnico.',
        businessBenefit: 'Asegura que las áreas legales, de negocio y TI estén siempre alineadas antes de publicar una norma.'
      },
      {
        id: 'p2_risks',
        title: 'Análisis de Riesgos de Seguridad',
        context: 'Identifica y evalúa los peligros asociados a la pérdida, filtración o mal uso de la información.',
        expectedResult: 'Identificar y documentar al menos 2 riesgos de seguridad de datos.',
        moduleHref: '/security',
        btnLabel: 'Módulo de Seguridad',
        checkTable: 'security_risks',
        checkKey: 'risks',
        whyDoIt: 'Mitigar proactivamente fallos de seguridad y priorizar recursos técnicos.',
        damaGuide: 'El análisis de riesgos cuantifica el impacto y probabilidad para obtener la severidad inherente.',
        commonError: 'No documentar el plan de mitigación. Un riesgo sin plan de acción no sirve.',
        realExample: 'Riesgo: Acceso no autorizado a bases de datos de producción por parte de desarrolladores.',
        tips: 'Asigna un plan de mitigación detallado para cada riesgo registrado.',
        whyImportant: 'Permite visibilizar las amenazas de datos antes de que ocurran brechas catastróficas.',
        problemSolved: 'Termina con la actitud reactiva ante incidentes de ciberseguridad y pérdida de datos.',
        riskMitigated: 'Reduce el riesgo de hackeos, pérdida de información confidencial o divulgación de secretos industriales.',
        businessBenefit: 'Permite optimizar las inversiones de ciberseguridad enfocándolas en las brechas más graves.'
      },
      {
        id: 'p2_controls',
        title: 'Controles y Cumplimiento Normativo',
        context: 'Implementa controles de seguridad alineados a marcos como ISO 27001, GDPR o NIST.',
        expectedResult: 'Implementar al menos 2 controles de cumplimiento normativo.',
        moduleHref: '/security',
        btnLabel: 'Configurar Controles',
        checkTable: 'security_controls',
        checkKey: 'controls',
        whyDoIt: 'Cumplir con las exigencias legales and de auditoría del sector.',
        damaGuide: 'Los controles de seguridad deben estar mapeados a un marco regulatorio y tener evidencias auditables.',
        commonError: 'Mantener controles inactivos o sin estado de evaluación real.',
        realExample: 'Control: Cifrado en tránsito (TLS 1.3) para todas las APIs de datos financieros.',
        tips: 'Mapea cada control a su respectivo marco y asocia el estado de cumplimiento.',
        whyImportant: 'Traduce las políticas abstractas en configuraciones de software e infraestructura obligatorias.',
        problemSolved: 'Soluciona la falta de salvaguardas reales e implementadas para auditar el cumplimiento regulatorio.',
        riskMitigated: 'Disminuye dramáticamente el riesgo de filtraciones y pérdida de integridad en la transmisión de datos.',
        businessBenefit: 'Prepara a la organización para pasar auditorías internacionales (ISO, SOC2) sin contratiempos.'
      },
      {
        id: 'p2_stewardship',
        title: 'Custodia de Políticas y Procedimientos',
        context: 'Asigna custodios (Data Stewards) a las directivas de datos redactadas para garantizar su cumplimiento.',
        expectedResult: 'Registrar al menos 7 políticas en el sistema para evidenciar la delegación de custodia.',
        moduleHref: '/policies',
        btnLabel: 'Asignar Custodia',
        checkTable: 'data_policies',
        checkKey: 'policy_stewardship',
        whyDoIt: 'Garantizar que las políticas tengan un doliente operativo en el negocio que vele por su adopción.',
        damaGuide: 'Cada política de datos debe tener un Data Steward asignado formalmente en el Catálogo de Roles.',
        commonError: 'Dejar políticas huérfanas sin steward que las socialice y verifique.',
        realExample: 'Asignación de la Política de Retención Contable al Steward de Finanzas.',
        tips: 'Asocia cada política con su steward y su canal de comunicación en Slack o Teams.',
        whyImportant: 'Asegura que el manual de políticas no sea letra muerta, sino una guía activa supervisada.',
        problemSolved: 'Elimina el abandono normativo y la falta de supervisión directa de las reglas de datos.',
        riskMitigated: 'Reduce la inoperancia regulatoria por falta de asignación de responsabilidades directas.',
        businessBenefit: 'Mejora del 40% en la tasa de adopción de estándares por parte de los equipos de ingeniería.'
      },
      {
        id: 'p2_privacy_consent',
        title: 'Consentimiento de Privacidad y Controles',
        context: 'Configura las directivas de captura de consentimiento explícito (Opt-in) del cliente para cumplir Habeas Data.',
        expectedResult: 'Implementar al menos 4 controles de seguridad orientados a privacidad y consentimiento.',
        moduleHref: '/security',
        btnLabel: 'Configurar Privacidad',
        checkTable: 'security_controls',
        checkKey: 'privacy_consent',
        whyDoIt: 'Evitar sanciones de entes de control por recolectar o utilizar datos sin autorización legal.',
        damaGuide: 'El gobierno de datos debe asegurar que los metadatos de consentimiento viajen con el registro del cliente.',
        commonError: 'Guardar consentimientos en formatos físicos sueltos o PDF no indexables en base de datos.',
        realExample: 'Control: Consentimiento digital unificado de Habeas Data para clientes e-commerce.',
        tips: 'Crea una columna en la tabla maestra de clientes para el flag digital de autorización.',
        whyImportant: 'Cumple el principio legal de libertad y finalidad en el tratamiento de datos sensibles.',
        problemSolved: 'Resuelve el uso ilícito de datos para campañas publicitarias o analíticas de negocio.',
        riskMitigated: 'Mitiga multas millonarias de superintendencias por denuncias de spam o filtraciones.',
        businessBenefit: 'Construye confianza digital con tus clientes incrementando la lealtad de marca.'
      },
      {
        id: 'p2_mitigation_actions',
        title: 'Remediación de Riesgos de Seguridad',
        context: 'Define planes de contingencia detallados y controles mitigantes para los riesgos críticos identificados.',
        expectedResult: 'Registrar al menos 4 riesgos de seguridad detallando su plan de acción correctivo.',
        moduleHref: '/security',
        btnLabel: 'Remediar Riesgos',
        checkTable: 'security_risks',
        checkKey: 'mitigation_actions',
        whyDoIt: 'Reducir la severidad residual de los riesgos informáticos a un nivel aceptable para la junta.',
        damaGuide: 'DAMA exige que los riesgos de datos se mitiguen mediante controles lógicos, físicos o de proceso.',
        commonError: 'Documentar riesgos sin especificar fechas límite o personas responsables de la remediación.',
        realExample: 'Instalación de tokenización automática para mitigar accesos directos de TI a tarjetas.',
        tips: 'Revisa trimestralmente la efectividad de cada plan de remediación en el comité.',
        whyImportant: 'Transforma un inventario pasivo de amenazas en un plan dinámico de defensa cibernética.',
        problemSolved: 'Soluciona la inactividad operativa ante vulnerabilidades conocidas en la infraestructura.',
        riskMitigated: 'Reduce el impacto financiero y reputacional de ataques por denegación de servicio o ransomware.',
        businessBenefit: 'Protección proactiva del core corporativo reduciendo incidentes severos de seguridad.'
      },
      {
        id: 'p2_normative_audit',
        title: 'Auditoría de Normativas y Cumplimiento',
        context: 'Evalúa el cumplimiento de las políticas publicadas mediante flujos de auditoría periódicos.',
        expectedResult: 'Haber configurado y publicado al menos 3 flujos normativos de aprobación en la plataforma.',
        moduleHref: '/policies',
        btnLabel: 'Auditar Políticas',
        checkTable: 'policy_workflows',
        checkKey: 'normative_audit',
        whyDoIt: 'Certificar ante auditores externos que los flujos de cambio y políticas están vigentes y supervisados.',
        damaGuide: 'La gobernanza requiere auditorías independientes para verificar la efectividad de las directivas.',
        commonError: 'Asumir que las políticas se cumplen solas sin correr procesos periódicos de verificación.',
        realExample: 'Auditoría semestral del flujo de aprobación del glosario con firmas del CDO y Stewards.',
        tips: 'Exporta el historial de logs de flujos de aprobación en formato PDF para el reporte de auditoría.',
        whyImportant: 'Garantiza la trazabilidad legal del ciclo de vida de las políticas de la organización.',
        problemSolved: 'Evita fallos normativos graves por la existencia de políticas desactualizadas o ignoradas.',
        riskMitigated: 'Mitiga el riesgo de pérdida de certificaciones de calidad (ISO 9001, 27001) por falta de traza.',
        businessBenefit: 'Otorga transparencia total ante socios e inversionistas sobre la madurez regulatoria del negocio.'
      }
    ]
  },
  {
    id: 'phase_3',
    number: 3,
    title: 'Calidad y Metadatos',
    objective: 'Catalogar la información de la empresa, documentar diccionarios, establecer linaje y reglas de calidad.',
    importance: 'Permite a los usuarios buscar datos confiables rápidamente y asegura que el negocio use datos correctos.',
    learning: 'Modelos de diccionario de datos, reglas lógicas de calidad, catalogación inteligente de metadatos.',
    building: 'Catálogo de activos, diccionarios de negocio, linaje semántico y reglas de validación.',
    modulesUsed: 'Catálogo, Calidad de Datos, Metadatos.',
    deliverables: 'Catálogo de Activos de Información, Diccionario de Datos de Calidad, Reglas de Limpieza.',
    activities: [
      {
        id: 'p3_connections',
        title: 'Conexiones de Catálogo',
        context: 'Registra los orígenes de datos (bases de datos, APIs, archivos) en el Catálogo.',
        expectedResult: 'Registrar al menos 2 orígenes o conexiones de datos en el Catálogo.',
        moduleHref: '/catalog',
        btnLabel: 'Gestionar Catálogo',
        checkTable: 'data_connections',
        checkKey: 'connections',
        whyDoIt: 'Tener una única fuente de verdad sobre dónde residen los datos físicos.',
        damaGuide: 'La catalogación debe incluir metadatos técnicos, operativos y de negocio de cada origen.',
        commonError: 'Conectar directamente entornos productivos sin control de accesos.',
        realExample: 'Conexión: Data Warehouse Corporativo (Snowflake) y Base de Transacciones (PostgreSQL).',
        tips: 'Clasifica el tipo de base de datos para facilitar búsquedas automáticas.',
        whyImportant: 'Crea el mapa de conectividad técnica a todas las bases de datos de la empresa.',
        problemSolved: 'Resuelve el caos de no saber dónde o en qué servidores están almacenados los datos críticos.',
        riskMitigated: 'Evita la proliferación de bases de datos "huérfanas" o desprotegidas por falta de inventario.',
        businessBenefit: 'Permite centralizar el descubrimiento y extracción automática de metadatos técnicos.'
      },
      {
        id: 'p3_assets',
        title: 'Activos de Datos Catalogados',
        context: 'Registra las tablas o esquemas de datos clave dentro de tus conexiones catalogadas.',
        expectedResult: 'Importar y catalogar al menos 4 activos de datos estructurados.',
        moduleHref: '/catalog',
        btnLabel: 'Importar Activos',
        checkTable: 'data_assets',
        checkKey: 'assets',
        whyDoIt: 'Hacer visibles los datos relevantes para que los científicos y analistas los consuman de forma segura.',
        damaGuide: 'Los activos de datos deben clasificarse según su valor e impacto corporativo.',
        commonError: 'Catalogar millones de tablas temporales. Solo cataloga datos con valor de negocio.',
        realExample: 'Activo: `dim_clientes_gold` en el Data Lake corporativo.',
        tips: 'Define quién es el Data Owner del activo al momento de registrarlo.',
        whyImportant: 'Inventaría las tablas y archivos de datos críticos con valor analítico o regulatorio.',
        problemSolved: 'Evita que los analistas de negocio pierdan días buscando qué tabla contiene la información de ventas.',
        riskMitigated: 'Previene el almacenamiento y uso de tablas obsoletas o duplicadas en la toma de decisiones.',
        businessBenefit: 'Promueve el autoservicio de datos (Self-Service Analytics) aumentando la productividad.'
      },
      {
        id: 'p3_rules',
        title: 'Reglas de Calidad Activas',
        context: 'Configura reglas de negocio para validar la consistencia, completitud y unicidad de los datos.',
        expectedResult: 'Configurar al menos 3 reglas de calidad activas en tus activos.',
        moduleHref: '/quality',
        btnLabel: 'Crear Reglas',
        checkTable: 'quality_rules',
        checkKey: 'rules',
        whyDoIt: 'Detectar anomalías de datos antes de que afecten a los reportes de decisiones directivas.',
        damaGuide: 'Las dimensiones de calidad básicas de DAMA son Exactitud, Completitud, Consistencia, Unicidad, Validez y Oportunidad.',
        commonError: 'Definir reglas imposibles que bloqueen transacciones reales (ej. "el teléfono de cliente nunca puede estar vacío").',
        realExample: 'Regla: El correo electrónico debe cumplir con la expresión regular estándar del dominio de la empresa.',
        tips: 'Asocia cada regla a un activo físico específico en el catálogo.',
        whyImportant: 'Define el límite matemático de aceptación para la veracidad de la información analizada.',
        problemSolved: 'Soluciona la entrada de datos basura (registros vacíos, nulos, mal formateados) a los sistemas.',
        riskMitigated: 'Mitiga el riesgo de tomar decisiones estratégicas de precios o inventario basadas en reportes erróneos.',
        businessBenefit: 'Asegura que el Data Lake contenga información confiable y limpia para alimentar modelos de IA.'
      },
      {
        id: 'p3_fields',
        title: 'Diccionario y Linaje Técnico',
        context: 'Documenta los campos internos de tus activos detallando tipo de dato, linaje y sensibilidad.',
        expectedResult: 'Documentar al menos 4 campos con linaje y sensibilidad en el diccionario.',
        moduleHref: '/metadata',
        btnLabel: 'Diccionario de Datos',
        checkTable: 'asset_fields',
        checkKey: 'fields',
        whyDoIt: 'Ayudar a los usuarios técnicos a comprender la estructura y sensibilidad (PII) de los datos.',
        damaGuide: 'El linaje rastrea los datos desde su origen técnico hasta su consumo en los reportes.',
        commonError: 'Omitir la clasificación de datos sensibles, exponiendo información confidencial.',
        realExample: 'Campo: `customer_ssn` clasificado como "PII / Altamente Confidencial" con origen en el sistema core.',
        tips: 'Documenta la descripción de los campos para evitar malinterpretaciones matemáticas en reportes.',
        whyImportant: 'Describe a nivel de campo qué significa cada dato, su origen y su clasificación de confidencialidad.',
        problemSolved: 'Termina con la confusión de los desarrolladores sobre qué columnas contienen información restringida.',
        riskMitigated: 'Previene fugas accidentales al identificar exactamente qué columnas almacenan contraseñas o PII.',
        businessBenefit: 'Facilita la gobernanza técnica de bases de datos acelerando integraciones de software.'
      },
      {
        id: 'p3_catalog_classification',
        title: 'Clasificación de Criticidad de Datos',
        context: 'Categoriza tus activos de información importados según su sensibilidad ante fugas (PII, PCI, Confidencial).',
        expectedResult: 'Tener al menos 8 activos clasificados formalmente con etiquetas de criticidad en el Catálogo.',
        moduleHref: '/catalog',
        btnLabel: 'Clasificar Activos',
        checkTable: 'data_assets',
        checkKey: 'catalog_classification',
        whyDoIt: 'Aplicar controles de enmascaramiento y accesos estrictos priorizando las tablas más críticas.',
        damaGuide: 'La taxonomía de datos debe dividir los activos en públicos, restringidos y confidenciales para seguridad de datos.',
        commonError: 'Catalogar todos los activos como confidenciales, ralentizando los accesos legítimos de BI.',
        realExample: 'Clasificación de la tabla `core_tarjetas_credito` como Altamente Crítica (PCI).',
        tips: 'Utiliza el glosario de términos para asociar automáticamente clasificaciones de sensibilidad.',
        whyImportant: 'Determina las salvaguardas de cifrado y auditoría a nivel de tabla según su criticidad.',
        problemSolved: 'Evita accesos accidentales a datos reservados por analistas no autorizados.',
        riskMitigated: 'Minimiza la superficie de ataque limitando la visibilidad de datos sensibles del cliente.',
        businessBenefit: 'Cumplimiento del 100% en auditorías de protección de datos personales a nivel de activos.'
      },
      {
        id: 'p3_lineage_mapping',
        title: 'Mapeo de Linaje Técnico Completo',
        context: 'Documenta el flujo del dato desde su origen físico en la base de datos origen hasta el reporte final.',
        expectedResult: 'Completar la documentación de linaje técnico para al menos 8 campos de base de datos.',
        moduleHref: '/metadata',
        btnLabel: 'Trazar Linaje',
        checkTable: 'asset_fields',
        checkKey: 'lineage_mapping',
        whyDoIt: 'Entender el impacto de cambiar una columna de base de datos en los reportes de los directivos.',
        damaGuide: 'El linaje de datos representa el flujo histórico (origen, transformación, destino) de la información.',
        commonError: 'Dibujar linajes parciales que omiten transformaciones complejas en el pipeline ETL.',
        realExample: 'Linaje: `Postgres.transacciones.monto` -> `ETL` -> `Snowflake.fact_ventas.total`.',
        tips: 'Registra los nombres de los esquemas y las ETLs en la descripción del campo en el diccionario.',
        whyImportant: 'Permite hacer análisis de impacto ágiles antes de realizar migraciones o refactorizaciones.',
        problemSolved: 'Resuelve descuadres contables rastreando exactamente dónde se modificó o alteró un valor.',
        riskMitigated: 'Evita reportes directivos rotos o vacíos por la eliminación inadvertida de columnas en origen.',
        businessBenefit: 'Reducción del 70% en tiempos de soporte técnico de bases de datos e integraciones.'
      },
      {
        id: 'p3_rules_dimensions',
        title: 'Dimensiones de Calidad Avanzadas',
        context: 'Crea reglas lógicas para validar dimensiones complejas de DAMA como consistencia referencial y precisión.',
        expectedResult: 'Tener al menos 7 reglas de calidad activas cubriendo múltiples dimensiones.',
        moduleHref: '/quality',
        btnLabel: 'Reglas Avanzadas',
        checkTable: 'quality_rules',
        checkKey: 'rules_dimensions',
        whyDoIt: 'Superar la validación básica de nulos y validar reglas lógicas cruzadas de negocio.',
        damaGuide: 'DAMA recomienda aplicar perfiles de calidad sobre consistencia e integridad referencial cruzada.',
        commonError: 'Crear reglas redundantes que ralentizan los procesos de escaneo sin aportar valor.',
        realExample: 'Regla: Si `estado_cuenta` es "Activo", `saldo_disponible` no puede ser negativo.',
        tips: 'Asocia las reglas lógicas a campos calculados para auditar su consistencia matemática.',
        whyImportant: 'Garantiza la congruencia lógica de los datos de negocio en múltiples tablas.',
        problemSolved: 'Elimina registros contradictorios que confunden a los directores en los dashboards.',
        riskMitigated: 'Previene pérdidas de inventario físico por descuadres de stock lógicos no validados.',
        businessBenefit: 'Genera información impecable y consistente para alimentar algoritmos de inteligencia artificial.'
      },
      {
        id: 'p3_source_types',
        title: 'Homologación de Orígenes de Datos',
        context: 'Configura y cataloga conexiones físicas a diferentes tecnologías de bases de datos corporativas.',
        expectedResult: 'Registrar y homologar al menos 4 orígenes o conexiones de datos en el sistema.',
        moduleHref: '/catalog',
        btnLabel: 'Homologar Orígenes',
        checkTable: 'data_connections',
        checkKey: 'source_types',
        whyDoIt: 'Unificar el catálogo técnico independientemente de si los datos están en SQL Server, Snowflake o APIs.',
        damaGuide: 'El catálogo de metadatos corporativo debe unificar todas las fuentes críticas de la compañía.',
        commonError: 'Excluir servidores legacy del catálogo, manteniendo silos de datos ciegos al gobierno.',
        realExample: 'Conexión a Oracle Contable, Snowflake Warehouse y MongoDB transaccional en la nube.',
        tips: 'Utiliza nombres estandarizados en las conexiones para categorizarlas por entorno (QA, Prod).',
        whyImportant: 'Establece la infraestructura del inventario del patrimonio de datos de la empresa.',
        problemSolved: 'Termina con la fragmentación de la información unificando la vista del equipo tecnológico.',
        riskMitigated: 'Previene la brecha de ciberseguridad sobre motores de datos antiguos no inventariados.',
        businessBenefit: 'Permite un gobierno ágil en arquitecturas multi-nube y entornos híbridos complejos.'
      }
    ]
  },
  {
    id: 'phase_4',
    number: 4,
    title: 'Operación y Madurez',
    objective: 'Orquestar las solicitudes operativas (workflows), monitorear incidentes históricos y evaluar el roadmap final.',
    importance: 'Asegura que el gobierno funcione día a día de manera fluida y demuestra a la dirección el retorno de inversión.',
    learning: 'Flujos operativos de cambio, gestión de incidentes de seguridad/calidad, análisis ejecutivo de métricas.',
    building: 'Flujos de trabajo resueltos, bitácora de incidentes de datos y reporte ejecutivo de madurez.',
    modulesUsed: 'Workflows, Calidad de Datos, Seguridad, Madurez.',
    deliverables: 'Reporte Ejecutivo CDO, Plan de Acción de Incidentes, Certificado de Adopción.',
    activities: [
      {
        id: 'p4_workflows',
        title: 'Operación de Flujos de Trabajo',
        context: 'Resuelve solicitudes de cambio (creación de términos, accesos, cambios en políticas) mediante flujos.',
        expectedResult: 'Generar al menos 2 flujos de trabajo operativos con estado Aprobado, Cerrado o Completado.',
        moduleHref: '/workflows',
        btnLabel: 'Gestionar Solicitudes',
        checkTable: 'workflow_requests',
        checkKey: 'workflows_op',
        whyDoIt: 'Controlar de forma auditable los cambios en el ecosistema normativo y técnico de datos.',
        damaGuide: 'La gobernanza operativa exige flujos documentados con firmas de aprobación digitalizadas.',
        commonError: 'Dejar tickets pendientes eternamente sin SLA asignado.',
        realExample: 'Solicitud: "Aprobación de nuevo término de Glosario para Margen Operativo" aprobada por el Steward.',
        tips: 'Configura flujos simples para evitar cuellos de botella en la operación diaria.',
        whyImportant: 'Ejecuta y automatiza las solicitudes del día a día (acceso, cambios, nuevos glosarios).',
        problemSolved: 'Evita correos informales e instrucciones sueltas que modifican tablas o políticas sin trazabilidad.',
        riskMitigated: 'Mitiga el riesgo de cambios no autorizados en los metadatos o políticas vigentes.',
        businessBenefit: 'Consolida una bitácora auditable de todas las aprobaciones y cambios en el ecosistema de datos.'
      },
      {
        id: 'p4_quality_incidents',
        title: 'Gestión de Incidentes (Calidad)',
        context: 'Registra y realiza el seguimiento de fallas en la calidad de la información para su corrección.',
        expectedResult: 'Registrar y realizar el seguimiento de al menos 2 incidentes de calidad.',
        moduleHref: '/quality',
        btnLabel: 'Panel de Incidentes',
        checkTable: 'quality_incidents',
        checkKey: 'quality_incidents',
        whyDoIt: 'Trazar el ciclo de vida de los problemas de datos desde su detección hasta su mitigación.',
        damaGuide: 'La gestión de problemas de calidad de datos debe incluir análisis de causa raíz y planes correctivos.',
        commonError: 'Cerrar incidentes sin documentar cómo se solucionó la falla.',
        realExample: 'Incidente: Carga duplicada de facturas en el ERP de ventas debido a una falla en el proceso de integración nocturno.',
        tips: 'Asigna siempre una criticidad y un responsable a cada incidente detectado.',
        whyImportant: 'Establece la mesa de ayuda técnica para corregir errores reportados en las bases de datos.',
        problemSolved: 'Resuelve la inacción y la frustración de las áreas cuando detectan que un dato de ventas está mal.',
        riskMitigated: 'Evita pérdidas financieras por cobros erróneos o facturaciones duplicadas.',
        businessBenefit: 'Mejora continua en los reportes mediante la solución definitiva de las causas raíz de los errores.'
      },
      {
        id: 'p4_security_incidents',
        title: 'Gestión de Incidentes (Seguridad)',
        context: 'Registra incidentes de seguridad o accesos indebidos para auditar fugas de información.',
        expectedResult: 'Registrar al menos 2 incidentes de seguridad en el sistema.',
        moduleHref: '/security',
        btnLabel: 'Incidentes de Seguridad',
        checkTable: 'security_incidents',
        checkKey: 'security_incidents',
        whyDoIt: 'Mantener un registro auditable de brechas de seguridad conforme a normativas de protección de datos.',
        damaGuide: 'El registro oportuno de brechas de datos es obligatorio bajo regulaciones como GDPR.',
        commonError: 'Ignorar o demorar la documentación de brechas leves.',
        realExample: 'Incidente: Intento de acceso masivo a base de datos de clientes desde una dirección IP no autorizada.',
        tips: 'Documenta la acción inmediata de mitigación para reducir el riesgo en futuras auditorías.',
        whyImportant: 'Registra eventos de hackeos, intrusiones o uso inadecuado de privilegios de usuario.',
        problemSolved: 'Resuelve la falta de un log oficial ante eventos anómalos o vulnerabilidades explotadas.',
        riskMitigated: 'Mitiga el impacto de multas regulatorias al demostrar que la empresa actúa de forma transparente ante incidentes.',
        businessBenefit: 'Previene la recurrencia de ataques mejorando la infraestructura ante cada incidente cerrado.'
      },
      {
        id: 'p4_monitoring_history',
        title: 'Monitoreo Histórico de Calidad',
        context: 'Genera el historial de salud de tus activos para entender la evolución de su calidad.',
        expectedResult: 'Generar al menos 2 registros en el historial de monitoreo de calidad.',
        moduleHref: '/quality',
        btnLabel: 'Historial de Salud',
        checkTable: 'quality_monitoring_history',
        checkKey: 'monitoring_history',
        whyDoIt: 'Demostrar que los esfuerzos de gobierno reducen los niveles de error a lo largo del tiempo.',
        damaGuide: 'El monitoreo continuo genera los KPIs ejecutivos para medir el progreso del gobierno de datos.',
        commonError: 'Realizar mediciones ad-hoc sin consistencia temporal.',
        realExample: 'Historial: El activo `facturas_mensuales` subió del 78% al 96% de calidad en los últimos tres meses.',
        tips: 'Automatiza la recolección del score histórico para evitar reportes desactualizados.',
        whyImportant: 'Muestra a la gerencia el gráfico de tendencias de mejora en los activos de datos críticos.',
        problemSolved: 'Resuelve la duda existencial de si la gobernanza de datos está realmente dando frutos prácticos.',
        riskMitigated: 'Previene la degradación silenciosa de la calidad de las tablas clave de la compañía.',
        businessBenefit: 'Sirve como justificación irrefutable del éxito del programa de gobierno ante la junta directiva.'
      },
      {
        id: 'p4_workflows_sla',
        title: 'Acuerdos de Niveles de Servicio (SLA)',
        context: 'Monitorea los tiempos de respuesta y cierre de solicitudes en tus flujos de trabajo operativos.',
        expectedResult: 'Tener al menos 4 flujos resueltos en el sistema para auditar los SLAs de atención del equipo.',
        moduleHref: '/workflows',
        btnLabel: 'Auditar SLAs',
        checkTable: 'workflow_requests',
        checkKey: 'workflows_sla',
        whyDoIt: 'Asegurar que el gobierno no sea un cuello de botella y responda con agilidad al negocio.',
        damaGuide: 'Los SLAs del gobierno de datos deben medir la velocidad en otorgar accesos y aprobar términos.',
        commonError: 'Ignorar los cuellos de botella en la mesa de ayuda, desincentivando el uso de flujos gobernados.',
        realExample: 'Tiempo promedio de aprobación de acceso reducido de 5 días a 4 horas.',
        tips: 'Define notificaciones automáticas para alertar sobre solicitudes estancadas.',
        whyImportant: 'Garantiza la operatividad y eficiencia de la oficina del CDO frente a las áreas de negocio.',
        problemSolved: 'Evita demoras excesivas en proyectos analíticos por falta de aprobaciones a tiempo.',
        riskMitigated: 'Mitiga el riesgo de elusión de canales de gobierno por parte de TI debido a demoras administrativas.',
        businessBenefit: 'Mejora del 60% en la percepción de agilidad del equipo de datos por parte de la empresa.'
      },
      {
        id: 'p4_quality_remediation',
        title: 'Plan de Remediación de Calidad',
        context: 'Ejecuta y documenta planes correctivos de causa raíz sobre incidentes de calidad reportados.',
        expectedResult: 'Registrar y remediar formalmente al menos 4 incidentes de calidad de datos en la mesa.',
        moduleHref: '/quality',
        btnLabel: 'Mesa de Calidad',
        checkTable: 'quality_incidents',
        checkKey: 'quality_remediation',
        whyDoIt: 'Cerrar de forma auditable los incidentes de calidad impidiendo que se repitan en producción.',
        damaGuide: 'La remediación de calidad requiere documentar la acción definitiva de solución y la regla preventiva.',
        commonError: 'Marcar incidentes como resueltos aplicando parches manuales sin corregir el pipeline origen.',
        realExample: 'Cierre del incidente de SKUs nulos tras implementar validación obligatoria en el ERP.',
        tips: 'Asocia el incidente con la regla de calidad que lo detectó para automatizar el cierre.',
        whyImportant: 'Garantiza que el equipo ejecute mejoras definitivas en el software y en las bases de datos.',
        problemSolved: 'Acaba con los reportes financieros erróneos recurrentes que dañan los cierres mensuales.',
        riskMitigated: 'Previene multas fiscales por el envío involuntario de reportes de impuestos con valores nulos.',
        businessBenefit: 'Reducción del 80% en la reincidencia de fallas graves en las bases de datos core.'
      },
      {
        id: 'p4_security_mitigation',
        title: 'Contención de Incidentes de Seguridad',
        context: 'Registra las acciones inmediatas de bloqueo y los controles preventivos aplicados tras un incidente de seguridad.',
        expectedResult: 'Registrar e implementar medidas de contención para al menos 4 incidentes de seguridad.',
        moduleHref: '/security',
        btnLabel: 'Contención Seguridad',
        checkTable: 'security_incidents',
        checkKey: 'security_mitigation',
        whyDoIt: 'Cumplir con el reporte oficial de brechas de datos exigido por regulaciones de Habeas Data.',
        damaGuide: 'El registro de incidentes de seguridad debe incluir impacto de negocio y controles de mitigación.',
        commonError: 'Ocultar incidentes leves por temor a represalias de auditoría.',
        realExample: 'Bloqueo de IP sospechosa e implementación de autenticación MFA obligatoria en bases de datos.',
        tips: 'Detalla siempre el impacto a datos sensibles PII en la bitácora del incidente.',
        whyImportant: 'Garantiza la transparencia institucional ante fugas e intrusiones de ciberseguridad.',
        problemSolved: 'Resuelve la falta de documentación forense ante vulnerabilidades cibernéticas explotadas.',
        riskMitigated: 'Mitiga demandas civiles y multas penales al demostrar debida diligencia de control.',
        businessBenefit: 'Fortalecimiento continuo del perímetro de datos corporativos ante cada ataque frustrado.'
      },
      {
        id: 'p4_monitoring_runs',
        title: 'Ejecución de Monitoreo Continuo',
        context: 'Programar y registrar corridas del motor de calidad de datos para medir el score global en el tiempo.',
        expectedResult: 'Tener al menos 4 registros históricos secuenciales en el monitoreo de calidad.',
        moduleHref: '/quality',
        btnLabel: 'Monitorear Calidad',
        checkTable: 'quality_monitoring_history',
        checkKey: 'monitoring_runs',
        whyDoIt: 'Visualizar tendencias reales en el tablero de control de salud de datos corporativos.',
        damaGuide: 'El monitoreo periódico de métricas de calidad de datos proporciona los KPIs para evaluar la madurez.',
        commonError: 'Ejecutar las reglas una sola vez y no volver a evaluar las bases de datos de forma sistemática.',
        realExample: 'Corrida semanal automatizada registrando la subida de calidad del 82% al 98% en clientes.',
        tips: 'Configura alertas para que el CDO reciba un correo si el score de calidad baja del 90%.',
        whyImportant: 'Permite detectar degradaciones de datos antes de que los reportes lleguen a la junta.',
        problemSolved: 'Termina con la incertidumbre gerencial sobre si las bases de datos están limpiándose.',
        riskMitigated: 'Reduce la exposición a tomar malas decisiones corporativas por reportes de calidad corruptos.',
        businessBenefit: 'Certificación de veracidad de la información analítica de la empresa ante inversionistas.'
      }
    ]
  }
];

const MENTOR_GUIDES: Record<string, {
  purpose: string;
  stepByStep: string[];
  suggestedCases: { name: string; desc: string }[];
  governanceProgress: string;
  flowchart: string;
}> = {
  p1_dama: {
    purpose: "Establecer la línea base (GAP Analysis) de madurez de datos para saber dónde comenzar y justificar la asignación de presupuestos.",
    stepByStep: [
      "Ingresa a 'Command Center 360°' mediante el menú lateral.",
      "Selecciona el pilar DAMA y completa las preguntas del cuestionario.",
      "Sé honesto y califica de manera conservadora (muchas veces Nivel 1) para representar los vacíos iniciales.",
      "Haz clic en Guardar Diagnóstico para registrar la evidencia."
    ],
    suggestedCases: [
      { name: "Diagnóstico Inicial de Madurez DAMA", desc: "Evaluación inicial de las 11 disciplinas DAMA indicando madurez Nivel 1 (Inicial/Reactivo) debido a falta de roles formales." }
    ],
    governanceProgress: "Representa el 5% inicial del proceso. Sin una línea base, no se puede estructurar un plan estratégico o medir el ROI.",
    flowchart: "Iniciar Cuestionario ➔ Responder 11 Disciplinas ➔ Calcular Score Global ➔ Guardar en Base de Datos"
  },
  p1_findings: {
    purpose: "Traducir los resultados numéricos del diagnóstico en problemas reales con impacto en el negocio.",
    stepByStep: [
      "Ve a la sección de Hallazgos en el Command Center.",
      "Registra un mínimo de 5 hallazgos críticos basados en tu diagnóstico inicial.",
      "Asegúrate de describir el dolor del negocio y la severidad (ej. Alta, Crítica)."
    ],
    suggestedCases: [
      { name: "Descuadre contable transaccional", desc: "Falta de conciliación diaria de SKUs de inventario entre e-commerce y ERP físico." },
      { name: "Ausencia de dueños de datos", desc: "No se cuenta con Data Stewards asignados para el dominio de clientes, generando registros duplicados." },
      { name: "Uso indebido de PII", desc: "Uso de datos reales de clientes en entornos de desarrollo sin políticas de enmascaramiento." }
    ],
    governanceProgress: "Aumenta la madurez al 10%. Convierte métricas abstractas en un inventario de riesgos y brechas priorizadas.",
    flowchart: "Identificar Brecha ➔ Clasificar por Severidad ➔ Documentar Causa y Efecto ➔ Registrar Hallazgo"
  },
  p1_roadmaps: {
    purpose: "Establecer hitos cronológicos claros y metas a corto y largo plazo para cerrar las brechas identificadas.",
    stepByStep: [
      "Navega a la pestaña de Roadmap dentro del Command Center.",
      "Crea al menos 4 hitos secuenciales especificando la fase y fecha estimada.",
      "Mapea los hitos empezando por Quick Wins (ej. Roles y RACI) en los primeros 3 meses."
    ],
    suggestedCases: [
      { name: "Fase 1: Asignación de Roles y RACI (Q1)", desc: "Establecer la estructura organizativa inicial y los Data Owners de los dominios críticos." },
      { name: "Fase 2: Catálogo y Diccionario Técnico (Q2)", desc: "Mapear las fuentes transaccionales principales en Snowflake o Postgres." },
      { name: "Fase 3: Reglas de Calidad y Workflows (Q3)", desc: "Implementar monitoreo de calidad automático y mesa de ayuda de gobierno." }
    ],
    governanceProgress: "Avanza al 15% del proceso. Alinea las expectativas de los patrocinadores financieros con entregables trimestrales.",
    flowchart: "Definir Objetivos ➔ Dividir en Fases (Trimestres) ➔ Asignar Hitos ➔ Guardar Cronograma"
  },
  p1_roles: {
    purpose: "Asignar las responsabilidades del gobierno para que los datos tengan dueños y custodios formales en la organización.",
    stepByStep: [
      "Ve al menú 'Roles y Equipo'.",
      "Haz clic en 'Agregar Miembro' y llena los campos: Nombre, Correo, Área y Rol.",
      "Asegúrate de tener al menos 5 miembros, asignando obligatoriamente los roles de CDO, Data Owner, Data Steward y Data Custodian."
    ],
    suggestedCases: [
      { name: "Juan Pérez (CDO)", desc: "Líder del programa global de gobierno de datos corporativo." },
      { name: "María Rodríguez (Data Owner de Clientes)", desc: "Directora de Marketing, responsable final por el dominio de Clientes." },
      { name: "Carlos Gómez (Data Steward de Clientes)", desc: "Líder de Operaciones, valida la calidad en la captura de registros del CRM." }
    ],
    governanceProgress: "Avanza al 25%. Es el pilar fundamental; sin personas asignadas a roles específicos, no hay quién apruebe políticas o corrija incidentes.",
    flowchart: "Identificar Perfil ➔ Asignar Rol DAMA ➔ Definir Dominio de Cobertura ➔ Guardar Ficha de Miembro"
  },
  p1_domains: {
    purpose: "Definir los límites lógicos de los datos del negocio para evitar duplicidades y asignar responsabilidades claras.",
    stepByStep: [
      "Ve a 'Roles y Equipo' ➔ pestaña 'Dominios de Datos'.",
      "Crea al menos 3 dominios de datos propios que no correspondan a los valores semilla preestablecidos.",
      "Asigna un Data Owner y describe detalladamente su alcance."
    ],
    suggestedCases: [
      { name: "Información de Historias Clínicas (Sensible)", desc: "Datos de diagnósticos, antecedentes y tratamientos del área médica." },
      { name: "SKUs de Catálogo de Productos", desc: "Códigos de barra, descripciones y precios oficiales en los canales digitales." },
      { name: "Datos Financieros IFRS", desc: "Saldos de cuentas y partidas de contabilidad consolidada para reportes." }
    ],
    governanceProgress: "Llega al 30% del progreso. Delimita la propiedad del dato evitando conflictos sobre quién debe dar permisos o arreglar la calidad.",
    flowchart: "Delimitar Información de Negocio ➔ Nombrar Dominio ➔ Vincular Data Owner ➔ Registrar Dominio"
  },
  p1_raci: {
    purpose: "Establecer la matriz de responsabilidades operativa (RACI) para saber quién ejecuta, quién aprueba, quién es consultado e informado.",
    stepByStep: [
      "Ve a 'Roles y Equipo' ➔ pestaña 'Matriz RACI'.",
      "Personaliza al menos 7 procesos lógicos operativos, configurando los roles responsables (R, A, C, I)."
    ],
    suggestedCases: [
      { name: "Aprobación de Glosario Técnico", desc: "Owner: Accountable, Steward: Responsible, Custodian: Consulted, Analyst: Informed." }
    ],
    governanceProgress: "Llega al 35%. Evita la parálisis por falta de toma de decisiones o duplicidad de funciones operativas.",
    flowchart: "Identificar Proceso de Datos ➔ Asignar Responsables (R, A, C, I) ➔ Guardar Configuración de Matriz"
  },
  p1_capacity: {
    purpose: "Medir las competencias de la organización en infraestructura y herramientas de datos para planificar la capacitación necesaria.",
    stepByStep: [
      "Ve a 'Roles y Equipo' ➔ pestaña 'Evaluación de Capacidad'.",
      "Registra un mínimo de 2 evaluaciones de capacidad del equipo en herramientas de BI, bases de datos o gobernanza."
    ],
    suggestedCases: [
      { name: "Capacitación en Gobierno de Datos DAMA", desc: "Evaluar el nivel de conocimiento del estándar DAMA-DMBOK en el equipo de analistas." }
    ],
    governanceProgress: "Llega al 40%. Asegura que el equipo tiene el entrenamiento y software requeridos para sostener la estrategia.",
    flowchart: "Definir Habilidad a Evaluar ➔ Calificar Nivel del Equipo ➔ Guardar Evaluación de Capacidad"
  },
  p1_committees: {
    purpose: "Instaurar el consejo directivo formal que sesionará periódicamente para aprobar políticas y arbitrar desacuerdos de datos.",
    stepByStep: [
      "Ve a 'Roles y Equipo' ➔ pestaña 'Comités de Gobierno'.",
      "Registra al menos 2 comités formales de gobierno de datos."
    ],
    suggestedCases: [
      { name: "Comité Directivo de Gobierno de Datos (Mensual)", desc: "Sesión conformada por CDO, CIO y Directores de Negocio para aprobación de políticas." }
    ],
    governanceProgress: "Completa la fase de Fundamentos (45%). Otorga el respaldo y la autoridad legal y directiva a todo el programa de gobierno.",
    flowchart: "Definir Miembros del Comité ➔ Establecer Periodicidad de Sesiones ➔ Guardar y Formalizar Comité"
  },
  p2_policies: {
    purpose: "Definir las normas de comportamiento corporativo que garantizan la integridad, privacidad, seguridad y calidad de los datos.",
    stepByStep: [
      "Accede al módulo 'Políticas y Workflows' ➔ pestaña 'Crear Política'.",
      "Crea al menos 5 políticas con campos completos: Nombre, Alcance, Justificación, Estado (Borrador/Vigente) y Origen.",
      "Asegúrate de que sean de negocio e innovadoras (excluye plantillas estándar)."
    ],
    suggestedCases: [
      { name: "Política de Privacidad y Enmascaramiento PII", desc: "Dicta que toda base de datos en entornos de staging o QA debe cifrarse o enmascararse, cumpliendo con Habeas Data." },
      { name: "Política de Clasificación de Criticidad", desc: "Clasifica los activos de datos en Públicos, Confidenciales y Altamente Restringidos para aplicar controles de acceso." },
      { name: "Política de Retención y Purga de Logs Contables", desc: "Establece que los logs de auditoría transaccionales se almacenan por 365 días en caliente y luego se purgan automáticamente." }
    ],
    governanceProgress: "Eleva la madurez al 55%. Define las reglas de juego corporativas que toda la organización y sistemas de TI deben cumplir obligatoriamente.",
    flowchart: "Redactar Borrador de Política ➔ Definir Alcance y Justificación ➔ Asignar Estado de Revisión ➔ Publicar y Registrar"
  },
  p2_workflows: {
    purpose: "Garantizar que ninguna política o cambio crítico se publique en producción sin el proceso formal de revisión y aprobación del Data Steward y Data Owner.",
    stepByStep: [
      "Ve a 'Políticas y Workflows' ➔ pestaña 'Flujos de Aprobación'.",
      "Registra al menos 2 flujos lógicos con sus pasos y responsables."
    ],
    suggestedCases: [
      { name: "Flujo de Publicación de Políticas de Privacidad", desc: "Paso 1: Revisión por Oficial de Privacidad (Steward) ➔ Paso 2: Aprobación Legal ➔ Paso 3: Firma del CDO (Owner)." }
    ],
    governanceProgress: "Llega al 60%. Evita la anarquía regulando y auditando el proceso de publicación de cambios en la empresa.",
    flowchart: "Crear Solicitud de Aprobación ➔ Revisión de Stewards ➔ Visto Bueno de Owners ➔ Aprobación y Trazabilidad"
  },
  p2_risks: {
    purpose: "Identificar y clasificar amenazas de seguridad física o lógica sobre los activos de datos sensibles para planificar controles preventivos.",
    stepByStep: [
      "Ve al módulo 'Seguridad y Riesgos' ➔ pestaña 'Matriz de Riesgos'.",
      "Registra mínimo 3 riesgos de seguridad con criticidad, probabilidad e impacto de negocio claros."
    ],
    suggestedCases: [
      { name: "Acceso no supervisado a logs de tarjetas de crédito", desc: "Fuga potencial de credenciales de tarjetas de crédito PCI-DSS en servidores de staging." },
      { name: "Modificación no autorizada de calificaciones", desc: "Docentes o atacantes alterando notas de egresados directamente en la base de datos sin traza." }
    ],
    governanceProgress: "Alcanza el 65% de madurez. Minimiza la exposición legal y reputacional de la empresa ante fugas de información.",
    flowchart: "Identificar Amenaza en Activos ➔ Calificar Impacto y Probabilidad ➔ Registrar en la Matriz de Riesgo"
  },
  p2_controls: {
    purpose: "Implementar medidas técnicas de ciberseguridad obligatorias asociadas a los riesgos identificados para garantizar el cumplimiento normativo.",
    stepByStep: [
      "Ve a 'Seguridad y Riesgos' ➔ pestaña 'Controles de Seguridad'.",
      "Vincula al menos 3 controles de seguridad a tus activos y asócialos a un estándar internacional (ej: ISO 27001, PCI-DSS)."
    ],
    suggestedCases: [
      { name: "Cifrado AES-256 de Historias Clínicas", desc: "Control de seguridad en bases de datos para encriptar en reposo la información sensible médica." },
      { name: "Enmascaramiento Dinámico de Cuentas de Ahorro", desc: "Control SQL para enmascarar los primeros 12 dígitos de la tarjeta para analistas de soporte." }
    ],
    governanceProgress: "Llega al 70%. Transforma las directrices abstractas de seguridad en herramientas técnicas de protección verificables.",
    flowchart: "Definir Control Técnico ➔ Asociar a Norma (ISO/PCI) ➔ Asignar a Riesgos Activos ➔ Guardar Evidencia de Control"
  },
  p3_connections: {
    purpose: "Configurar las conexiones automáticas a los servidores de datos (Postgres, Snowflake) para posibilitar el escaneo técnico.",
    stepByStep: [
      "Ve a 'Catálogo de Activos' ➔ pestaña 'Conexiones de Datos'.",
      "Configura al menos 3 conexiones con detalles técnicos correctos."
    ],
    suggestedCases: [
      { name: "Snowflake Contabilidad Core", desc: "Conexión en la nube para el Data Lake financiero." }
    ],
    governanceProgress: "Avanza al 75%. Habilita el descubrimiento automático de metadatos eliminando la documentación manual obsoleta.",
    flowchart: "Ingresar URL/Server de BD ➔ Configurar Credenciales Cifradas ➔ Testear Conexión ➔ Registrar Conexión"
  },
  p3_assets: {
    purpose: "Establecer el inventario único de verdad que expone todas las tablas, reportes y orígenes de datos gobernados en la empresa.",
    stepByStep: [
      "Ve a 'Catálogo de Activos' ➔ pestaña 'Tablas y Reportes'.",
      "Registra un mínimo de 6 activos de información (tablas) detallando propietarios (Data Owners) y custodios formales."
    ],
    suggestedCases: [
      { name: "tbl_clientes_crm", desc: "Tabla maestra de clientes que almacena nombres, teléfonos e identificadores de privacidad." }
    ],
    governanceProgress: "Llega al 80%. Otorga visibilidad completa de los activos de información para que el negocio sepa dónde buscar y consumir datos de calidad.",
    flowchart: "Conectar Base de Datos ➔ Escanear Tablas ➔ Catalogar Atributos ➔ Vincular Responsables ➔ Publicar"
  },
  p3_rules: {
    purpose: "Configurar umbrales y validaciones lógicas automáticas para certificar si el dato es confiable (completitud, unicidad, formato).",
    stepByStep: [
      "Ve al módulo 'Calidad de Datos' ➔ pestaña 'Reglas de Calidad'.",
      "Crea al menos 5 reglas de calidad específicas y enlázalas a columnas de tus tablas catalogadas."
    ],
    suggestedCases: [
      { name: "val_email_formato", desc: "Regla regex para forzar que la columna 'email' contenga un formato válido '@dominio.com'." },
      { name: "val_cedula_unicidad", desc: "Regla SQL para verificar la ausencia de duplicados en el identificador único del cliente." }
    ],
    governanceProgress: "Avanza al 85%. Asegura la confiabilidad del dato reduciendo pérdidas de negocio por reportes erróneos.",
    flowchart: "Seleccionar Activo/Columna ➔ Definir Tipo de Regla (Completitud/Unicidad) ➔ Guardar y Activar Monitoreo"
  },
  p3_fields: {
    purpose: "Identificar y etiquetar individualmente las columnas que contienen datos personales o sensibles para aplicar enmascaramiento.",
    stepByStep: [
      "Ve a 'Catálogo de Activos' ➔ pestaña 'Clasificación de Campos'.",
      "Configura la clasificación de al menos 6 campos como Confidenciales, PII o Restringidos."
    ],
    suggestedCases: [
      { name: "numero_tarjeta", desc: "Campo clasificado como Altamente Confidencial (PII) bajo el estándar PCI-DSS." }
    ],
    governanceProgress: "Llega al 90% de madurez. Permite la gobernanza granular de la privacidad de la información a nivel de celda.",
    flowchart: "Escanear Columnas de la Tabla ➔ Detectar Datos Sensibles ➔ Etiquetar (Confidencial/PII) ➔ Registrar Clasificación"
  },
  p4_workflow_op: {
    purpose: "Operar solicitudes diarias de gobierno (accesos, modificaciones) mediante workflows formales con traza auditable.",
    stepByStep: [
      "Ve al módulo 'Workflows Operativos'.",
      "Crea al menos 3 solicitudes y documéntalas como Aprobadas o Cerradas."
    ],
    suggestedCases: [
      { name: "Solicitud de Acceso a Tabla Transaccional", desc: "Ticket formal para permitir al analista el consumo de saldos de tarjetas." }
    ],
    governanceProgress: "Alcanza el 93% de avance. Demuestra que el gobierno es una práctica cotidiana y viva, no solo documentación.",
    flowchart: "Crear Ticket de Solicitud ➔ Evaluar por Responsables ➔ Autorizar Cambios ➔ Cerrar y Archivar Ticket"
  },
  p4_incidents_qual: {
    purpose: "Registrar fallos de calidad detectados (descuadres, nulos) para investigar la causa raíz y mitigarlos de forma auditable.",
    stepByStep: [
      "Ve al módulo 'Calidad de Datos' ➔ pestaña 'Mesa de Incidentes'.",
      "Registra un mínimo de 3 incidentes de calidad y detalla su plan de remediación."
    ],
    suggestedCases: [
      { name: "Descuadre de inventario web vs tiendas físicas", desc: "Incidente crítico que reporta un 15% de diferencias en SKUs." }
    ],
    governanceProgress: "Avanza al 96%. Mitiga fallos sistémicos de datos garantizando la remediación oportuna.",
    flowchart: "Detectar Error de Calidad ➔ Abrir Incidente de Calidad ➔ Asignar a Steward ➔ Registrar Remediación"
  },
  p4_incidents_sec: {
    purpose: "Gestionar y remediar brechas de seguridad o accesos anómalos de forma inmediata para documentar ante auditores.",
    stepByStep: [
      "Ve a 'Seguridad y Riesgos' ➔ pestaña 'Incidentes de Seguridad'.",
      "Registra un mínimo de 3 incidentes de seguridad y asócialos a un control mitigante."
    ],
    suggestedCases: [
      { name: "Acceso sospechoso desde IP fuera del país", desc: "Alerta de seguridad por posible suplantación de credenciales." }
    ],
    governanceProgress: "Alcanza el 98% de madurez. Previene hackeos recurrentes y multas legales documentando la respuesta ante brechas.",
    flowchart: "Detectar Alerta de Seguridad ➔ Crear Incidente ➔ Aplicar Control de Contención ➔ Cerrar Incidente"
  },
  p4_monitoring_history: {
    purpose: "Registrar las corridas del monitoreo de calidad para visualizar la evolución del índice de calidad global en el tiempo.",
    stepByStep: [
      "Ve al módulo de Calidad ➔ pestaña 'Historial de Monitoreo'.",
      "Crea al menos 3 registros históricos de calidad con puntuaciones de validación real."
    ],
    suggestedCases: [
      { name: "Corrida de Validación Mayo 2026", desc: "Escaneo mensual automático reportando 92% de calidad en el dominio clientes." }
    ],
    governanceProgress: "Completa el 100% de madurez en la ruta (CDO Master Champion). Demuestra el control continuo y la evolución medible del programa de datos.",
    flowchart: "Correr Reglas de Calidad ➔ Obtener Score Global ➔ Registrar Log Histórico ➔ Visualizar Gráfico de Evolución"
  }
};

const getEmbedVideoUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('youtube.com/shorts/')) {
    const parts = url.split('/shorts/');
    const id = parts[parts.length - 1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('youtube.com/watch?v=')) {
    const parts = url.split('v=');
    const id = parts[parts.length - 1]?.split('&')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    const id = parts[parts.length - 1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
};

export default function JourneyCDO() {
  const { currentTenant, transformationVideoUrl, transformationVideoAspect } = usePlatform();
  const [showWelcome, setShowWelcome] = useState(false);
  const [activePhaseId, setActivePhaseId] = useState('phase_1');
  const [validations, setValidations] = useState<Record<string, boolean>>({});
  const [realEvidence, setRealEvidence] = useState<Record<string, any[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // Gamified Scoring States
  const [dbScore, setDbScore] = useState(0); // Max 60 pts
  const [decisionScore, setDecisionScore] = useState(0); // Max 40 pts
  const [totalScore, setTotalScore] = useState(0); // Max 100 pts
  const [level, setLevel] = useState('Iniciando');
  const [userRole, setUserRole] = useState('');

  // Active Sector / Transformation Case Wizard
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [showCaseOverlay, setShowCaseOverlay] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<'context' | 'problems' | 'compliance' | 'roadmap'>('context');

  // Mentor IA details modal
  const [selectedMentorActivity, setSelectedMentorActivity] = useState<ActivityItem | null>(null);
  const [showMentorModal, setShowMentorModal] = useState(false);

  // Decision Challenges Answers
  const [resolvedDecisions, setResolvedDecisions] = useState<Record<string, string>>({}); // phaseId -> optionKey
  const [decisionFeedback, setDecisionFeedback] = useState<Record<string, { text: string; isCorrect: boolean }>>({});

  // Interactive DAMA Mentor
  const [mentorQuestion, setMentorQuestion] = useState<string | null>(null);
  const [mentorAnswer, setMentorAnswer] = useState<string | null>(null);
  const [expandedLearnMore, setExpandedLearnMore] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Initialize and load state
  useEffect(() => {
    const role = localStorage.getItem('govdata_role') || '';
    setUserRole(role);

    // Load selected sector
    const sector = localStorage.getItem('govdata_selected_sector');
    if (sector && sector !== 'null') {
      setSelectedSector(sector);
    }

    // Load solved decisions
    const decs: Record<string, string> = {};
    const feed: Record<string, { text: string; isCorrect: boolean }> = {};
    let earnedDecisionPts = 0;

    ['phase_1', 'phase_2', 'phase_3', 'phase_4'].forEach((pId) => {
      const savedAns = localStorage.getItem(`govdata_decision_${pId}`);
      if (savedAns) {
        decs[pId] = savedAns;
        // Find if correct
        const activeS = sector || 'financiero';
        const challenge = getChallengeForSector(activeS, pId);
        const opt = challenge.options.find(o => o.key === savedAns);
        if (opt) {
          feed[pId] = { text: opt.feedback, isCorrect: opt.isCorrect };
          if (opt.isCorrect) earnedDecisionPts += 10;
        }
      }
    });

    setResolvedDecisions(decs);
    setDecisionFeedback(feed);
    setDecisionScore(earnedDecisionPts);
  }, []);

  const handleSelectSector = (sectorId: string) => {
    setSelectedSector(sectorId);
    localStorage.setItem('govdata_selected_sector', sectorId);
    // Reset decisions for a fresh game
    ['phase_1', 'phase_2', 'phase_3', 'phase_4'].forEach((pId) => {
      localStorage.removeItem(`govdata_decision_${pId}`);
    });
    setResolvedDecisions({});
    setDecisionFeedback({});
    setDecisionScore(0);
  };

  const handleResetSector = () => {
    setSelectedSector(null);
    localStorage.setItem('govdata_selected_sector', 'null');
  };

  // Submit decision option
  const handleSelectOption = (phaseId: string, optionKey: string, isCorrect: boolean, feedbackText: string) => {
    if (resolvedDecisions[phaseId]) return; // Cannot edit once selected

    const newDecs = { ...resolvedDecisions, [phaseId]: optionKey };
    const newFeed = { ...decisionFeedback, [phaseId]: { text: feedbackText, isCorrect } };
    
    setResolvedDecisions(newDecs);
    setDecisionFeedback(newFeed);
    localStorage.setItem(`govdata_decision_${phaseId}`, optionKey);

    if (isCorrect) {
      const newDecScore = decisionScore + 10;
      setDecisionScore(newDecScore);
    }
  };

  // Revalidate real DB progress
  const checkJourneyProgress = useCallback(async () => {
    if (!currentTenant?.id) return;
    setIsValidating(true);
    const newValidations: Record<string, boolean> = {};
    const evidenceData: Record<string, any[]> = {};

    try {
      // 1. DAMA Assessment
      const { data: damaData } = await supabase.from('maturity_assessments').select('*').eq('tenant_id', currentTenant.id);
      if (damaData) {
        const validDama = damaData.filter(r => r.answers && (r.answers.timestamp || r.answers.comite_gobierno));
        newValidations['dama'] = validDama.length >= 1;
        evidenceData['dama'] = validDama;
      }

      // 2. Findings
      const { data: findingsData } = await supabase.from('maturity_findings').select('*').eq('tenant_id', currentTenant.id);
      if (findingsData) {
        newValidations['findings'] = findingsData.length >= 5;
        evidenceData['findings'] = findingsData;
      }

      // 3. Roadmaps
      const { data: roadmapsData } = await supabase.from('maturity_roadmaps').select('*').eq('tenant_id', currentTenant.id);
      if (roadmapsData) {
        newValidations['roadmaps'] = roadmapsData.length >= 4;
        evidenceData['roadmaps'] = roadmapsData;
      }

      // 4. Roles
      const { data: teamData } = await supabase.from('team_members').select('*').eq('tenant_id', currentTenant.id);
      if (teamData) {
        const roleTypes = teamData.map(m => m.role?.toLowerCase() || '');
        const reqRoles = ["data owner", "data steward", "data custodian", "cdo"];
        const hasAll = reqRoles.every(r => roleTypes.some(rt => rt.includes(r)));
        const fieldsOk = teamData.every(r => r.name && r.email && r.role && r.area);
        newValidations['roles'] = hasAll && fieldsOk && teamData.length >= 5;
        evidenceData['roles'] = teamData;
      }

      // 5. Domains
      const { data: domainsData } = await supabase.from('team_domains').select('*').eq('tenant_id', currentTenant.id);
      if (domainsData) {
        const bootstrapDomains = ['CLIENTES & CRM', 'FINANZAS', 'TALENTO HUMANO', 'PROVEEDORES'];
        const validDomains = domainsData.filter(r => !bootstrapDomains.includes((r.name || '').trim().toUpperCase()));
        newValidations['domains'] = validDomains.length >= 3;
        evidenceData['domains'] = validDomains;
      }

      // 6. RACI Matrix
      const { data: raciData } = await supabase.from('team_raci_matrix').select('*').eq('tenant_id', currentTenant.id);
      if (raciData) {
        const defaultRaci = [
          { process: 'Definición de Glosario', owner_role: 'A', steward_role: 'R', custodian_role: 'C', analyst_role: 'C' },
          { process: 'Validación de Calidad', owner_role: 'A', steward_role: 'R', custodian_role: 'I', analyst_role: 'C' },
          { process: 'Aprobación de Acceso', owner_role: 'A', steward_role: 'C', custodian_role: 'R', analyst_role: 'I' },
          { process: 'Modelado de Datos', owner_role: 'C', steward_role: 'C', custodian_role: 'R', analyst_role: 'A' },
          { process: 'Gestión de Incidentes', owner_role: 'I', steward_role: 'R', custodian_role: 'A', analyst_role: 'C' },
        ];
        const validRaci = raciData.filter(r => {
          return !defaultRaci.some(d => 
            d.process.toLowerCase() === (r.process || '').trim().toLowerCase() &&
            d.owner_role === r.owner_role &&
            d.steward_role === r.steward_role &&
            d.custodian_role === r.custodian_role &&
            d.analyst_role === r.analyst_role
          );
        });
        newValidations['raci'] = validRaci.length >= 7;
        evidenceData['raci'] = validRaci;
      }

      // 7. Team Capacity
      const { data: capacityData } = await supabase.from('team_capacity_assessments').select('*').eq('tenant_id', currentTenant.id);
      if (capacityData) {
        newValidations['capacity'] = capacityData.length >= 2;
        evidenceData['capacity'] = capacityData;
      }

      // 8. Committees
      const { data: committeesData } = await supabase.from('gov_committees').select('*').eq('tenant_id', currentTenant.id);
      if (committeesData) {
        newValidations['committees'] = committeesData.length >= 2;
        evidenceData['committees'] = committeesData;
      }

      // 9. Policies
      const { data: policiesData } = await supabase.from('data_policies').select('*').eq('tenant_id', currentTenant.id);
      if (policiesData) {
        const bootstrapFrameworks = ['DAMA', 'DCAM', 'HEALTH', 'PUBLIC', 'GDPR', 'STANDARD'];
        const validPolicies = policiesData.filter(r => !bootstrapFrameworks.includes((r.framework_origin || '').trim().toUpperCase()));
        newValidations['policies'] = validPolicies.length >= 5;
        newValidations['policy_stewardship'] = validPolicies.length >= 7;
        evidenceData['policies'] = validPolicies;
        evidenceData['policy_stewardship'] = validPolicies;
      }

      // 10. Workflows
      const { data: workflowsData } = await supabase.from('policy_workflows').select('*').eq('tenant_id', currentTenant.id);
      if (workflowsData) {
        const bootstrapWfs = ['FLUJO DOCUMENTAL NORMATIVO', 'ESTÁNDAR', 'CRÍTICO / LEGAL', 'ESTANDAR', 'CRITICO / LEGAL'];
        const validWfs = workflowsData.filter(r => !bootstrapWfs.includes((r.name || '').trim().toUpperCase()));
        newValidations['workflows'] = validWfs.length >= 2;
        newValidations['normative_audit'] = validWfs.length >= 3;
        evidenceData['workflows'] = validWfs;
        evidenceData['normative_audit'] = validWfs;
      }

      // 11. Security Risks
      const { data: risksData } = await supabase.from('security_risks').select('*').eq('tenant_id', currentTenant.id);
      if (risksData) {
        newValidations['risks'] = risksData.length >= 3;
        newValidations['mitigation_actions'] = risksData.length >= 4;
        evidenceData['risks'] = risksData;
        evidenceData['mitigation_actions'] = risksData;
      }

      // 12. Security Controls
      const { data: secControlsData } = await supabase.from('security_controls').select('*').eq('tenant_id', currentTenant.id);
      if (secControlsData) {
        newValidations['controls'] = secControlsData.length >= 3;
        newValidations['privacy_consent'] = secControlsData.length >= 4;
        evidenceData['controls'] = secControlsData;
        evidenceData['privacy_consent'] = secControlsData;
      }

      // 13. Connections
      const { data: connectionsData } = await supabase.from('data_connections').select('*').eq('tenant_id', currentTenant.id);
      if (connectionsData) {
        newValidations['connections'] = connectionsData.length >= 3;
        newValidations['source_types'] = connectionsData.length >= 4;
        evidenceData['connections'] = connectionsData;
        evidenceData['source_types'] = connectionsData;
      }

      // 14. Data Assets
      const { data: assetsData } = await supabase.from('data_assets').select('*').eq('tenant_id', currentTenant.id);
      if (assetsData) {
        newValidations['assets'] = assetsData.length >= 6;
        newValidations['catalog_classification'] = assetsData.length >= 8;
        evidenceData['assets'] = assetsData;
        evidenceData['catalog_classification'] = assetsData;
      }

      // 15. Quality Rules
      const { data: rulesData } = await supabase.from('quality_rules').select('*').eq('tenant_id', currentTenant.id);
      if (rulesData) {
        newValidations['rules'] = rulesData.length >= 5;
        newValidations['rules_dimensions'] = rulesData.length >= 7;
        evidenceData['rules'] = rulesData;
        evidenceData['rules_dimensions'] = rulesData;
      }

      // 16. Fields
      const { data: fieldsData } = await supabase.from('asset_fields').select('*').eq('tenant_id', currentTenant.id);
      if (fieldsData) {
        newValidations['fields'] = fieldsData.length >= 6;
        newValidations['lineage_mapping'] = fieldsData.length >= 8;
        evidenceData['fields'] = fieldsData;
        evidenceData['lineage_mapping'] = fieldsData;
      }

      // 17. Operational Workflows
      const { data: opWfsData } = await supabase.from('workflow_requests').select('*').eq('tenant_id', currentTenant.id).in('status', ['Aprobado', 'Cerrado', 'Completado']);
      if (opWfsData) {
        newValidations['workflows_op'] = opWfsData.length >= 3;
        newValidations['workflows_sla'] = opWfsData.length >= 4;
        evidenceData['workflows_op'] = opWfsData;
        evidenceData['workflows_sla'] = opWfsData;
      }

      // 18. Quality Incidents
      const { data: qualIncidents } = await supabase.from('quality_incidents').select('*').eq('tenant_id', currentTenant.id);
      if (qualIncidents) {
        newValidations['quality_incidents'] = qualIncidents.length >= 3;
        newValidations['quality_remediation'] = qualIncidents.length >= 4;
        evidenceData['quality_incidents'] = qualIncidents;
        evidenceData['quality_remediation'] = qualIncidents;
      }

      // 19. Security Incidents
      const { data: secIncidents } = await supabase.from('security_incidents').select('*').eq('tenant_id', currentTenant.id);
      if (secIncidents) {
        newValidations['security_incidents'] = secIncidents.length >= 3;
        newValidations['security_mitigation'] = secIncidents.length >= 4;
        evidenceData['security_incidents'] = secIncidents;
        evidenceData['security_mitigation'] = secIncidents;
      }

      // 20. Historical monitoring history
      const { data: historyData } = await supabase.from('quality_monitoring_history').select('*').eq('tenant_id', currentTenant.id);
      if (historyData) {
        newValidations['monitoring_history'] = historyData.length >= 3;
        newValidations['monitoring_runs'] = historyData.length >= 4;
        evidenceData['monitoring_history'] = historyData;
        evidenceData['monitoring_runs'] = historyData;
      }

      setValidations(newValidations);
      setRealEvidence(evidenceData);

      // Compute database tasks completion (Max 60 points)
      const completedCount = Object.values(newValidations).filter(v => v).length;
      const dbEarned = Math.round((completedCount / 32) * 60);
      setDbScore(dbEarned);

    } catch (e) {
      console.error(e);
    } finally {
      setIsValidating(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    if (selectedSector) {
      checkJourneyProgress();
    }
  }, [selectedSector, checkJourneyProgress]);

  // Recalculate total score dynamically (Max 100)
  useEffect(() => {
    const total = dbScore + decisionScore;
    setTotalScore(total);

    if (total >= 95) setLevel('CDO Master Supreme');
    else if (total >= 75) setLevel('Policy & Risk Architect');
    else if (total >= 50) setLevel('Especialista de Gobierno Senior');
    else if (total >= 20) setLevel('Arquitecto de Gobierno');
    else setLevel('CDO Junior');
  }, [dbScore, decisionScore]);

  const activePhase = PHASES.find(p => p.id === activePhaseId) || PHASES[0];

  const getPhaseCompletionStats = (phase: Phase) => {
    let completed = 0;
    phase.activities.forEach((act) => {
      if (validations[act.checkKey]) completed++;
    });
    const total = phase.activities.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
  };

  const activePhaseStats = getPhaseCompletionStats(activePhase);

  const handleAskMentor = (query: string, answer: string) => {
    setMentorQuestion(query);
    setMentorAnswer(answer);
  };

  const renderMentorActivityGuide = (activityId: string) => {
    const guide = MENTOR_GUIDES[activityId] || MENTOR_GUIDES['p1_dama'];
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        padding: '32px',
        background: 'linear-gradient(135deg, #090d1f 0%, #030712 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Launchpad-Styled Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          paddingBottom: '20px',
          marginBottom: '4px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)', 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontSize: '0.7rem', 
                fontWeight: 900, 
                textTransform: 'uppercase',
                letterSpacing: '0.05em' 
              }}>Mentor IA</span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
                Asesoría de Implementación DAMA
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
              Guía explícita paso a paso para la actividad: <span style={{ color: '#a5b4fc', fontWeight: 600 }}>"{selectedMentorActivity?.title}"</span>
            </p>
          </div>
          <button 
            onClick={() => setShowMentorModal(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={16} /> Cerrar
          </button>
        </div>
        {/* Purpose */}
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.05)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: '16px', 
          padding: '18px', 
          display: 'flex', 
          gap: '14px',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            color: 'white', 
            width: '36px', 
            height: '36px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            flexShrink: 0, 
            fontWeight: 'bold', 
            fontSize: '1.2rem', 
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
          }}>💡</div>
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.05em' }}>¿QUÉ APORTA Y PARA QUÉ SIRVE?</h5>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#a7f3d0', lineHeight: 1.5 }}>{guide.purpose}</p>
          </div>
        </div>

        {/* Step by Step */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          borderRadius: '20px', 
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h5 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            letterSpacing: '0.05em'
          }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              color: 'white', 
              padding: '4px 10px', 
              borderRadius: '6px', 
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)'
            }}>INSTRUCCIONES</span>
            PASO A PASO EXPLÍCITO (QUÉ HACER)
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {guide.stepByStep.map((step, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  flexShrink: 0,
                  boxShadow: '0 0 8px rgba(99, 102, 241, 0.2)'
                }}>{index + 1}</div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Cases */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          borderRadius: '20px', 
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h5 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>📝 CASO SUGERIDO / EJEMPLOS CONCRETOS</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {guide.suggestedCases.map((item, index) => (
              <div key={index} style={{ 
                background: 'rgba(99, 102, 241, 0.05)', 
                borderRadius: '12px', 
                padding: '16px', 
                borderLeft: '4px solid #6366f1',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderLeftWidth: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <strong style={{ display: 'block', fontSize: '0.92rem', color: '#818cf8', marginBottom: '6px' }}>{item.name}</strong>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Process Flow / Creation Flow Diagram */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          borderRadius: '20px', 
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h5 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>📊 FLUJO DE CREACIÓN Y TRAZABILIDAD</h5>
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.7)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '14px', 
            padding: '20px', 
            textAlign: 'center', 
            overflowX: 'auto',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', fontWeight: 700, color: '#818cf8', whiteSpace: 'nowrap' }}>
              {guide.flowchart.split('➔').map((node, i, arr) => (
                <React.Fragment key={i}>
                  <span style={{ 
                    background: i === arr.length - 1 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.02)', 
                    border: i === arr.length - 1 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', 
                    padding: '8px 14px', 
                    borderRadius: '8px', 
                    color: i === arr.length - 1 ? '#a5b4fc' : '#94a3b8',
                    boxShadow: i === arr.length - 1 ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none'
                  }}>
                    {node.trim()}
                  </span>
                  {i < arr.length - 1 && <span style={{ color: '#6366f1', textShadow: '0 0 4px #6366f1' }}>➔</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Governance Progress Info */}
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          paddingTop: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '0.88rem' 
        }}>
          <span style={{ color: '#94a3b8' }}>Aporte al Proceso de Gobierno:</span>
          <span style={{ fontWeight: 800, color: '#38bdf8', textShadow: '0 0 8px rgba(56, 189, 248, 0.3)' }}>{guide.governanceProgress}</span>
        </div>
      </div>
    );
  };

  const handleGenerateDeliverable = (phaseTitle: string, type: string) => {
    setIsGenerating(`${phaseTitle}_${type}`);
    setTimeout(() => {
      setIsGenerating(null);
      alert(`¡Éxito! El entregable consolidado (${type}) del Proyecto de Transformación ha sido descargado en tu equipo local.`);
    }, 1500);
  };

  const activeSectorData = SECTORS.find(s => s.id === selectedSector);
  const activeChallenge = selectedSector ? getChallengeForSector(selectedSector, activePhaseId) : null;



  return (
    <div className={styles.container}>
      {/* Platform-styled Sector Selection Wizard Modal */}
      <UnifiedModal
        isOpen={!selectedSector}
        onClose={() => {}}
        title="Selecciona tu Proyecto de Transformación"
        subtitle="Elige el caso de negocio de tu organización. Gobernarás sus datos reales y tomarás decisiones DAMA."
        type="formulario"
        configOverride={{
          width: '1000px',
          overlayClickClose: false,
          closeOnEsc: false,
          showHeader: true,
          showFooter: false
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', padding: '10px 0' }}>
          {SECTORS.map((s) => (
            <div 
              key={s.id} 
              className={styles.statCard} 
              style={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                padding: '24px', 
                cursor: 'pointer', 
                border: '1px solid #e2e8f0', 
                textAlign: 'left',
                background: '#ffffff',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => handleSelectSector(s.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Building2 size={20} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: '#1e1b4b' }}>{s.name}</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>{s.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4f46e5', fontWeight: 800, fontSize: '0.8rem', marginTop: 'auto' }}>
                <span>Iniciar Caso Corporativo</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </UnifiedModal>
      {/* Header Panel */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>
            <Compass size={36} color="#6366f1" /> Journey CDO – Simulador de Transformación
          </h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            Caso Activo: <strong style={{ color: '#ffffff', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '8px', fontSize: '0.9rem' }}>{activeSectorData?.name}</strong>
            <button onClick={handleResetSector} style={{ background: 'none', border: 'none', color: '#a5b4fc', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, padding: 0 }}>
              (Cambiar Sector)
            </button>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setShowCaseOverlay(true)}
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', 
              color: 'white', 
              border: 'none', 
              padding: '10px 18px', 
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Target size={18} />
            Ver Proyecto de Transformación
          </button>
          <button 
            onClick={checkJourneyProgress} 
            disabled={isValidating}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white', 
              border: 'none', 
              padding: '10px 18px', 
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={18} className={isValidating ? 'animate-spin' : ''} />
            {isValidating ? 'Validando...' : 'Revalidar Base de Datos'}
          </button>
        </div>
      </header>

      {/* Gamified Score Dashboard */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ borderLeft: '6px solid #4f46e5' }}>
          <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Award size={28} />
          </div>
          <div className={styles.statInfo}>
            <span>Score de Transformación</span>
            <h3>{totalScore} / 100</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Database size={24} />
          </div>
          <div className={styles.statInfo}>
            <span>Progreso Base de Datos</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: 800, color: '#0f172a' }}>{dbScore} / 60 Puntos</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fffbeb', color: '#d97706' }}>
            <Target size={24} />
          </div>
          <div className={styles.statInfo}>
            <span>Alineación de Decisiones</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: 800, color: '#0f172a' }}>{decisionScore} / 40 Puntos</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Layers size={24} />
          </div>
          <div className={styles.statInfo}>
            <span>Insignia Obtenida</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: 800, color: '#8b5cf6', fontSize: '0.92rem' }}>{level}</p>
          </div>
        </div>
      </div>

      {/* Main Two Column Workspace */}
      <div className={styles.mainLayout}>
        {/* Timeline Sidebar Navigation */}
        <aside className={styles.timelineSidebar}>
          <h3 className={styles.timelineTitle}>Fases del Caso</h3>
          <div className={styles.timelineList}>
            {PHASES.map((p) => {
              const active = activePhaseId === p.id;
              const stats = getPhaseCompletionStats(p);
              const decisionSolved = !!resolvedDecisions[p.id];

              return (
                <div 
                  key={p.id}
                  onClick={() => setActivePhaseId(p.id)}
                  className={`${styles.timelineItem} ${active ? styles.timelineItemActive : ''}`}
                >
                  <div className={`${styles.timelineDot} ${stats.pct === 100 && decisionSolved ? styles.timelineDotCompleted : active ? styles.timelineDotActive : ''}`}>
                    {stats.pct === 100 && decisionSolved ? '✓' : p.number}
                  </div>
                  <div className={styles.timelineContent}>
                    <h4>{p.title}</h4>
                    <span>{stats.completed}/{stats.total} Actividades ({stats.pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
          {transformationVideoUrl && (
            <div style={{ marginTop: '24px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Video Guía CDO</h4>
              {transformationVideoUrl.includes('youtube.com') || transformationVideoUrl.includes('youtu.be') ? (
                <iframe 
                  src={getEmbedVideoUrl(transformationVideoUrl)}
                  title="CDO Simulator Tutorial"
                  style={{ 
                    width: '100%', 
                    height: transformationVideoAspect === '9:16' ? '400px' : '180px', 
                    borderRadius: '12px', 
                    border: 'none',
                    display: 'block'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={transformationVideoUrl} 
                  controls 
                  style={{ 
                    width: '100%', 
                    height: transformationVideoAspect === '9:16' ? '400px' : 'auto', 
                    borderRadius: '12px',
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                />
              )}
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          {/* Phase Banner */}
          <section className={styles.phaseOverviewCard}>
            <span className={styles.phaseBadge}>Fase {activePhase.number}</span>
            <h2>{activePhase.title}</h2>
            <p>{activePhase.objective}</p>

            <div className={styles.phaseMetaGrid}>
              <div className={styles.metaItem}>
                <div className={styles.metaIcon} style={{ background: '#f1f5f9', color: '#475569' }}>
                  <HelpCircle size={18} />
                </div>
                <div className={styles.metaText}>
                  <h4>¿Por qué es importante?</h4>
                  <p>{activePhase.importance}</p>
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaIcon} style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <Lightbulb size={18} />
                </div>
                <div className={styles.metaText}>
                  <h4>¿Qué construirás?</h4>
                  <p>{activePhase.building}</p>
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
                  <Database size={18} />
                </div>
                <div className={styles.metaText}>
                  <h4>Módulos Utilizados</h4>
                  <p>{activePhase.modulesUsed}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleGenerateDeliverable(activePhase.title, 'PDF')}
                disabled={isGenerating !== null}
                className={styles.actionBtn}
                style={{ background: '#0f172a' }}
              >
                <FileBarChart size={16} /> 
                {isGenerating === `${activePhase.title}_PDF` ? 'Generando PDF...' : 'Descargar Entregable PDF'}
              </button>
              <button 
                onClick={() => handleGenerateDeliverable(activePhase.title, 'Excel')}
                disabled={isGenerating !== null}
                className={styles.actionBtn}
                style={{ background: '#10b981' }}
              >
                <FileSpreadsheet size={16} /> 
                {isGenerating === `${activePhase.title}_Excel` ? 'Exportando...' : 'Exportar Evidencias Excel'}
              </button>
            </div>
          </section>

          {/* Phase Decision Challenge Card */}
          {activeChallenge && (
            <section style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '24px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Target size={24} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#78350f' }}>Reto del CDO: Decisión Estratégica DAMA</h3>
              </div>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.98rem', color: '#78350f', lineHeight: 1.6, fontWeight: 700 }}>
                {activeChallenge.question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeChallenge.options.map((opt) => {
                  const isSelected = resolvedDecisions[activePhaseId] === opt.key;
                  const isSolved = !!resolvedDecisions[activePhaseId];
                  return (
                    <button
                      key={opt.key}
                      disabled={isSolved}
                      onClick={() => handleSelectOption(activePhaseId, opt.key, opt.isCorrect, opt.feedback)}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: isSelected 
                          ? `2px solid ${opt.isCorrect ? '#10b981' : '#ef4444'}`
                          : '1px solid #fde68a',
                        background: isSelected
                          ? opt.isCorrect ? '#ecfdf5' : '#fef2f2'
                          : '#ffffff',
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: isSolved ? 'default' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 800, marginRight: '8px', color: '#d97706' }}>{opt.key}.</span>
                      {opt.text}
                      {isSelected && (
                        <span style={{ float: 'right', fontWeight: 800, color: opt.isCorrect ? '#10b981' : '#ef4444' }}>
                          {opt.isCorrect ? '✓ Correcto (+10 pts)' : '✗ Incorrecto'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {decisionFeedback[activePhaseId] && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: decisionFeedback[activePhaseId].isCorrect ? '#d1fae5' : '#fee2e2',
                  color: decisionFeedback[activePhaseId].isCorrect ? '#065f46' : '#991b1b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  lineHeight: 1.5
                }}>
                  {decisionFeedback[activePhaseId].text}
                </div>
              )}
            </section>
          )}

          {/* Activities list checklist */}
          <section className={styles.activitiesSection}>
            <div className={styles.activitiesHeader}>
              <h3>Actividades Reales ({activePhaseStats.completed}/{activePhaseStats.total})</h3>
            </div>

            {activePhase.activities.map((act) => {
              const isOk = validations[act.checkKey];
              const isOpen = expandedLearnMore === act.id;

              return (
                <div 
                  key={act.id} 
                  className={`${styles.activityCard} ${isOk ? styles.activityCardCompleted : ''}`}
                >
                  <div className={styles.activityMain}>
                    <div className={`${styles.activityCheckIcon} ${isOk ? styles.completedCheck : styles.pendingCheck}`}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className={styles.activityContent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4>{act.title}</h4>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          color: isOk ? '#065f46' : '#94a3b8',
                          background: isOk ? '#d1fae5' : '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {isOk ? 'Evidencia Validada' : 'Evidencia Pendiente'}
                        </span>
                      </div>
                      <p>{act.context}</p>

                      <div className={styles.activityResultBox}>
                        <strong>Resultado Esperado:</strong> {act.expectedResult}
                      </div>

                      {/* Display evidence list if completed */}
                      {isOk && realEvidence[act.checkKey] && (
                        <div style={{ marginBottom: '16px', background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46', display: 'block', marginBottom: '4px' }}>
                            Evidencias encontradas en BD:
                          </span>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#047857' }}>
                            {realEvidence[act.checkKey].slice(0, 3).map((ev: any, idx: number) => (
                              <li key={idx}>
                                {ev.name || ev.title || ev.process || `Registro #${idx+1}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className={styles.activityFooter}>
                        <span className={styles.moduleTag}>
                          <Database size={14} /> Módulo: {act.moduleHref.replace('/', '')}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button 
                            className={styles.learnMoreToggle}
                            onClick={() => setExpandedLearnMore(isOpen ? null : act.id)}
                          >
                            {isOpen ? 'Ocultar Guía' : 'Ver DAMA & Negocio'}
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button 
                            className={styles.learnMoreToggle}
                            style={{ 
                              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)', 
                              color: '#ffffff', 
                              border: 'none', 
                              boxShadow: '0 0 12px rgba(124, 58, 237, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              fontWeight: 700,
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onClick={() => {
                              setSelectedMentorActivity(act);
                              setShowMentorModal(true);
                            }}
                          >
                            <Brain size={14} style={{ filter: 'drop-shadow(0 0 2px #fff)' }} /> Mentor IA
                          </button>
                          <a 
                            href={act.moduleHref}
                            className={styles.actionBtn}
                            style={{ textDecoration: 'none' }}
                          >
                            Ir a Plataforma <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learning accordion */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        className={styles.learningContext}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className={styles.learningGrid} style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
                          {/* 4 Business Fields */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ borderLeft: '4px solid #4f46e5', paddingLeft: '10px' }}>
                              <h6 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#4f46e5' }}>¿Por qué es importante para la organización?</h6>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{act.whyImportant}</p>
                            </div>
                            <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '10px' }}>
                              <h6 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>¿Qué problema resuelve?</h6>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{act.problemSolved}</p>
                            </div>
                            <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '10px', marginTop: '8px' }}>
                              <h6 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>¿Qué riesgo mitiga?</h6>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{act.riskMitigated}</p>
                            </div>
                            <div style={{ borderLeft: '4px solid #10b981', paddingLeft: '10px', marginTop: '8px' }}>
                              <h6 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>¿Qué beneficio genera?</h6>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{act.businessBenefit}</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className={styles.learningCol}>
                              <h5><Brain size={16} color="#6366f1" /> ¿Por qué se hace esto? (DAMA-DMBOK)</h5>
                              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{act.whyDoIt}</p>
                              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginTop: '8px' }}><strong>Estándar DAMA:</strong> {act.damaGuide}</p>
                            </div>
                            <div className={styles.learningCol}>
                              <h5><Lightbulb size={16} color="#eab308" /> Errores comunes & Tips</h5>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                                <li><strong style={{ color: '#ef4444' }}>Error común:</strong> {act.commonError}</li>
                                <li><strong>Ejemplo Práctico:</strong> {act.realExample}</li>
                                <li><strong>Tip del Experto:</strong> {act.tips}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </section>

          {/* Interactive CDO Mentor */}
          <section className={styles.mentorCard}>
            <div className={styles.mentorHeader}>
              <div className={styles.mentorAvatar}>AI</div>
              <div>
                <h4>Mentor de Gobierno DAMA</h4>
                <p>Preguntas directas sobre gobernanza, RACI y estándares organizacionales de datos.</p>
              </div>
            </div>

            <div className={styles.mentorQuestions}>
              <button onClick={() => handleAskMentor('¿Cómo definir un dominio de datos de forma estratégica?', 'Un dominio debe estructurarse según entidades del negocio (ej: Clientes, Empleados, Ventas) en lugar de esquemas técnicos. Identifica el líder del negocio adecuado para asignarlo como Data Owner, quien será responsable de la veracidad y calidad de ese dominio.')} className={styles.mentorQuestionBtn}>¿Cómo definir un dominio?</button>
              <button onClick={() => handleAskMentor('¿Cómo crear y redactar una política de datos efectiva?', 'Las políticas deben redactarse en lenguaje de negocio, dictando directivas claras sobre el comportamiento del dato (ej: "Se requiere enmascarar información PII"). Deben especificar la versión, un alcance explícito y ser breves, dejando los detalles técnicos para los manuales de procedimientos.')} className={styles.mentorQuestionBtn}>¿Cómo crear una política?</button>
              <button onClick={() => handleAskMentor('¿Cuál es la diferencia real entre Data Owner y Data Steward?', 'El Data Owner es un ejecutivo del negocio responsable de rendir cuentas sobre las decisiones tomadas en su dominio (Accountable). El Data Steward es un líder operativo que ejecuta las tareas de gobierno y valida la calidad del dato (Responsible).')} className={styles.mentorQuestionBtn}>¿Diferencia entre Owner y Steward?</button>
              <button onClick={() => handleAskMentor('¿Cómo interpretar y actuar ante un riesgo de seguridad de datos?', 'Evalúa la probabilidad de fuga e impacto económico del riesgo. Define siempre un Plan de Mitigación auditable con evidencias vinculadas, y mapea el riesgo contra controles técnicos de seguridad.')} className={styles.mentorQuestionBtn}>¿Cómo registrar un riesgo?</button>
            </div>

            {mentorQuestion && (
              <div className={styles.mentorAnswerBox}>
                <h5><MessageSquare size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} /> {mentorQuestion}</h5>
                <p>{mentorAnswer}</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Mentor IA Modal */}
      {selectedMentorActivity && (
        <UnifiedModal
          isOpen={showMentorModal}
          onClose={() => setShowMentorModal(false)}
          type="informativa"
          configOverride={{ 
            width: '950px',
            maxHeight: '95vh',
            showHeader: false, 
            showFooter: false, 
            bg: '#020617', 
            borderColor: 'rgba(99, 102, 241, 0.4)',
            contentPadding: '0px',
            overlayBlur: '8px'
          }}
        >
          {renderMentorActivityGuide(selectedMentorActivity.id)}
        </UnifiedModal>
      )}

      {/* Platform-styled Transformation Case Overlay Modal */}
      {activeSectorData && (
        <UnifiedModal
          isOpen={showCaseOverlay}
          onClose={() => setShowCaseOverlay(false)}
          title={`Proyecto de Transformación: ${activeSectorData.name} - ${activeSectorData.companyName}`}
          subtitle="Marco Estratégico, Cumplimiento Normativo y Plan de Acción de la Empresa"
          type="informativa"
          configOverride={{ width: '950px' }}
        >
          {/* Internal Tabs inside the modal */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
            {['context', 'problems', 'compliance', 'roadmap'].map((tab) => {
              const isActive = modalActiveTab === tab;
              const labels: Record<string, string> = {
                context: '1. Contexto Estratégico',
                problems: '2. Dolores y Situación Inicial',
                compliance: '3. Cumplimiento y Productos Clave',
                roadmap: '4. Metas y Resultados'
              };
              return (
                <button
                  key={tab}
                  onClick={() => setModalActiveTab(tab as any)}
                  style={{
                    background: isActive ? '#4f46e5' : 'transparent',
                    color: isActive ? 'white' : '#64748b',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 4px 10px rgba(79, 70, 229, 0.15)' : 'none'
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          {modalActiveTab === 'context' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contexto de la Industria:</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>{activeSectorData.industryContext}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contexto Particular ({activeSectorData.companyName}):</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{activeSectorData.companyContext}</p>
                </div>
                <div style={{ background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '14px' }}>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>Características Estratégicas Clave:</h5>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#581c87', lineHeight: 1.4 }}>
                    <li><strong>Patrocinador Ejecutivo:</strong> Vicepresidente de Operaciones / CDO Corporate</li>
                    <li><strong>Alcance Primario:</strong> 100% de los Sistemas de Información Críticos</li>
                    <li><strong>Presupuesto de Gobierno:</strong> Asignado y Aprobado para Fase de Madurez</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {modalActiveTab === 'problems' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Debilidades e Inconsistencias:</h4>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.88rem', color: '#7f1d1d', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeSectorData.problems.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>Situación Inicial en la Base de Datos</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '12px' }}>
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 850, color: '#b45309', display: 'block' }}>{realEvidence['risks'] ? realEvidence['risks'].length : 0}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#78350f', textTransform: 'uppercase', display: 'block' }}>Riesgos</span>
                    </div>
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 850, color: '#b91c1c', display: 'block' }}>{realEvidence['incidents'] ? realEvidence['incidents'].length : 0}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7f1d1d', textTransform: 'uppercase', display: 'block' }}>Incidentes</span>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 850, color: '#475569', display: 'block' }}>{realEvidence['findings'] ? realEvidence['findings'].length : 0}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', display: 'block' }}>Hallazgos</span>
                    </div>
                  </div>
                </div>
                <div style={{ border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: '12px', padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Madurez Inicial</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#991b1b' }}>Nivel 1 (Inicial / Caótico)</h4>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#7f1d1d' }}>Los datos se gestionan de manera reactiva por silos y no existe propiedad formalizada.</p>
                </div>
              </div>
            </div>
          )}

          {modalActiveTab === 'compliance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>Normas y Regulaciones Obligatorias:</h4>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: '#047857', lineHeight: 1.4, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeSectorData.regulations.map((reg, i) => <li key={i} style={{ fontWeight: 600 }}>{reg}</li>)}
                </ul>
              </div>

              {/* Mapping Products with Regulations */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', background: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>Soluciones de GovData para Cumplimiento Normativo:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <strong style={{ color: '#4f46e5' }}>Catálogo de Datos y Linaje</strong>
                    <span style={{ color: '#64748b' }}>Habilita auditorías e integridad referencial</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <strong style={{ color: '#4f46e5' }}>Módulo de Seguridad y Enmascaramiento PII</strong>
                    <span style={{ color: '#64748b' }}>Garantiza confidencialidad frente a Ley 1581/GDPR</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <strong style={{ color: '#4f46e5' }}>Reglas de Calidad y Alertas Automáticas</strong>
                    <span style={{ color: '#64748b' }}>Previene fallas operativas de reporte a reguladores</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <strong style={{ color: '#4f46e5' }}>Matriz RACI y Workflows Operativos</strong>
                    <span style={{ color: '#64748b' }}>Formaliza políticas y control documental auditable</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {modalActiveTab === 'roadmap' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>Plan de Acción Requerido en la Plataforma:</h4>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.88rem', color: '#581c87', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeSectorData.actionPlan.map((act, i) => <li key={i}>{act}</li>)}
                </ul>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>Resultados Estratégicos Objetivo (KPIs):</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: '#047857', lineHeight: 1.4, fontWeight: 600 }}>
                    {activeSectorData.outcomes.map((o, i) => <li key={i} style={{ marginBottom: '4px' }}>{o}</li>)}
                  </ul>
                </div>
                <div style={{ border: '1px solid #d1fae5', background: '#f6fdf9', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Madurez Esperada al Completar</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>Nivel 3.5 (Gestionado / Definido)</h4>
                </div>
              </div>
            </div>
          )}
        </UnifiedModal>
      )}
    </div>
  );
}
