// src/app/normativas/data/normativas-data.ts

export type NormaEstado = 'vigente' | 'desactualizado' | 'en_revision' | 'derogado';
export type NormaTipo = 'Ley' | 'Decreto' | 'Resolución' | 'Circular' | 'Estándar' | 'Framework' | 'Guía' | 'Manual' | 'Política' | 'Regulación';
export type NormaCategoria =
  | 'Gobierno de Datos'
  | 'Calidad de Datos'
  | 'Seguridad de la Información'
  | 'Protección de Datos Personales'
  | 'Datos Abiertos'
  | 'Arquitectura de Datos'
  | 'Metadatos'
  | 'Riesgos'
  | 'Auditoría'
  | 'Inteligencia Artificial'
  | 'Gobierno Digital';

export interface ChecklistItem {
  id: string;
  pregunta: string;
  dominio: string;
  estado: 'cumple' | 'parcial' | 'no_cumple' | 'no_aplica' | null;
  evidencia?: string;
}

export interface Riesgo {
  id: string;
  nombre: string;
  impacto: 'Alto' | 'Medio' | 'Bajo';
  probabilidad: 'Alta' | 'Media' | 'Baja';
  tratamiento: string;
}

export interface Control {
  id: string;
  nombre: string;
  tipo: string;
  frecuencia: string;
  responsable: string;
}

export interface NormaVersion {
  version: string;
  fecha: string;
  cambios: string;
  responsable: string;
}

export interface Normativa {
  id: string;
  codigo: string;
  nombre: string;
  nombreCorto: string;
  version: string;
  tipo: NormaTipo;
  categoria: NormaCategoria;
  categorias: NormaCategoria[];
  descripcion: string;
  entidadEmisora: string;
  pais: string;
  bandera: string;
  fechaPublicacion: string;
  fechaVigencia: string;
  estado: NormaEstado;
  urlOficial: string;
  palabrasClave: string[];
  // IA Generated
  resumenEjecutivo: string;
  objetivo: string;
  alcance: string;
  obligaciones: string[];
  sanciones: string;
  rolesInvolucrados: string[];
  controles: Control[];
  riesgos: Riesgo[];
  indicadores: string[];
  procesosAfectados: string[];
  checklist: ChecklistItem[];
  versiones: NormaVersion[];
  normativasRelacionadas: string[];
  // Graph
  requisitosCount: number;
  politicasCount: number;
  auditoriasCount: number;
  // Visual
  colorPrimario: string;
  colorSecundario: string;
  icono: string;
  cumplimientoPct: number;
}

export const CATEGORIAS_CONFIG: Record<NormaCategoria, { color: string; colorSecundario: string; emoji: string }> = {
  'Gobierno de Datos':          { color: '#3b82f6', colorSecundario: '#1d4ed8', emoji: '🏛️' },
  'Calidad de Datos':           { color: '#10b981', colorSecundario: '#059669', emoji: '✅' },
  'Seguridad de la Información':{ color: '#ef4444', colorSecundario: '#b91c1c', emoji: '🔐' },
  'Protección de Datos Personales':{ color: '#f59e0b', colorSecundario: '#d97706', emoji: '🛡️' },
  'Datos Abiertos':             { color: '#06b6d4', colorSecundario: '#0891b2', emoji: '🌐' },
  'Arquitectura de Datos':      { color: '#8b5cf6', colorSecundario: '#6d28d9', emoji: '🏗️' },
  'Metadatos':                  { color: '#ec4899', colorSecundario: '#be185d', emoji: '🏷️' },
  'Riesgos':                    { color: '#f97316', colorSecundario: '#ea580c', emoji: '⚠️' },
  'Auditoría':                  { color: '#84cc16', colorSecundario: '#65a30d', emoji: '🔍' },
  'Inteligencia Artificial':    { color: '#6366f1', colorSecundario: '#4f46e5', emoji: '🤖' },
  'Gobierno Digital':           { color: '#14b8a6', colorSecundario: '#0d9488', emoji: '💻' },
};

export const NORMATIVAS: Normativa[] = [
  {
    id: 'dama-dmbok2',
    codigo: 'DAMA-DMBOK-2',
    nombre: 'DAMA Data Management Body of Knowledge v2',
    nombreCorto: 'DAMA-DMBOK v2',
    version: '2.0',
    tipo: 'Framework',
    categoria: 'Gobierno de Datos',
    categorias: ['Gobierno de Datos', 'Calidad de Datos', 'Metadatos', 'Arquitectura de Datos'],
    descripcion: 'Marco de referencia estándar global para la gestión de datos, desarrollado por DAMA International. Define 11 áreas de conocimiento del Data Management.',
    entidadEmisora: 'DAMA International',
    pais: 'Internacional',
    bandera: '🌍',
    fechaPublicacion: '2017-07-01',
    fechaVigencia: '2024-12-31',
    estado: 'vigente',
    urlOficial: 'https://www.dama.org/cpages/body-of-knowledge',
    palabrasClave: ['data governance', 'data management', 'data quality', 'metadata', 'DMBOK', 'DAMA'],
    resumenEjecutivo: 'DAMA-DMBOK v2 es el estándar global de facto para la gestión de datos empresariales. Define 11 áreas de conocimiento incluyendo Gobierno de Datos, Arquitectura de Datos, Modelado, Almacenamiento, Seguridad, Integración, Documentos y Contenido, Datos de Referencia y Maestros, Inteligencia de Negocios, Metadatos y Calidad de Datos. Proporciona un vocabulario común y un marco organizacional para profesionales de datos.',
    objetivo: 'Proporcionar un cuerpo de conocimiento estándar y reconocido mundialmente para la gestión de datos que sirva como guía práctica y marco de referencia para organizaciones e individuos.',
    alcance: 'Aplica a todas las organizaciones que gestionan datos como activo estratégico, independientemente del sector, tamaño o industria. Cubre todo el ciclo de vida del dato.',
    obligaciones: [
      'Designar roles formales de Data Governance (CDO, Data Steward, Data Owner)',
      'Establecer un Data Governance Council o comité equivalente',
      'Documentar políticas y procedimientos de gestión de datos a nivel corporativo',
      'Implementar métricas de calidad de datos por dominio',
      'Mantener un catálogo de datos empresarial con metadatos de negocio y técnicos',
      'Realizar evaluaciones periódicas de madurez en gestión de datos',
    ],
    sanciones: 'DAMA-DMBOK es un framework de referencia, no una regulación obligatoria. Sin embargo, el no alineamiento puede resultar en auditorías fallidas, bajo nivel de madurez DAMA y pérdida de credibilidad como organización gestionada por datos.',
    rolesInvolucrados: ['Chief Data Officer (CDO)', 'Data Governance Manager', 'Data Steward', 'Data Owner', 'Data Architect', 'Data Quality Manager', 'Metadata Manager'],
    controles: [
      { id: 'c1', nombre: 'Evaluación periódica de madurez DAMA', tipo: 'Preventivo', frecuencia: 'Anual', responsable: 'CDO' },
      { id: 'c2', nombre: 'Revisión de políticas de datos', tipo: 'Correctivo', frecuencia: 'Semestral', responsable: 'Data Governance Manager' },
      { id: 'c3', nombre: 'Auditoría de calidad de datos', tipo: 'Detectivo', frecuencia: 'Trimestral', responsable: 'Data Quality Manager' },
      { id: 'c4', nombre: 'Inventario de activos de datos actualizado', tipo: 'Preventivo', frecuencia: 'Mensual', responsable: 'Data Steward' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Falta de patrocinio ejecutivo en Gobierno de Datos', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Establecer comité ejecutivo con CDO y C-Suite' },
      { id: 'r2', nombre: 'Datos sin dueño definido (Data Owner)', impacto: 'Alto', probabilidad: 'Alta', tratamiento: 'Mapeo de dominios de datos y asignación formal de Data Owners' },
      { id: 'r3', nombre: 'Metadatos desactualizados o inconsistentes', impacto: 'Medio', probabilidad: 'Alta', tratamiento: 'Implementar catálogo de datos con workflows de actualización' },
    ],
    indicadores: ['% dominios de datos con Data Owner asignado', '% políticas documentadas vs total requeridas', 'Nivel de madurez DAMA por área de conocimiento', 'Nº de incidentes de calidad de datos por mes'],
    procesosAfectados: ['Gobierno corporativo', 'Gestión de TI', 'Análisis de negocios', 'Auditoría interna', 'Gestión de riesgos'],
    checklist: [
      { id: 'ch1', pregunta: '¿Existe un programa formal de Gobierno de Datos con patrocinio ejecutivo?', dominio: 'Data Governance', estado: null },
      { id: 'ch2', pregunta: '¿Se ha definido un CDO o rol equivalente en la organización?', dominio: 'Data Governance', estado: null },
      { id: 'ch3', pregunta: '¿Existe un inventario o catálogo de activos de datos empresarial?', dominio: 'Data Architecture', estado: null },
      { id: 'ch4', pregunta: '¿Se han definido y documentado dimensiones de calidad de datos?', dominio: 'Data Quality', estado: null },
      { id: 'ch5', pregunta: '¿Existe un repositorio de metadatos de negocio y técnicos?', dominio: 'Metadata', estado: null },
      { id: 'ch6', pregunta: '¿Se realizan evaluaciones periódicas de madurez en gestión de datos (DAMA/DCAM)?', dominio: 'Data Governance', estado: null },
      { id: 'ch7', pregunta: '¿Los Data Stewards y Data Owners tienen responsabilidades formalmente documentadas y asignadas?', dominio: 'Data Governance', estado: null },
      { id: 'ch8', pregunta: '¿Existen políticas corporativas de clasificación, retención y ciclo de vida de datos?', dominio: 'Data Architecture', estado: null },
    ],
    versiones: [
      { version: '1.0', fecha: '2009-01-01', cambios: 'Primera edición del DMBOK', responsable: 'DAMA International' },
      { version: '2.0', fecha: '2017-07-01', cambios: 'Revisión completa: 11 áreas de conocimiento, diagrama DAMA-DMBOK2, nueva estructura', responsable: 'DAMA International' },
    ],
    normativasRelacionadas: ['iso-8000', 'iso-38505', 'cobit-2019', 'dcam'],
    requisitosCount: 47,
    politicasCount: 12,
    auditoriasCount: 8,
    colorPrimario: '#3b82f6',
    colorSecundario: '#1d4ed8',
    icono: '🏛️',
    cumplimientoPct: 0,
  },
  {
    id: 'iso-8000',
    codigo: 'ISO-8000',
    nombre: 'ISO 8000 Data Quality Standard',
    nombreCorto: 'ISO 8000',
    version: '2022',
    tipo: 'Estándar',
    categoria: 'Calidad de Datos',
    categorias: ['Calidad de Datos', 'Metadatos', 'Gobierno de Datos'],
    descripcion: 'Estándar internacional ISO que define los requisitos para la calidad de datos de master data y datos transaccionales. Establece el marco para la portabilidad de datos de calidad.',
    entidadEmisora: 'ISO / IEC',
    pais: 'Internacional',
    bandera: '🌍',
    fechaPublicacion: '2022-06-01',
    fechaVigencia: '2027-06-01',
    estado: 'vigente',
    urlOficial: 'https://www.iso.org/standard/81745.html',
    palabrasClave: ['ISO 8000', 'data quality', 'master data', 'calidad de datos', 'portabilidad'],
    resumenEjecutivo: 'ISO 8000 es la familia de estándares internacionales dedicada exclusivamente a la calidad de datos. Cubre desde los fundamentos de calidad de datos (parte 2) hasta los requisitos para master data (parte 110), datos transaccionales (parte 120) y el intercambio de datos de calidad (parte 130). Define características medibles como exactitud, completitud, consistencia, actualidad, unicidad y validez.',
    objetivo: 'Definir estándares internacionales para la calidad de datos, especialmente master data y datos transaccionales, asegurando que los datos sean aptos para el propósito para el que son utilizados.',
    alcance: 'Organizaciones que intercambian, gestionan o consumen datos maestros y transaccionales. Aplica especialmente a cadenas de suministro, industria manufacturera, sector financiero y gobierno.',
    obligaciones: [
      'Definir métricas de calidad de datos por dimensión (exactitud, completitud, consistencia, etc.)',
      'Establecer umbrales mínimos de calidad para datos críticos y maestros',
      'Documentar el proceso de limpieza, enriquecimiento y de-duplicación de datos',
      'Implementar controles de calidad en la ingesta de datos',
      'Mantener trazabilidad y linaje de datos de extremo a extremo',
    ],
    sanciones: 'Estándar voluntario. El incumplimiento en sectores regulados puede generar rechazos de certificación, problemas en auditorías y pérdida de confianza en los datos organizacionales.',
    rolesInvolucrados: ['Data Quality Manager', 'Data Steward', 'Data Architect', 'Business Analyst', 'Data Engineer'],
    controles: [
      { id: 'c1', nombre: 'Perfilado de calidad de datos mensual', tipo: 'Detectivo', frecuencia: 'Mensual', responsable: 'Data Quality Manager' },
      { id: 'c2', nombre: 'Reglas de validación en pipelines de datos', tipo: 'Preventivo', frecuencia: 'Continuo', responsable: 'Data Engineer' },
      { id: 'c3', nombre: 'Dashboard de KPIs de calidad', tipo: 'Detectivo', frecuencia: 'Diario', responsable: 'Data Steward' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Decisiones basadas en datos inexactos', impacto: 'Alto', probabilidad: 'Alta', tratamiento: 'Implementar validación automática en fuentes de datos críticas' },
      { id: 'r2', nombre: 'Duplicación de registros maestros', impacto: 'Medio', probabilidad: 'Alta', tratamiento: 'MDM con reglas de deduplicación y golden record' },
    ],
    indicadores: ['% registros que cumplen dimensiones de calidad', 'Tasa de duplicados en master data', '% campos completos en entidades críticas', 'Time-to-detect de problemas de calidad'],
    procesosAfectados: ['Gestión de master data', 'Cadena de suministro', 'Reporting ejecutivo', 'Analítica de negocios'],
    checklist: [
      { id: 'ch1', pregunta: '¿Se han definido dimensiones de calidad de datos para datos críticos de negocio (CDE)?', dominio: 'Data Quality', estado: null },
      { id: 'ch2', pregunta: '¿Existen umbrales mínimos de calidad y KPIs documentados por entidad?', dominio: 'Data Quality', estado: null },
      { id: 'ch3', pregunta: '¿Se realizan análisis de perfilamiento de calidad de datos periódicamente?', dominio: 'Data Quality', estado: null },
      { id: 'ch4', pregunta: '¿El linaje y origen de datos (Data Provenance) está documentado para reportes clave?', dominio: 'Metadata', estado: null },
      { id: 'ch5', pregunta: '¿Existen procesos automáticos de detección y alertas para errores de calidad?', dominio: 'Data Quality', estado: null },
    ],
    versiones: [{ version: '2022', fecha: '2022-06-01', cambios: 'Última actualización de la familia ISO 8000', responsable: 'ISO' }],
    normativasRelacionadas: ['dama-dmbok2', 'iso-38505'],
    requisitosCount: 22,
    politicasCount: 5,
    auditoriasCount: 3,
    colorPrimario: '#10b981',
    colorSecundario: '#059669',
    icono: '✅',
    cumplimientoPct: 0,
  },
  {
    id: 'iso-27001',
    codigo: 'ISO-27001:2022',
    nombre: 'ISO/IEC 27001:2022 Information Security Management Systems',
    nombreCorto: 'ISO 27001',
    version: '2022',
    tipo: 'Estándar',
    categoria: 'Seguridad de la Información',
    categorias: ['Seguridad de la Información', 'Riesgos', 'Auditoría'],
    descripcion: 'Estándar internacional que especifica los requisitos para establecer, implementar, mantener y mejorar continuamente un Sistema de Gestión de Seguridad de la Información (SGSI).',
    entidadEmisora: 'ISO / IEC',
    pais: 'Internacional',
    bandera: '🌍',
    fechaPublicacion: '2022-10-25',
    fechaVigencia: '2025-10-25',
    estado: 'vigente',
    urlOficial: 'https://www.iso.org/standard/27001',
    palabrasClave: ['ISO 27001', 'seguridad de la información', 'SGSI', 'seguridad', 'ciberseguridad', 'riesgos'],
    resumenEjecutivo: 'ISO 27001:2022 especifica los requisitos para un SGSI estructurado bajo la estructura de alto nivel de ISO (Anexo SL). Su Anexo A contiene 93 controles organizados en 4 secciones (Organizacionales, Personas, Físicos y Tecnológicos), introduciendo controles como Inteligencia de Amenazas, Seguridad de la Información para el uso de servicios en la nube, y Eliminación de Información.',
    objetivo: 'Proteger la confidencialidad, integridad y disponibilidad de la información de la organización mediante la aplicación de un proceso de gestión de riesgos.',
    alcance: 'Todo tipo de organizaciones, públicas o privadas, que deseen certificar su SGSI y asegurar la protección de sus activos de información.',
    obligaciones: [
      'Realizar análisis y evaluación periódica de riesgos de seguridad de la información',
      'Definir y aprobar la Declaración de Aplicabilidad (SoA)',
      'Implementar políticas de control de acceso lógico y físico basadas en necesidad de conocer',
      'Definir un plan de concienciación y formación en ciberseguridad para todo el personal',
      'Establecer procedimientos y canales para la gestión y notificación de incidentes de seguridad',
      'Realizar auditorías internas del SGSI a intervalos planificados',
    ],
    sanciones: 'Estándar voluntario para certificación. Sin embargo, puede ser obligatorio por contratos comerciales o regulaciones sectoriales.',
    rolesInvolucrados: ['CISO (Chief Information Security Officer)', 'Auditor de Seguridad', 'IT Security Engineer', 'Data Protection Officer'],
    controles: [
      { id: 'c1', nombre: 'Análisis de riesgos de seguridad', tipo: 'Preventivo', frecuencia: 'Anual', responsable: 'CISO' },
      { id: 'c2', nombre: 'Auditoría interna del SGSI', tipo: 'Detectivo', frecuencia: 'Anual', responsable: 'Auditor Interno' },
      { id: 'c3', nombre: 'Gestión de accesos e identidades', tipo: 'Preventivo', frecuencia: 'Continuo', responsable: 'IT Manager' },
      { id: 'c4', nombre: 'Gestión de incidentes de seguridad', tipo: 'Correctivo', frecuencia: 'Según ocurrencia', responsable: 'CISO' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Acceso no autorizado a datos confidenciales', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Control de acceso basado en roles y MFA' },
      { id: 'r2', nombre: 'Pérdida o robo de datos (data breach)', impacto: 'Alto', probabilidad: 'Baja', tratamiento: 'Cifrado, DLP y monitoreo continuo' },
      { id: 'r3', nombre: 'Interrupción de servicios críticos', impacto: 'Alto', probabilidad: 'Baja', tratamiento: 'Plan de continuidad y recuperación ante desastres' },
    ],
    indicadores: ['% de incidentes de seguridad resueltos en SLA', '% de empleados capacitados en seguridad', 'Nº de vulnerabilidades críticas sin mitigar'],
    procesosAfectados: ['Tecnología de la información', 'Recursos humanos', 'Operaciones comerciales', 'Auditoría externa', 'Legal y cumplimiento'],
    checklist: [
      { id: 'ch1', pregunta: '¿Existe una política de seguridad de la información formalmente aprobada por la dirección?', dominio: 'Organizational', estado: null },
      { id: 'ch2', pregunta: '¿Se ha realizado un análisis de riesgos de seguridad que cubra todos los activos críticos en el último año?', dominio: 'Risk Management', estado: null },
      { id: 'ch3', pregunta: '¿Existe un programa activo de concienciación en seguridad de la información para empleados?', dominio: 'People', estado: null },
      { id: 'ch4', pregunta: '¿Se gestiona y mantiene actualizado un inventario de activos de información con su respectiva clasificación?', dominio: 'Organizational', estado: null },
      { id: 'ch5', pregunta: '¿Existe un procedimiento documentado y probado para la gestión y escalación de incidentes de seguridad?', dominio: 'Technological', estado: null },
      { id: 'ch6', pregunta: '¿Se realizan auditorías internas periódicas para evaluar la conformidad con el estándar?', dominio: 'Audit', estado: null },
    ],
    versiones: [
      { version: '2013', fecha: '2013-10-01', cambios: 'Estructura anterior con 114 controles', responsable: 'ISO' },
      { version: '2022', fecha: '2022-10-25', cambios: 'Actualización con simplificación a 93 controles y 4 temas', responsable: 'ISO' },
    ],
    normativasRelacionadas: ['iso-27002', 'nist-csf-2', 'gdpr'],
    requisitosCount: 93,
    politicasCount: 18,
    auditoriasCount: 12,
    colorPrimario: '#ef4444',
    colorSecundario: '#b91c1c',
    icono: '🔐',
    cumplimientoPct: 0,
  },
  {
    id: 'gdpr',
    codigo: 'GDPR-EU-2016',
    nombre: 'General Data Protection Regulation (GDPR)',
    nombreCorto: 'GDPR',
    version: 'Regulation 2016/679',
    tipo: 'Regulación',
    categoria: 'Protección de Datos Personales',
    categorias: ['Protección de Datos Personales', 'Riesgos', 'Auditoría'],
    descripcion: 'Reglamento de la Unión Europea sobre protección de datos y privacidad para todas las personas dentro de la UE y el EEE. Regula la transferencia de datos personales fuera de la UE.',
    entidadEmisora: 'Parlamento Europeo y Consejo de la UE',
    pais: 'Unión Europea',
    bandera: '🇪🇺',
    fechaPublicacion: '2016-04-27',
    fechaVigencia: '2018-05-25',
    estado: 'vigente',
    urlOficial: 'https://gdpr-info.eu/',
    palabrasClave: ['GDPR', 'privacidad', 'datos personales', 'Europa', 'derechos de titulares', 'DPO', 'DPIA'],
    resumenEjecutivo: 'El GDPR es la ley de privacidad más estricta del mundo. Introduce los principios de licitud, limitación de finalidad, minimización, exactitud, limitación de almacenamiento, integridad y responsabilidad proactiva. Otorga derechos clave a los titulares (acceso, rectificación, portabilidad, olvido) y exige medidas como el ROPA (Registro de Actividades), las Evaluaciones de Impacto (DPIA) y la designación de un DPO en ciertos casos.',
    objetivo: 'Armonizar las leyes de privacidad en Europa y proteger el derecho fundamental de los ciudadanos al control de sus datos personales.',
    alcance: 'Cualquier organización a nivel mundial que ofrezca bienes o servicios a ciudadanos de la UE, o monitoree su comportamiento en la UE.',
    obligaciones: [
      'Mantener un Registro de Actividades de Tratamiento (ROPA) actualizado',
      'Garantizar una base legal legítima (consentimiento, contrato, interés legítimo) para el tratamiento',
      'Facilitar canales ágiles para el ejercicio de derechos ARCO-Plus (acceso, portabilidad, olvido, etc.)',
      'Implementar protección de datos desde el diseño y por defecto (Privacy by Design)',
      'Realizar Evaluaciones de Impacto sobre la Protección de Datos (DPIA) para tratamientos de alto riesgo',
      'Notificar brechas de seguridad a la autoridad de control en un plazo máximo de 72 horas',
    ],
    sanciones: 'Multas administrativas de hasta €20 millones o el 4% del volumen de negocio anual global del ejercicio financiero anterior (la cifra que sea mayor).',
    rolesInvolucrados: ['Responsable del Tratamiento', 'Encargado del Tratamiento', 'Data Protection Officer (DPO)', 'Autoridad de Control (Supervisora)'],
    controles: [
      { id: 'c1', nombre: 'Registro de Actividades de Tratamiento (RAT)', tipo: 'Preventivo', frecuencia: 'Continuo', responsable: 'DPO' },
      { id: 'c2', nombre: 'Evaluación de Impacto DPIA', tipo: 'Preventivo', frecuencia: 'Por proyecto', responsable: 'DPO' },
      { id: 'c3', nombre: 'Gestión de solicitudes de derechos', tipo: 'Correctivo', frecuencia: 'Según solicitud', responsable: 'DPO' },
      { id: 'c4', nombre: 'Auditoría de cumplimiento GDPR', tipo: 'Detectivo', frecuencia: 'Anual', responsable: 'DPO / Auditor' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Multa por brecha de datos no reportada', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Protocolo de respuesta a incidentes con notificación en 72h' },
      { id: 'r2', nombre: 'Tratamiento sin base legal válida', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Auditoría de bases legales para cada actividad de tratamiento' },
      { id: 'r3', nombre: 'Transferencia internacional sin garantías adecuadas', impacto: 'Alto', probabilidad: 'Baja', tratamiento: 'Implementar SCCs o BCRs para transferencias internacionales' },
    ],
    indicadores: ['% de brechas de datos notificadas antes de 72h', 'Nº de solicitudes de derechos atendidas en tiempo (<1 mes)', '% tratamientos de alto riesgo con DPIA aprobado'],
    procesosAfectados: ['Marketing y ventas', 'Sistemas e infraestructura TI', 'Recursos humanos', 'Atención al cliente', 'Legal'],
    checklist: [
      { id: 'ch1', pregunta: '¿Existe un Registro de Actividades de Tratamiento (RAT/ROPA) actualizado por área?', dominio: 'Accountability', estado: null },
      { id: 'ch2', pregunta: '¿Se ha definido y documentado una base legal válida para cada tratamiento de datos?', dominio: 'Lawfulness', estado: null },
      { id: 'ch3', pregunta: '¿Están habilitados canales y workflows para resolver el derecho al olvido y portabilidad en menos de 30 días?', dominio: 'Rights', estado: null },
      { id: 'ch4', pregunta: '¿Se realizan evaluaciones de impacto (DPIA) antes de implementar nuevos sistemas de datos?', dominio: 'Risk Management', estado: null },
      { id: 'ch5', pregunta: '¿Los contratos con terceros encargados (Data Processors) incluyen cláusulas del Art. 28?', dominio: 'Contracts', estado: null },
      { id: 'ch6', pregunta: '¿Existe un proceso para detectar y notificar brechas de seguridad a la autoridad en menos de 72 horas?', dominio: 'Security', estado: null },
    ],
    versiones: [{ version: 'Regulation 2016/679', fecha: '2016-04-27', cambios: 'Aprobación del reglamento único europeo', responsable: 'UE' }],
    normativasRelacionadas: ['ley-1581', 'iso-27001'],
    requisitosCount: 99,
    politicasCount: 15,
    auditoriasCount: 10,
    colorPrimario: '#3b82f6',
    colorSecundario: '#1d4ed8',
    icono: '🇪🇺',
    cumplimientoPct: 0,
  },
  {
    id: 'ley-1581',
    codigo: 'LEY-1581-2012',
    nombre: 'Ley 1581 de 2012 - Régimen General de Protección de Datos Personales',
    nombreCorto: 'Ley 1581',
    version: '2012',
    tipo: 'Ley',
    categoria: 'Protección de Datos Personales',
    categorias: ['Protección de Datos Personales', 'Gobierno Digital'],
    descripcion: 'Ley colombiana de protección de datos personales que regula el tratamiento de datos de ciudadanos colombianos. Establece principios, derechos y obligaciones para el tratamiento de datos personales.',
    entidadEmisora: 'Congreso de Colombia',
    pais: 'Colombia',
    bandera: '🇨🇴',
    fechaPublicacion: '2012-10-17',
    fechaVigencia: '2012-10-17',
    estado: 'vigente',
    urlOficial: 'https://www.sic.gov.co/ley-1581-de-2012',
    palabrasClave: ['Ley 1581', 'habeas data', 'datos personales', 'Colombia', 'SIC', 'protección de datos'],
    resumenEjecutivo: 'La Ley 1581 de 2012 es la norma fundamental de protección de datos personales en Colombia. Establece los principios de legalidad, finalidad, libertad, veracidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad. Obliga a registrar bases de datos ante la SIC, designar responsables y encargados, obtener autorización previa del titular y atender derechos de acceso, corrección, supresión, revocación y queja. El Decreto 1377 de 2013 la reglamenta.',
    objetivo: 'Proteger el derecho fundamental al habeas data de los ciudadanos colombianos, regulando el tratamiento de datos personales realizados por personas naturales o jurídicas.',
    alcance: 'Toda persona natural o jurídica que realice tratamiento de datos personales en territorio colombiano o de titulares ubicados en Colombia.',
    obligaciones: [
      'Inscribir y actualizar periódicamente las bases de datos en el Registro Nacional de Bases de Datos (RNBD) de la SIC',
      'Obtener autorización previa, expresa e informada del titular de los datos',
      'Designar formalmente un Oficial de Protección de Datos o área responsable',
      'Implementar una Política de Tratamiento de Información (PTI/PTDP)',
      'Atender las consultas de los titulares en un plazo máximo de 10 días hábiles y los reclamos en 15 días hábiles',
      'Adoptar medidas técnicas y administrativas de seguridad para evitar pérdida, acceso no autorizado o adulteración',
    ],
    sanciones: 'Multas de hasta 2.000 SMMLV (≈ COP 2.600 millones en 2024). La SIC puede ordenar la suspensión de operaciones y el bloqueo de bases de datos. Sanciones penales para delitos de violación de datos.',
    rolesInvolucrados: ['Responsable del Tratamiento', 'Encargado del Tratamiento', 'Titular del Dato', 'SIC (Autoridad de Control)'],
    controles: [
      { id: 'c1', nombre: 'Registro de bases de datos ante SIC', tipo: 'Preventivo', frecuencia: 'Una vez / actualización', responsable: 'Responsable Tratamiento' },
      { id: 'c2', nombre: 'Gestión de autorizaciones de titulares', tipo: 'Preventivo', frecuencia: 'Continuo', responsable: 'Responsable Tratamiento' },
      { id: 'c3', nombre: 'Atención de solicitudes ARCO', tipo: 'Correctivo', frecuencia: 'Según solicitud', responsable: 'Encargado Tratamiento' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Tratamiento sin autorización del titular', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Implementar flujos de captación de consentimiento documentado' },
      { id: 'r2', nombre: 'Bases de datos no registradas ante SIC', impacto: 'Alto', probabilidad: 'Alta', tratamiento: 'Auditoría de bases de datos y registro ante SIC' },
    ],
    indicadores: ['% bases de datos registradas ante SIC', '% solicitudes ARCO atendidas en plazo legal', 'Nº de quejas ante SIC por período'],
    procesosAfectados: ['Marketing', 'RRHH', 'Ventas', 'Servicio al Cliente', 'Cobranza'],
    checklist: [
      { id: 'ch1', pregunta: '¿Están inscritas y actualizadas anualmente las bases de datos en el RNBD de la SIC?', dominio: 'Legal', estado: null },
      { id: 'ch2', pregunta: '¿Está la Política de Tratamiento de Datos Personales (PTDP) aprobada, publicada y accesible a los titulares?', dominio: 'Governance', estado: null },
      { id: 'ch3', pregunta: '¿Se obtienen autorizaciones previas, expresas e informadas de forma trazable para cada finalidad de tratamiento?', dominio: 'Consent', estado: null },
      { id: 'ch4', pregunta: '¿Existe un Oficial de Protección de Datos formalmente nombrado en la organización?', dominio: 'Governance', estado: null },
      { id: 'ch5', pregunta: '¿Se cuenta con contratos de transmisión de datos (con cláusulas del Decreto 1377) para proveedores terceros?', dominio: 'Contracts', estado: null },
    ],
    versiones: [
      { version: '2012', fecha: '2012-10-17', cambios: 'Promulgación de la ley', responsable: 'Congreso de Colombia' },
      { version: 'Dec.1377/2013', fecha: '2013-06-27', cambios: 'Decreto reglamentario que desarrolla aspectos prácticos', responsable: 'Presidencia Colombia' },
    ],
    normativasRelacionadas: ['gdpr', 'decreto-1377', 'conpes-3920', 'ley-1712'],
    requisitosCount: 42,
    politicasCount: 9,
    auditoriasCount: 6,
    colorPrimario: '#f59e0b',
    colorSecundario: '#d97706',
    icono: '🇨🇴',
    cumplimientoPct: 0,
  },
  {
    id: 'ley-1712',
    codigo: 'LEY-1712-2014',
    nombre: 'Ley 1712 de 2014 - Ley de Transparencia y del Derecho de Acceso a la Información Pública',
    nombreCorto: 'Ley 1712',
    version: '2014',
    tipo: 'Ley',
    categoria: 'Datos Abiertos',
    categorias: ['Datos Abiertos', 'Gobierno Digital', 'Protección de Datos Personales'],
    descripcion: 'Ley de transparencia que obliga a todas las entidades públicas e instituciones privadas que cumplan funciones públicas a facilitar el acceso a la información pública nacional.',
    entidadEmisora: 'Congreso de Colombia',
    pais: 'Colombia',
    bandera: '🇨🇴',
    fechaPublicacion: '2014-03-06',
    fechaVigencia: '2014-03-06',
    estado: 'vigente',
    urlOficial: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56880',
    palabrasClave: ['Ley 1712', 'transparencia', 'acceso a la información', 'datos abiertos', 'Colombia', 'información pública'],
    resumenEjecutivo: 'La Ley 1712 de 2014 regula el derecho de acceso a la información pública en Colombia. Define el principio de máxima publicidad y obliga a publicar proactivamente información de contratación, presupuestos, trámites, estructura y directorio. Regula los casos excepcionales de información clasificada (daños a derechos individuales) o reservada (seguridad pública, defensa nacional). Exige plazos estrictos para responder solicitudes de información.',
    objetivo: 'Garantizar el derecho de acceso a la información pública, la transparencia en la gestión pública y promover la participación ciudadana mediante la reutilización de datos.',
    alcance: 'Cualquier entidad del sector público, particulares que presten servicios públicos, partidos políticos y cualquier persona natural o jurídica que maneje recursos públicos.',
    obligaciones: [
      'Publicar de forma proactiva información institucional, presupuestos, compras y servicios en el portal web (Botón de Transparencia)',
      'Habilitar canales idóneos y accesibles para solicitudes de información ciudadana',
      'Clasificar la información pública bajo las categorías de clasificada, reservada o pública',
      'Implementar y publicar el Esquema de Publicación de Información y el Registro de Activos de Información',
      'Responder solicitudes de acceso a información pública en un plazo máximo de 10 días hábiles',
    ],
    sanciones: 'Sanciones disciplinarias por parte de la Procuraduría General de la Nación (destitución, suspensión o amonestación del funcionario responsable).',
    rolesInvolucrados: ['Oficial de Transparencia', 'Procuraduría General', 'Ministerio de las TIC', 'Ciudadano (Titular)'],
    controles: [
      { id: 'c1', nombre: 'Índice de Transparencia y Acceso a la Información (ITA)', tipo: 'Detectivo', frecuencia: 'Anual', responsable: 'Oficial de Transparencia' },
      { id: 'c2', nombre: 'Botón de transparencia actualizado', tipo: 'Preventivo', frecuencia: 'Mensual', responsable: 'Comunicaciones / TI' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Denegación injustificada de información pública', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Definir tabla de clasificación de información reservada y clasificada' },
      { id: 'r2', nombre: 'Botón de Transparencia desactualizado', impacto: 'Medio', probabilidad: 'Alta', tratamiento: 'Monitoreo automatizado de enlaces del esquema de publicación' },
    ],
    indicadores: ['Puntuación ITA en la Procuraduría', '% de solicitudes de información pública resueltas en plazo legal', 'Nº de conjuntos de datos publicados en datos.gov.co'],
    procesosAfectados: ['Comunicaciones externas', 'Servicio al ciudadano', 'Contratación y compras', 'Gestión documental y archivo'],
    checklist: [
      { id: 'ch1', pregunta: '¿Está el Botón de Transparencia y Acceso a la Información implementado y visible en el sitio web principal?', dominio: 'Transparency', estado: null },
      { id: 'ch2', pregunta: '¿Se han publicado el Registro de Activos de Información, el Índice de Información Clasificada y Reservada, y el Esquema de Publicación?', dominio: 'Transparency', estado: null },
      { id: 'ch3', pregunta: '¿Existen canales y un flujo documentado para la atención de solicitudes de información pública?', dominio: 'Citizen Rights', estado: null },
      { id: 'ch4', pregunta: '¿Se publica la información de compras y contratación de forma proactiva y estructurada (SECOP)?', dominio: 'Transparency', estado: null },
      { id: 'ch5', pregunta: '¿Se cuenta con un Programa de Gestión Documental (PGD) alineado a las directrices del Archivo General de la Nación?', dominio: 'Records Management', estado: null },
    ],
    versiones: [{ version: '2014', fecha: '2014-03-06', cambios: 'Aprobación presidencial de la ley', responsable: 'Congreso' }],
    normativasRelacionadas: ['ley-1581', 'conpes-3920'],
    requisitosCount: 33,
    politicasCount: 8,
    auditoriasCount: 5,
    colorPrimario: '#06b6d4',
    colorSecundario: '#0891b2',
    icono: '🌐',
    cumplimientoPct: 0,
  },
  {
    id: 'conpes-3920',
    codigo: 'CONPES-3920-2018',
    nombre: 'CONPES 3920 - Política Nacional de Explotación de Datos (Big Data)',
    nombreCorto: 'CONPES 3920',
    version: '3920',
    tipo: 'Política',
    categoria: 'Gobierno Digital',
    categorias: ['Gobierno Digital', 'Gobierno de Datos', 'Datos Abiertos'],
    descripcion: 'Política nacional en Colombia para promover el uso y explotación de datos del sector público como habilitador de desarrollo económico y social.',
    entidadEmisora: 'DNP (Departamento Nacional de Planeación)',
    pais: 'Colombia',
    bandera: '🇨🇴',
    fechaPublicacion: '2018-04-17',
    fechaVigencia: '2028-12-31',
    estado: 'vigente',
    urlOficial: 'https://colaboracion.dnp.gov.co/CDT/Conpes/Documentos/3920.pdf',
    palabrasClave: ['CONPES 3920', 'Big Data', 'explotación de datos', 'Colombia', 'Gobierno Digital', 'Datos Abiertos'],
    resumenEjecutivo: 'El CONPES 3920 define la estrategia nacional para que las entidades públicas colombianas generen valor a partir de los datos. Sus ejes de acción incluyen: 1) Mitigar barreras que impiden el intercambio y explotación de datos; 2) Desarrollar capacidades de talento humano; 3) Fortalecer la cultura de toma de decisiones basada en datos; 4) Habilitar un marco institucional y de gobernanza.',
    objetivo: 'Definir lineamientos para incentivar el aprovechamiento de datos como activo estratégico y el desarrollo de tecnologías asociadas al Big Data en el sector público.',
    alcance: 'Entidades de la Rama Ejecutiva del orden nacional, aplicable de forma referencial a entidades territoriales y sector privado.',
    obligaciones: [
      'Alinear las estrategias de tecnología y datos al Marco de Referencia de Arquitectura Empresarial (MRAE)',
      'Identificar y priorizar activos de datos que puedan ser publicados o compartidos',
      'Implementar lineamientos de interoperabilidad de datos (Servicios X-Road o equivalentes)',
      'Capacitar a servidores públicos en analítica y gobierno de datos',
    ],
    sanciones: 'Política de planeación y directriz de gobierno. No genera sanciones penales o económicas directas, pero influye en las evaluaciones de desempeño institucional (MIPG).',
    rolesInvolucrados: ['CDO Nacional', 'DNP', 'MinTIC', 'Oficinas de Planeación y TI de cada Entidad'],
    controles: [
      { id: 'c1', nombre: 'Medición de avance MIPG - Política de Gobierno Digital', tipo: 'Detectivo', frecuencia: 'Anual', responsable: 'Oficinas de Control Interno' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Falta de interoperabilidad entre sistemas gubernamentales', impacto: 'Alto', probabilidad: 'Alta', tratamiento: 'Adopción de estándares de interoperabilidad del MinTIC' },
    ],
    indicadores: ['Índice de madurez de Gobierno Digital (MIPG)', 'Nº de conjuntos de datos de alto valor reutilizados', '% presupuesto TI invertido en analítica'],
    procesosAfectados: ['Diseño de políticas públicas', 'Planeación institucional', 'Trámites y servicios ciudadanos'],
    checklist: [
      { id: 'ch1', pregunta: '¿Se cuenta con un inventario de activos de datos priorizado para interoperabilidad y datos abiertos?', dominio: 'Data Strategy', estado: null },
      { id: 'ch2', pregunta: '¿Se han adoptado y habilitado los lineamientos de servicios de interoperabilidad del MinTIC (intercambio seguro)?', dominio: 'Interoperability', estado: null },
      { id: 'ch3', pregunta: '¿Se ha capacitado al personal del área de analítica y datos en las metodologías oficiales de Big Data del gobierno?', dominio: 'Talent', estado: null },
      { id: 'ch4', pregunta: '¿La entidad cuenta con una arquitectura de datos alineada con el Marco de Referencia de Arquitectura Empresarial (MRAE)?', dominio: 'Architecture', estado: null },
      { id: 'ch5', pregunta: '¿Se aplican técnicas de analítica de datos en el diseño y evaluación de los trámites y servicios de la entidad?', dominio: 'Decision Making', estado: null },
    ],
    versiones: [{ version: '3920', fecha: '2018-04-17', cambios: 'Aprobación del documento oficial de política', responsable: 'DNP' }],
    normativasRelacionadas: ['ley-1581', 'ley-1712'],
    requisitosCount: 25,
    politicasCount: 6,
    auditoriasCount: 3,
    colorPrimario: '#14b8a6',
    colorSecundario: '#0d9488',
    icono: '🇨🇴',
    cumplimientoPct: 0,
  },
  {
    id: 'nist-csf-2',
    codigo: 'NIST-CSF-2.0',
    nombre: 'NIST Cybersecurity Framework 2.0',
    nombreCorto: 'NIST CSF 2.0',
    version: '2.0',
    tipo: 'Framework',
    categoria: 'Seguridad de la Información',
    categorias: ['Seguridad de la Información', 'Riesgos'],
    descripcion: 'Marco de ciberseguridad global del Instituto Nacional de Estándares y Tecnología de EE.UU. Actualizado en 2024 para incluir el pilar de Gobierno (Govern).',
    entidadEmisora: 'NIST (National Institute of Standards and Technology)',
    pais: 'EE.UU. / Internacional',
    bandera: '🇺🇸',
    fechaPublicacion: '2024-02-26',
    fechaVigencia: '2030-12-31',
    estado: 'vigente',
    urlOficial: 'https://www.nist.gov/cyberframework',
    palabrasClave: ['NIST', 'ciberseguridad', 'cybersecurity', 'framework', 'Govern', 'riesgos ciber'],
    resumenEjecutivo: 'NIST CSF 2.0 expande su alcance original más allá de infraestructura crítica para cualquier tipo de organización. Organiza la ciberseguridad en seis funciones fundamentales (Core Functions): Gobernanza (Govern), Identificación (Identify), Protección (Protect), Detección (Detect), Respuesta (Respond) y Recuperación (Recover). Introduce la gobernanza como función transversal para establecer estrategia y supervisión del riesgo.',
    objetivo: 'Proporcionar un marco de referencia flexible y basado en riesgos para que las organizaciones evalúen, gestionen y reduzcan su riesgo de ciberseguridad.',
    alcance: 'Aplicable a cualquier tipo de organización global, corporación o institución pública, independientemente de su nivel de madurez o sector.',
    obligaciones: [
      'Establecer y comunicar la estrategia y roles de ciberseguridad alineados a los objetivos del negocio',
      'Identificar activos de hardware, software y datos para evaluar vulnerabilidades',
      'Implementar medidas de protección (cifrado, control de acceso, seguridad física)',
      'Mantener capacidades de detección en tiempo real de anomalías y eventos de seguridad',
      'Desarrollar planes de respuesta ante incidentes (mitigación y comunicación)',
      'Establecer planes de recuperación ante desastres (DRP) y continuidad operativa',
    ],
    sanciones: 'Framework voluntario y gratuito. No genera multas directas, pero es un estándar de cumplimiento obligatorio en contratos federales de EE.UU. y marco de mejores prácticas.',
    rolesInvolucrados: ['CISO', 'Security Analyst', 'IT Operations Manager', 'CEO / Board of Directors'],
    controles: [
      { id: 'c1', nombre: 'Evaluación del riesgo de ciberseguridad', tipo: 'Preventivo', frecuencia: 'Semestral', responsable: 'CISO' },
      { id: 'c2', nombre: 'Plan de Respuesta ante Incidentes (IRP)', tipo: 'Correctivo', frecuencia: 'Anual', responsable: 'Security Team' },
      { id: 'c3', nombre: 'Monitoreo de red y eventos (SIEM)', tipo: 'Detectivo', frecuencia: 'Continuo', responsable: 'SOC Analyst' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Ataque de Ransomware en sistemas centrales', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Backups inmutables desconectados y detección proactiva' },
      { id: 'r2', nombre: 'Fuga de datos por credenciales comprometidas', impacto: 'Alto', probabilidad: 'Alta', tratamiento: 'MFA adaptativo y control de accesos Zero Trust' },
    ],
    indicadores: ['Mean Time to Detect (MTTD) de incidentes', 'Mean Time to Respond (MTTR) de incidentes', '% de sistemas con MFA obligatorio habilitado'],
    procesosAfectados: ['Operaciones tecnológicas', 'Gestión de riesgos corporativos', 'Legal y cumplimiento corporativo'],
    checklist: [
      { id: 'ch1', pregunta: '¿Se han definido las políticas de ciberseguridad y están alineadas con la estrategia corporativa (función GOVERN)?', dominio: 'Govern', estado: null },
      { id: 'ch2', pregunta: '¿Se mantiene un inventario de activos físicos y de software y se evalúan sus riesgos (función IDENTIFY)?', dominio: 'Identify', estado: null },
      { id: 'ch3', pregunta: '¿Existen controles de seguridad técnicos como cifrado de datos y MFA para accesos sensibles (función PROTECT)?', dominio: 'Protect', estado: null },
      { id: 'ch4', pregunta: '¿Se realiza monitoreo continuo de seguridad y detección de anomalías en redes y sistemas (función DETECT)?', dominio: 'Detect', estado: null },
      { id: 'ch5', pregunta: '¿Se cuenta con un plan de respuesta a incidentes de ciberseguridad documentado y probado (función RESPOND)?', dominio: 'Respond', estado: null },
      { id: 'ch6', pregunta: '¿Se tienen planes de recuperación y resiliencia para restaurar las operaciones críticas (función RECOVER)?', dominio: 'Recover', estado: null },
    ],
    versiones: [
      { version: '1.0', fecha: '2014-02-12', cambios: 'Versión inicial para infraestructura crítica', responsable: 'NIST' },
      { version: '1.1', fecha: '2018-04-16', cambios: 'Mejoras en control de accesos y gestión de la cadena de suministro', responsable: 'NIST' },
      { version: '2.0', fecha: '2024-02-26', cambios: 'Revisión completa: adición de la función GOVERN, alcance global no restringido a infraestructura crítica', responsable: 'NIST' },
    ],
    normativasRelacionadas: ['iso-27001', 'cobit-2019', 'cis-controls'],
    requisitosCount: 104,
    politicasCount: 20,
    auditoriasCount: 8,
    colorPrimario: '#f97316',
    colorSecundario: '#ea580c',
    icono: '🛡️',
    cumplimientoPct: 0,
  },
  {
    id: 'cobit-2019',
    codigo: 'COBIT-2019',
    nombre: 'COBIT 2019 - Control Objectives for Information and Related Technology',
    nombreCorto: 'COBIT 2019',
    version: '2019',
    tipo: 'Framework',
    categoria: 'Gobierno de Datos',
    categorias: ['Gobierno de Datos', 'Auditoría', 'Riesgos'],
    descripcion: 'Framework global de ISACA para el gobierno y gestión de la información y la tecnología empresarial. Conecta los objetivos de negocio con TI.',
    entidadEmisora: 'ISACA',
    pais: 'Internacional',
    bandera: '🌍',
    fechaPublicacion: '2018-11-15',
    fechaVigencia: '2028-12-31',
    estado: 'vigente',
    urlOficial: 'https://www.isaca.org/resources/cobit',
    palabrasClave: ['COBIT', 'ISACA', 'gobierno corporativo TI', 'gestión TI', 'control interno', 'evaluación TI'],
    resumenEjecutivo: 'COBIT 2019 define el gobierno de TI como la alineación estratégica entre los objetivos de negocio y la tecnología. Se basa en 40 objetivos de gobierno y gestión organizados en 5 dominios principales (EDM, APO, BAI, DSS, MEA). Introduce factores de diseño para adaptar el marco a las necesidades específicas de la organización.',
    objetivo: 'Proporcionar una metodología integral que ayude a las empresas a crear valor óptimo a partir de la tecnología y gestionar sus riesgos asociados.',
    alcance: 'Corporaciones y organizaciones grandes o medianas que necesitan un gobierno corporativo robusto para su tecnología y activos de información.',
    obligaciones: [
      'Evaluar, orientar y monitorear el uso de la tecnología empresarial por parte de la alta dirección',
      'Definir planes y estrategias de TI alineadas con los objetivos organizacionales',
      'Implementar procesos de gestión de la capacidad, riesgos y seguridad de la información',
      'Monitorear y evaluar de forma independiente el desempeño de los servicios de TI',
    ],
    sanciones: 'Framework voluntario de mejores prácticas. Utilizado ampliamente por auditores internos y externos como base para evaluar controles de TI.',
    rolesInvolucrados: ['Board of Directors', 'CEO', 'CIO', 'Audit Committee', 'IT Governance Officer'],
    controles: [
      { id: 'c1', nombre: 'Establecimiento del marco de gobierno de TI', tipo: 'Preventivo', frecuencia: 'Anual', responsable: 'CIO' },
      { id: 'c2', nombre: 'Evaluación de riesgos del portafolio TI', tipo: 'Preventivo', frecuencia: 'Semestral', responsable: 'IT Risk Manager' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Desalineación de proyectos TI con objetivos de negocio', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Alineación mediante mapa de objetivos y factores de diseño COBIT' },
    ],
    indicadores: ['% de objetivos de TI alineados a metas de negocio', '% de procesos de TI en el nivel de capacidad objetivo', 'Retorno de inversión (ROI) de proyectos de TI'],
    procesosAfectados: ['Planificación estratégica de TI', 'Desarrollo y adquisición de sistemas', 'Soporte y servicios de TI'],
    checklist: [
      { id: 'ch1', pregunta: '¿Existe un modelo de gobierno de TI implementado con responsabilidades claras para el órgano directivo (EDM01)?', dominio: 'EDM - Evaluate, Direct, Monitor', estado: null },
      { id: 'ch2', pregunta: '¿Se cuenta con una estrategia de TI definida y comunicada a las unidades de negocio (APO02)?', dominio: 'APO - Align, Plan, Organize', estado: null },
      { id: 'ch3', pregunta: '¿Está establecido un proceso de gestión de riesgos de TI alineado con el marco de riesgo corporativo (APO12)?', dominio: 'APO - Align, Plan, Organize', estado: null },
      { id: 'ch4', pregunta: '¿Se gestionan y evalúan los acuerdos de nivel de servicio (SLA) con proveedores y clientes internos (DSS01)?', dominio: 'DSS - Deliver, Service, Support', estado: null },
      { id: 'ch5', pregunta: '¿Se evalúa la conformidad de los procesos de TI con los requisitos regulatorios y de políticas (MEA03)?', dominio: 'MEA - Monitor, Evaluate, Assess', estado: null },
      { id: 'ch6', pregunta: '¿Se gestionan formalmente los activos de datos y la calidad de la información empresarial (APO14)?', dominio: 'APO - Align, Plan, Organize', estado: null },
    ],
    versiones: [
      { version: 'COBIT 5', fecha: '2012-04-10', cambios: 'Unificación de marcos de ISACA', responsable: 'ISACA' },
      { version: 'COBIT 2019', fecha: '2018-11-15', cambios: 'Adición de factores de diseño, enfoque ágil, modelos de capacidad actualizados', responsable: 'ISACA' },
    ],
    normativasRelacionadas: ['iso-38500', 'itil-4', 'iso-27001'],
    requisitosCount: 40,
    politicasCount: 12,
    auditoriasCount: 6,
    colorPrimario: '#6366f1',
    colorSecundario: '#4f46e5',
    icono: '⚙️',
    cumplimientoPct: 0,
  },
  {
    id: 'iso-38505',
    codigo: 'ISO-38505-1:2017',
    nombre: 'ISO/IEC 38505-1 Governance of IT - Governance of Data',
    nombreCorto: 'ISO 38505',
    version: '2017',
    tipo: 'Estándar',
    categoria: 'Gobierno de Datos',
    categorias: ['Gobierno de Datos', 'Arquitectura de Datos', 'Riesgos'],
    descripcion: 'Estándar ISO para el gobierno de los datos por parte de las organizaciones. Define principios, modelos y prácticas para el gobierno responsable del uso de datos.',
    entidadEmisora: 'ISO / IEC JTC 1',
    pais: 'Internacional',
    bandera: '🌍',
    fechaPublicacion: '2017-04-01',
    fechaVigencia: '2025-04-01',
    estado: 'vigente',
    urlOficial: 'https://www.iso.org/standard/56639.html',
    palabrasClave: ['ISO 38505', 'data governance', 'gobierno de datos', 'data stewardship', 'responsabilidad de datos'],
    resumenEjecutivo: 'ISO/IEC 38505-1 adapta el marco de gobierno de TI de ISO 38500 específicamente para el gobierno de datos. Define seis principios de gobierno de datos: Responsabilidad, Estrategia, Adquisición, Desempeño, Conformidad y Comportamiento Humano. Proporciona un modelo para que el cuerpo directivo evalúe, dirija y monitoree el uso de datos en la organización.',
    objetivo: 'Guiar a los órganos de dirección de las organizaciones para que gobiernen de manera efectiva los datos como un activo estratégico crítico.',
    alcance: 'Cuerpos directivos y ejecutivos de organizaciones de todos los sectores que reconocen a los datos como activo estratégico.',
    obligaciones: [
      'El órgano directivo debe evaluar el uso actual y futuro de los datos en la organización',
      'Dirigir la preparación de políticas y la estrategia de datos empresariales',
      'Monitorear continuamente el cumplimiento de las directrices y normas sobre el uso de datos',
    ],
    sanciones: 'Estándar de gobierno, sin sanciones regulatorias directas.',
    rolesInvolucrados: ['Board of Directors', 'CDO', 'CEO', 'CIO', 'Data Governance Council'],
    controles: [
      { id: 'c1', nombre: 'Revisión ejecutiva de gobierno de datos', tipo: 'Preventivo', frecuencia: 'Semestral', responsable: 'Board / CDO' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Falta de visión estratégica sobre datos en la dirección', impacto: 'Alto', probabilidad: 'Alta', tratamiento: 'Capacitación a directivos y creación de Data Strategy' },
    ],
    indicadores: ['Madurez de gobierno de datos por principio ISO 38505', '% directivos capacitados en gobierno de datos'],
    procesosAfectados: ['Gobierno corporativo', 'Planificación estratégica', 'Gestión de riesgos corporativos'],
    checklist: [
      { id: 'ch1', pregunta: '¿Están formalmente asignadas las responsabilidades para la creación y uso de datos (Principio de RESPONSABILIDAD)?', dominio: 'Responsibility', estado: null },
      { id: 'ch2', pregunta: '¿La estrategia de datos está alineada y documentada con la estrategia de negocio (Principio de ESTRATEGIA)?', dominio: 'Strategy', estado: null },
      { id: 'ch3', pregunta: '¿Se cuenta con políticas para asegurar la adquisición ética y legal de datos externos (Principio de ADQUISICIÓN)?', dominio: 'Acquisition', estado: null },
      { id: 'ch4', pregunta: '¿Los sistemas de datos están optimizados para apoyar el desempeño comercial (Principio de DESEMPEÑO)?', dominio: 'Performance', estado: null },
      { id: 'ch5', pregunta: '¿Se audita de forma periódica que el uso de datos cumple con las regulaciones aplicables (Principio de CONFORMIDAD)?', dominio: 'Conformance', estado: null },
      { id: 'ch6', pregunta: '¿Se capacita a la organización para que la cultura y las competencias soporten el uso responsable (Principio de COMPORTAMIENTO)?', dominio: 'Human Behaviour', estado: null },
    ],
    versiones: [{ version: '2017', fecha: '2017-04-01', cambios: 'Primera publicación', responsable: 'ISO JTC 1' }],
    normativasRelacionadas: ['dama-dmbok2', 'cobit-2019'],
    requisitosCount: 18,
    politicasCount: 6,
    auditoriasCount: 4,
    colorPrimario: '#3b82f6',
    colorSecundario: '#1d4ed8',
    icono: '🏛️',
    cumplimientoPct: 0,
  },
  {
    id: 'togaf-10',
    codigo: 'TOGAF-10',
    nombre: 'TOGAF Standard, 10th Edition - Enterprise Architecture Framework',
    nombreCorto: 'TOGAF 10',
    version: '10th Edition',
    tipo: 'Framework',
    categoria: 'Arquitectura de Datos',
    categorias: ['Arquitectura de Datos', 'Gobierno de Datos'],
    descripcion: 'Estándar del Open Group para la metodología de Arquitectura Empresarial. Proporciona un marco integral para el diseño, planificación e implementación de la arquitectura.',
    entidadEmisora: 'The Open Group',
    pais: 'Internacional',
    bandera: '🌍',
    fechaPublicacion: '2022-04-25',
    fechaVigencia: '2028-12-31',
    estado: 'vigente',
    urlOficial: 'https://www.opengroup.org/togaf',
    palabrasClave: ['TOGAF 10', 'arquitectura empresarial', 'ADM', 'arquitectura de datos', 'The Open Group', 'modelado empresarial'],
    resumenEjecutivo: 'La 10.ª edición de TOGAF se estructura para ser más modular y ágil. El núcleo del framework sigue siendo el ADM (Architecture Development Method), que define fases desde el Preliminar y la Visión, hasta la Arquitectura de Negocio, de Sistemas de Información (incluyendo Datos y Aplicaciones), de Tecnología, y la Gobernanza de la Arquitectura.',
    objetivo: 'Mejorar la eficiencia del negocio mediante el diseño de una arquitectura empresarial integrada, flexible y alineada con las metas de la organización.',
    alcance: 'Organizaciones globales y equipos de arquitectura que necesitan una metodología sólida y repetible para guiar el cambio tecnológico.',
    obligaciones: [
      'Seguir las fases del ADM de TOGAF para proyectos de transformación empresarial',
      'Mantener y actualizar el Repositorio de Arquitectura de la organización',
      'Establecer una Junta de Gobierno de Arquitectura (Architecture Board) para supervisar proyectos',
      'Definir principios de arquitectura empresarial claros y obligatorios para nuevos desarrollos',
    ],
    sanciones: 'Framework voluntario de mejores prácticas. No tiene multas directas asociadas.',
    rolesInvolucrados: ['Enterprise Architect', 'Data Architect', 'Solution Architect', 'CIO', 'Architecture Board Member'],
    controles: [
      { id: 'c1', nombre: 'Revisión de cumplimiento de arquitectura', tipo: 'Preventivo', frecuencia: 'Por proyecto', responsable: 'Architecture Board' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Silos tecnológicos y arquitecturas inconsistentes', impacto: 'Alto', probabilidad: 'Media', tratamiento: 'Gobernanza centralizada de arquitectura y uso de TOGAF ADM' },
    ],
    indicadores: ['% de proyectos de TI alineados con la arquitectura objetivo', 'Nº de desviaciones de arquitectura detectadas', 'Madurez de arquitectura empresarial'],
    procesosAfectados: ['Planificación estratégica de TI', 'Gestión de portafolio de proyectos', 'Gobierno tecnológico'],
    checklist: [
      { id: 'ch1', pregunta: '¿Se utiliza el método ADM de TOGAF para guiar los proyectos de transformación y cambios de sistemas?', dominio: 'Architecture Development Method', estado: null },
      { id: 'ch2', pregunta: '¿Se mantiene un repositorio centralizado de arquitectura empresarial (Architecture Repository) con modelos vigentes?', dominio: 'Architecture Repository', estado: null },
      { id: 'ch3', pregunta: '¿Existe una Junta de Gobierno de Arquitectura (Architecture Board) que evalúe y apruebe las desviaciones?', dominio: 'Governance', estado: null },
      { id: 'ch4', pregunta: '¿Se han definido e implementado formalmente los principios de arquitectura de datos empresariales?', dominio: 'Data Architecture', estado: null },
      { id: 'ch5', pregunta: '¿Están documentados los diagramas de arquitectura de datos actuales (As-Is) y de destino (To-Be) para los dominios clave?', dominio: 'Architecture Content', estado: null },
    ],
    versiones: [
      { version: '9.2', fecha: '2018-04-01', cambios: 'Guías adicionales y consolidación', responsable: 'The Open Group' },
      { version: '10', fecha: '2022-04-25', cambios: 'Agilidad, DevSecOps, Arquitectura Continua', responsable: 'The Open Group' },
    ],
    normativasRelacionadas: ['dama-dmbok2', 'cobit-2019'],
    requisitosCount: 35,
    politicasCount: 11,
    auditoriasCount: 5,
    colorPrimario: '#8b5cf6',
    colorSecundario: '#6d28d9',
    icono: '🏗️',
    cumplimientoPct: 0,
  },
  {
    id: 'dcam',
    codigo: 'DCAM-2.0',
    nombre: 'DCAM 2.0 - EDM Council Data Capability Assessment Model',
    nombreCorto: 'DCAM 2.0',
    version: '2.0',
    tipo: 'Framework',
    categoria: 'Gobierno de Datos',
    categorias: ['Gobierno de Datos', 'Calidad de Datos', 'Arquitectura de Datos'],
    descripcion: 'Modelo de evaluación de capacidades de gestión de datos del EDM Council. Estándar de facto en servicios financieros para medir la madurez en gobierno de datos.',
    entidadEmisora: 'EDM Council',
    pais: 'Internacional',
    bandera: '🌍',
    fechaPublicacion: '2020-01-15',
    fechaVigencia: '2026-12-31',
    estado: 'vigente',
    urlOficial: 'https://edmcouncil.org/frameworks/dcam/',
    palabrasClave: ['DCAM', 'EDM Council', 'data capability', 'financial services', 'FIBO', 'data management maturity'],
    resumenEjecutivo: 'DCAM 2.0 es el estándar de madurez en gestión de datos del sector financiero, adoptado por más de 200 instituciones globales. Define 8 componentes de capacidad de datos: Estrategia de Datos, Gobierno de Datos, Gestión de Arquitectura, Tecnología y Herramientas, Organización de Gestión de Datos, Gestión de Calidad de Datos, Gestión del Ciclo de Vida de Datos y Gestión de Datos Maestros y de Referencia.',
    objetivo: 'Proporcionar un modelo estándar para evaluar y mejorar las capacidades de gestión de datos en organizaciones, especialmente del sector financiero.',
    alcance: 'Originalmente para servicios financieros (bancos, aseguradoras, gestoras), pero aplicable a cualquier organización.',
    obligaciones: [
      'Evaluar periódicamente las capacidades de datos con el modelo DCAM',
      'Definir un programa estratégico de capacidades de datos corporativas',
      'Asignar responsabilidades para la gobernanza del ciclo de vida de los datos',
      'Establecer y medir dimensiones de calidad de datos críticas',
    ],
    sanciones: 'Framework voluntario. Requerido por reguladores en algunos países para bancos (BCBS 239).',
    rolesInvolucrados: ['CDO', 'Data Governance Manager', 'Data Quality Manager', 'Risk Manager', 'CRO'],
    controles: [
      { id: 'c1', nombre: 'Evaluación de madurez DCAM', tipo: 'Detectivo', frecuencia: 'Anual', responsable: 'CDO' },
    ],
    riesgos: [
      { id: 'r1', nombre: 'Brecha de capacidades en gestión de datos', impacto: 'Alto', probabilidad: 'Alta', tratamiento: 'Roadmap de mejora basado en evaluación DCAM' },
    ],
    indicadores: ['Puntuación de madurez DCAM por componente', 'Avance en roadmap de mejora', '% componentes en nivel objetivo'],
    procesosAfectados: ['Gestión de riesgos', 'Reportes regulatorios', 'Análisis financiero', 'Auditoría'],
    checklist: [
      { id: 'ch1', pregunta: '¿Se ha realizado una evaluación formal y documentada de madurez usando los 8 componentes de DCAM 2.0?', dominio: 'Assessment', estado: null },
      { id: 'ch2', pregunta: '¿Existe un plan de negocio de datos (Data Business Case) alineado a la estrategia corporativa?', dominio: 'Data Strategy', estado: null },
      { id: 'ch3', pregunta: '¿Están identificados los Elementos de Datos Críticos (CDE) requeridos por el negocio y los reguladores?', dominio: 'Data Architecture', estado: null },
      { id: 'ch4', pregunta: '¿Se cuenta con un modelo organizativo formalizado de Stewardship de Datos?', dominio: 'Organization', estado: null },
      { id: 'ch5', pregunta: '¿Existen políticas y métricas de calidad de datos asociadas a los CDEs identificados?', dominio: 'Data Quality', estado: null },
      { id: 'ch6', pregunta: '¿Se realiza control de versionamiento e inventario de datos maestros y de referencia (MDM)?', dominio: 'Lifecycle', estado: null },
      { id: 'ch7', pregunta: '¿Se audita y valida que la infraestructura y herramientas apoyen la estrategia de datos de forma segura?', dominio: 'Technology', estado: null },
      { id: 'ch8', pregunta: '¿Se cuenta con un roadmap formal de remediación para las brechas de capacidad identificadas?', dominio: 'Assessment', estado: null },
    ],
    versiones: [
      { version: '1.0', fecha: '2012-01-01', cambios: 'Primera publicación', responsable: 'EDM Council' },
      { version: '2.0', fecha: '2020-01-15', cambios: 'Revisión completa: componentes actualizados, alineación con FIBO', responsable: 'EDM Council' },
    ],
    normativasRelacionadas: ['dama-dmbok2', 'iso-8000', 'bcra-7456'],
    requisitosCount: 53,
    politicasCount: 14,
    auditoriasCount: 7,
    colorPrimario: '#3b82f6',
    colorSecundario: '#1d4ed8',
    icono: '🏦',
    cumplimientoPct: 0,
  },
];

export const AI_RESPONSES: Record<string, string[]> = {
  default: [
    'Basándome en la normativa seleccionada, puedo decirte que los requisitos principales se centran en la gobernanza, calidad y seguridad de los datos.',
    'Esta normativa establece un marco estructurado que requiere definir roles, políticas y controles específicos para la gestión de datos.',
    'Los controles recomendados incluyen auditorías periódicas, evaluaciones de madurez y métricas de cumplimiento definidas.',
  ],
  'dama-dmbok2': [
    'DAMA-DMBOK define 11 áreas de conocimiento. Respecto a metadatos (área 10), exige mantener un repositorio de metadatos de negocio, técnicos y operacionales, con roles de Metadata Manager claramente definidos.',
    'Para gobierno de datos (área 1), DAMA requiere un consejo de gobierno con CDO, Data Stewards y Data Owners por dominio de datos. El patrocinio ejecutivo es obligatorio para el éxito del programa.',
    'Las métricas de calidad de datos en DAMA se organizan por dimensiones: completitud, exactitud, consistencia, oportunidad, validez y unicidad. Cada dominio debe tener umbrales definidos y KPIs monitoreados.',
  ],
  'iso-27001': [
    'ISO 27001:2022 organiza sus controles en 4 temas: Organizacional (37 controles), Personas (8 controles), Físico (14 controles) y Tecnológico (34 controles). En total 93 controles en el Anexo A.',
    'Un control crítico nuevo en ISO 27001:2022 es A.5.7 (Inteligencia de amenazas): obliga a recopilar y analizar información sobre amenazas relevantes para adaptar los controles de seguridad proactivamente.',
    'Para la gestión de incidentes (Cláusula 6.1 y controles A.5.24-26), ISO 27001 exige un procedimiento documentado que incluya detección, clasificación, escalada, notificación y lecciones aprendidas.',
  ],
  'ley-1581': [
    'La Ley 1581 de 2012 en su Artículo 4 define los principios: legalidad, finalidad, libertad, veracidad, transparencia, acceso restringido, seguridad y confidencialidad. Todos obligatorios.',
    'Respecto a calidad de datos, el Artículo 4c (veracidad y calidad) exige que los datos sean exactos, completos, actualizados, comprobables y comprensibles. Los datos inexactos o incompletos deben rectificarse o suprimirse.',
    'Para transferencias internacionales de datos (Capítulo IV), la Ley 1581 requiere que el país receptor ofrezca niveles adecuados de protección, o que se cuente con consentimiento expreso del titular.',
  ],
  'gdpr': [
    'El Artículo 83 del GDPR establece multas en dos niveles: hasta €10M o 2% facturación global para infracciones menores (medidas técnicas, notificación de brechas), y hasta €20M o 4% para infracciones graves (bases legales, derechos de titulares).',
    'El derecho al olvido (Art. 17) obliga a borrar datos cuando ya no sean necesarios para la finalidad, el titular revoque el consentimiento, o los datos hayan sido tratados ilícitamente. Plazo de respuesta: 1 mes.',
    'Privacy by Design (Art. 25) exige que la protección de datos se integre desde el diseño de sistemas y procesos, no como añadido. Esto incluye pseudonimización, minimización de datos y controles de acceso por defecto.',
  ],
};
