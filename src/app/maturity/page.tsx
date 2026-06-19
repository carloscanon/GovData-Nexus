'use client';

import React from 'react';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  ChevronRight,
  Zap,
  Shield,
  Users,
  ShieldAlert,
  AlertTriangle,
  History,
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useTenantStorage } from '@/hooks/useTenantStorage';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './maturity.module.css';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';

// Month abbreviations for evolution chart
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function getCurrentMonthLabel() {
  return MONTHS[new Date().getMonth()];
}

function getCapExplanation(capName: string, dbStats: any, answers: any) {
  const stats = dbStats || {};
  switch (capName) {
    case 'Visión de Gobierno':
      return {
        name: 'Visión de Gobierno',
        type: 'auto',
        score: Math.round(stats.totalWorkflows > 0 ? (stats.approvedWorkflows / stats.totalWorkflows) * 100 : 50),
        desc: 'Mide la madurez del gobierno de datos a través de la formalización y culminación de los flujos de trabajo en la organización.',
        formula: '(Workflows Aprobados y Cerrados / Total de Workflows Registrados) * 100',
        currentData: `Tu empresa cuenta con ${stats.totalWorkflows} flujos/solicitudes de trabajo en total, de los cuales ${stats.approvedWorkflows} han sido debidamente aprobados y finalizados.`,
        actionPlan: [
          'Ve al módulo de Mesa de Servicio / Workflows.',
          'Revisa las solicitudes en estado Pendiente o En Progreso.',
          'Aprueba, completa o cierra los flujos pendientes para aumentar este indicador.',
          'Diseña y ejecuta flujos de aprobación formales para nuevos activos en lugar de dejarlos informales.'
        ]
      };
    case 'Políticas Definidas':
      return {
        name: 'Políticas Definidas',
        type: 'auto',
        score: Math.min(100, Math.round(stats.totalPolicies > 0 ? (stats.activePolicies / stats.totalPolicies) * 100 : 50)),
        desc: 'Evalúa el grado de formalización de la gobernanza de datos mediante políticas vigentes y documentadas.',
        formula: '(Políticas de Datos en Estado "Vigente" / Total de Políticas) * 100',
        currentData: `Tu empresa cuenta con ${stats.totalPolicies} políticas totales registradas, de las cuales ${stats.activePolicies} se encuentran vigentes y ${stats.expiredPolicies} han vencido.`,
        actionPlan: [
          'Ve al módulo de Políticas de Datos.',
          'Identifica las políticas vencidas u obsoletas.',
          'Edita, actualiza la fecha de vigencia o carga nuevas versiones aprobadas para reactivarlas.',
          'Crea nuevas políticas de gobierno para temas críticos como PII, Retención y Calidad.'
        ]
      };
    case 'Alineación Negocio':
      return {
        name: 'Alineación Negocio',
        type: 'manual',
        score: answers.alineacion_negocio * 20,
        desc: 'Mide el nivel de sincronización entre la estrategia de datos y las prioridades de negocio de la organización.',
        formula: 'Nivel autoevaluado manual * 20%',
        currentData: `Nivel actual seleccionado: ${answers.alineacion_negocio} de 5.`,
        actionPlan: [
          'Define casos de uso de negocio con impacto financiero o de servicio directo.',
          'Alinea cada activo de información en el Catálogo con un dominio o proceso estratégico.',
          'Ejecuta una nueva Autoevaluación en este módulo seleccionando un nivel superior cuando los objetivos estratégicos y técnicos estén alineados.'
        ]
      };
    case 'Roles y Resp.':
      return {
        name: 'Roles y Resp.',
        type: 'auto',
        score: Math.min(100, Math.round(stats.totalAssets > 0 ? ((stats.assetsWithOwner + stats.assetsWithSteward) / (stats.totalAssets * 2)) * 100 : 50)),
        desc: 'Monitorea la asignación formal de responsabilidades (dueños de negocio y custodios técnicos) sobre los activos de información.',
        formula: '((Activos con Data Owner + Activos con Data Steward) / (2 * Total de Activos)) * 100',
        currentData: `Total de activos evaluados: ${stats.totalAssets}. Activos con Data Owner asignado: ${stats.assetsWithOwner}. Activos con Data Steward asignado: ${stats.assetsWithSteward}.`,
        actionPlan: [
          'Ve al módulo de Catálogo de Datos.',
          'Identifica los activos que tengan "Por definir" o estén vacíos en los campos de Responsables.',
          'Edita cada activo e ingresa los correos/nombres correspondientes en "Data Owner" y "Data Steward".',
          'También puedes importar de manera masiva con la plantilla Excel asegurando llenar estas columnas.'
        ]
      };
    case 'Data Owners':
      return {
        name: 'Data Owners',
        type: 'auto',
        score: Math.min(100, Math.round(stats.totalAssets > 0 ? (stats.assetsWithOwner / stats.totalAssets) * 100 : 50)),
        desc: 'Evalúa la cobertura de asignación de Dueños de Datos de Negocio (Data Owners) para liderar las decisiones de gobernanza.',
        formula: '(Activos con Data Owner / Total de Activos) * 100',
        currentData: `Tu empresa cuenta con ${stats.totalAssets} activos en el catálogo, y ${stats.assetsWithOwner} cuentan con un Data Owner formalmente asignado.`,
        actionPlan: [
          'Asigna un líder de área o dueño de proceso de negocio a cada activo de información.',
          'Utiliza el módulo de Catálogo para buscar activos sin propietario asignado.',
          'Capacita a los Data Owners en sus funciones para validar la calidad y lógica de negocio.'
        ]
      };
    case 'Comité de Gobierno':
      return {
        name: 'Comité de Gobierno',
        type: 'manual',
        score: answers.comite_gobierno * 20,
        desc: 'Mide la madurez organizativa del Comité de Gobierno de Datos y su involucramiento formal mediante actas y resoluciones.',
        formula: 'Nivel autoevaluado manual * 20%',
        currentData: `Nivel actual seleccionado: ${answers.comite_gobierno} de 5. Se registran ${stats.totalCommittees} comités creados y ${stats.totalResolutions} resoluciones/actas en el sistema.`,
        actionPlan: [
          'Establece reuniones periódicas del Comité de Gobierno de Datos.',
          'Registra las reuniones formalmente cargando las actas y resoluciones firmadas en el apartado de Documentos.',
          'Eleva el nivel de respuesta en la siguiente autoevaluación cuando las sesiones del comité sean sistemáticas.'
        ]
      };
    case 'Reglas de Calidad':
      return {
        name: 'Reglas de Calidad',
        type: 'auto',
        score: stats.averageQuality,
        desc: 'Indica el índice de calidad promedio (DQI) resultante de la evaluación de reglas en las fuentes de datos conectadas.',
        formula: 'Promedio de Score de Calidad de los activos evaluados en base de datos.',
        currentData: `El índice de calidad general actual es de ${stats.averageQuality}%.`,
        actionPlan: [
          'Asocia reglas de calidad específicas (no nulos, formatos, unicidad) a los campos de tus activos críticos.',
          'Ejecuta el escáner de calidad para obtener resultados actualizados de la base de datos.',
          'Corrige las anomalías directamente en los sistemas de origen para aumentar la completitud y validez.'
        ]
      };
    case 'Monitoreo Auto.':
      return {
        name: 'Monitoreo Auto.',
        type: 'auto',
        score: Math.max(0, 100 - (stats.openIncidents * 10)),
        desc: 'Evalúa la capacidad de monitoreo proactivo midiendo la ausencia de incidentes críticos abiertos en el sistema.',
        formula: '100 - (Incidentes Abiertos * 10)',
        currentData: `Actualmente hay ${stats.openIncidents} incidentes abiertos sin resolver entre Calidad de Datos y tickets de Mesa de Servicio.`,
        actionPlan: [
          'Revisa las alertas de incidentes generadas por el scanner en el módulo de Calidad.',
          'Resuelve y marca como "Resuelto" o "Cerrado" los incidentes que ya hayan sido corregidos.',
          'Resuelve los tickets del Service Desk pendientes para reducir los incidentes abiertos a cero.'
        ]
      };
    case 'Gestión Incidentes':
      return {
        name: 'Gestión Incidentes',
        type: 'auto',
        score: Math.min(100, Math.round(stats.totalIncidents > 0 ? (stats.resolvedIncidents / stats.totalIncidents) * 100 : 80)),
        desc: 'Mide la efectividad del proceso de atención y remediación de incidentes de calidad de datos.',
        formula: '(Incidentes Resueltos o Cerrados / Total de Incidentes) * 100',
        currentData: `Incidentes totales detectados: ${stats.totalIncidents}. Incidentes resueltos/cerrados con éxito: ${stats.resolvedIncidents}.`,
        actionPlan: [
          'Implementa flujos de trabajo automáticos para asignar un responsable a cada incidente en cuanto ocurra.',
          'Documenta las acciones de remediación (root-cause correction).',
          'Cierra formalmente los incidentes en el flujo para reflejar la resolución.'
        ]
      };
    case 'Modelado Datos':
      return {
        name: 'Modelado Datos',
        type: 'manual',
        score: answers.modelado_datos * 20,
        desc: 'Evalúa la rigurosidad y el uso de estándares y diagramas conceptuales/lógicos de modelado en la organización.',
        formula: 'Nivel autoevaluado manual * 20%',
        currentData: `Nivel actual seleccionado: ${answers.modelado_datos} de 5.`,
        actionPlan: [
          'Documenta los diagramas de arquitectura de datos (modelos entidad-relación) en el Diccionario de Datos.',
          'Normaliza los catálogos y estructuras de base de datos.',
          'Eleva la autoevaluación una vez que el modelado esté estandarizado bajo mejores prácticas.'
        ]
      };
    case 'Integración':
    case 'Linaje Técnico':
      return {
        name: capName,
        type: 'auto',
        score: Math.min(100, Math.round(stats.totalAssets > 0 ? (stats.assetsWithLineage / stats.totalAssets) * 100 : 50)),
        desc: 'Monitorea la visibilidad de la trazabilidad y procedencia de los activos de información (Lineage técnico).',
        formula: '(Activos con Sistema Fuente Documentado / Total de Activos) * 100',
        currentData: `Tu empresa cuenta con ${stats.totalAssets} activos, y ${stats.assetsWithLineage} tienen registrada la procedencia o sistema de origen en el catálogo.`,
        actionPlan: [
          'Edita los activos en el Catálogo de Datos e ingresa el campo "Sistema Fuente" (por ejemplo, SAP, Salesforce, Postgres DB).',
          'Documenta las relaciones origen-destino (lógica de ETL/trazabilidad) en el módulo de Metadatos.',
          'Genera el mapa visual de linaje técnico para auditorías.'
        ]
      };
    case 'Clasificación PII':
    case 'Control Acceso':
      return {
        name: capName,
        type: 'auto',
        score: Math.min(100, Math.round(stats.totalAssets > 0 ? (stats.assetsClassified / stats.totalAssets) * 100 : 50)),
        desc: 'Evalúa la protección de datos sensibles y clasificación de criticidad y nivel de riesgo de los activos de información.',
        formula: '(Activos con Nivel de Sensibilidad Asignado / Total de Activos) * 100',
        currentData: `Activos totales: ${stats.totalAssets}. Activos con nivel de sensibilidad / clasificación PII registrado: ${stats.assetsClassified}.`,
        actionPlan: [
          'Identifica los activos que contienen datos personales o sensibles (PII).',
          'Usa el módulo de Catálogo para editar el activo y clasificar su nivel de Sensibilidad (Confidencial, Restringido, Público, etc.).',
          'Aplica controles de enmascaramiento o políticas de acceso basadas en roles para los activos confidenciales.'
        ]
      };
    case 'Auditoría':
      return {
        name: 'Auditoría',
        type: 'manual',
        score: answers.auditoria_seguridad * 20,
        desc: 'Mide la frecuencia y cobertura de las revisiones de seguridad y cumplimiento sobre los repositorios de datos.',
        formula: 'Nivel autoevaluado manual * 20%',
        currentData: `Nivel actual seleccionado: ${answers.auditoria_seguridad} de 5.`,
        actionPlan: [
          'Realiza auditorías de control de accesos al menos una vez al año.',
          'Registra las bitácoras y hallazgos en la sección de Auditorías de Seguridad.',
          'Eleva la autoevaluación cuando las auditorías sean sistemáticas y automáticas.'
        ]
      };
    case 'Marcos Normativos':
      return {
        name: 'Marcos Normativos',
        type: 'manual',
        score: answers.marcos_normativos * 20,
        desc: 'Evalúa la incorporación formal y obligatoria de regulaciones de datos (GDPR, Habeas Data, leyes de transparencia).',
        formula: 'Nivel autoevaluado manual * 20%',
        currentData: `Nivel actual seleccionado: ${answers.marcos_normativos} de 5.`,
        actionPlan: [
          'Documenta y asocia cada activo PII a una norma vigente (Habeas Data, Ley de Transparencia, etc.).',
          'Crea lineamientos de retención y privacidad específicos.',
          'Eleva la autoevaluación manual al integrar completamente los controles regulatorios.'
        ]
      };
    case 'Incidentes Resueltos':
      return {
        name: 'Incidentes Resueltos',
        type: 'auto',
        score: Math.min(100, Math.round(stats.totalIncidents > 0 ? (stats.resolvedIncidents / stats.totalIncidents) * 100 : 50)),
        desc: 'Evalúa la capacidad de resolución de incidentes de cumplimiento y aseguramiento técnico en los tiempos previstos.',
        formula: '(Incidentes de Calidad Cerrados / Total de Incidentes) * 100',
        currentData: `Incidentes totales: ${stats.totalIncidents}. Incidentes con estado Resuelto o Cerrado: ${stats.resolvedIncidents}.`,
        actionPlan: [
          'Asegúrate de atender y dar cierre a los incidentes levantados por el scanner.',
          'Genera acuerdos de niveles de servicio (SLA) para la remediación.',
          'Monitorea el cumplimiento regulatorio para evitar penalizaciones.'
        ]
      };
    default:
      return {
        name: capName,
        type: 'auto',
        score: 50,
        desc: 'Métrica de capacidad general de gobernanza.',
        formula: 'Fórmula automática basada en metadatos.',
        currentData: 'Calculado de forma dinámica.',
        actionPlan: [
          'Continúa poblando los metadatos técnicos en el catálogo.',
          'Asegura la participación de dueños y custodios en la plataforma.'
        ]
      };
  }
}

function getKpiExplanation(kpiName: string, globalScore: number, levelColor: string, maturityLevel: string, dbStats: any) {
  const stats = dbStats || {};
  switch (kpiName) {
    case 'Nivel Actual':
      return {
        name: 'Nivel Actual de Madurez',
        value: maturityLevel,
        subtitle: `Score Global: ${globalScore}%`,
        color: levelColor,
        desc: 'Representa el estado actual general de la gobernanza de datos de tu organización basado en el marco de madurez híbrida (DAMA & CMMI).',
        origin: 'Se calcula como el promedio ponderado de las 6 dimensiones fundamentales del gobierno de datos: Estrategia, Organización, Calidad, Arquitectura, Seguridad y Compliance. Cada dimensión combina mediciones automatizadas de la base de datos de producción con autoevaluaciones manuales del equipo.',
        actionPlan: [
          'Completa el cuestionario manual para todas las dimensiones no evaluadas.',
          'Resuelve los incidentes críticos de calidad para elevar la salud técnica de tus datos.',
          'Asigna propietarios (Data Owners) a la totalidad del catálogo de datos.'
        ]
      };
    case 'Benchmark Sector':
      return {
        name: 'Benchmark del Sector',
        value: `+${Math.max(0, globalScore - 62)}%`,
        subtitle: 'Vs promedio sectorial del 62%',
        color: '#3b82f6',
        desc: 'Muestra la posición de madurez de tu organización en comparación con el promedio de referencia nacional e institucional del sector público y gubernamental (fijado en 62% de madurez promedio).',
        origin: 'Calcula la diferencia aritmética simple entre tu Score Global de madurez y la constante del benchmark del sector gubernamental (62%). Un valor positivo indica liderazgo frente a las regulaciones nacionales.',
        actionPlan: [
          'Mantén vigentes tus políticas de seguridad y retención de información.',
          'Consolida el Comité de Gobierno mediante la carga de actas periódicas.',
          'Sube nuevos activos al catálogo técnico e integra su linaje origen-destino.'
        ]
      };
    case 'Incidentes Abiertos':
      return {
        name: 'Incidentes Abiertos',
        value: String(stats.openIncidents),
        subtitle: 'Calidad y Mesa de Servicio',
        color: stats.openIncidents > 5 ? '#ef4444' : '#f59e0b',
        desc: 'Cuantifica los incidentes operacionales activos que impactan la calidad del dato o requieren soporte técnico.',
        origin: 'Corresponde a la suma de: (a) Anomalías de calidad de datos generadas por el scanner en estado no resuelto/no cerrado, y (b) Solicitudes y tickets de workflows en la Mesa de Servicio que permanecen en estado Pendiente, En Progreso, Escalado o En Revisión.',
        actionPlan: [
          'Ve al módulo de Calidad y atiende las anomalías del scanner (nulos, formatos erróneos, duplicados).',
          'Ve al módulo de Mesa de Servicio / Workflows y da resolución o cierre a las solicitudes pendientes.',
          'Establece alertas automáticas para corregir de raíz los datos en las bases de datos origen.'
        ]
      };
    case 'Dimensiones':
      // Calculate actual number of dimensions meeting managed level >= 60%
      const dimScores = [
        stats.totalWorkflows > 0 ? (stats.approvedWorkflows / stats.totalWorkflows) * 100 : 50,
        stats.totalAssets > 0 ? ((stats.assetsWithOwner + stats.assetsWithSteward) / (stats.totalAssets * 2)) * 100 : 50,
        stats.averageQuality,
        stats.totalAssets > 0 ? (stats.assetsWithLineage / stats.totalAssets) * 100 : 50,
        stats.totalAssets > 0 ? (stats.assetsClassified / stats.totalAssets) * 100 : 50,
        stats.totalIncidents > 0 ? (stats.resolvedIncidents / stats.totalIncidents) * 100 : 50,
      ];
      const countManaged = dimScores.filter(score => score >= 60).length;

      return {
        name: 'Dimensiones Gestionadas',
        value: `${countManaged}/6`,
        subtitle: 'En nivel Gestionado o superior',
        color: '#10b981',
        desc: 'Mide la madurez equilibrada de tu gobernanza a través de cuántas dimensiones principales han superado la barrera del 60% (Nivel 3 - Gestionado).',
        origin: 'Evalúa de forma independiente los puntajes de Estrategia, Organización, Calidad, Arquitectura, Seguridad y Compliance. Cada dimensión con puntaje mayor o igual a 60% cuenta como aprobada.',
        actionPlan: [
          'Identifica en el radar o en el listado lateral la dimensión con menor puntaje.',
          'Haz clic sobre ella y enfoca tu roadmap en mejorar las capacidades que tienen menor puntuación.',
          'Realiza autoevaluaciones periódicas a medida que implementes controles en las dimensiones críticas.'
        ]
      };
    default:
      return null;
  }
}
const ROADMAP_RECOMMENDATIONS: Record<string, { id: string; title: string; description: string; impact: string }[]> = {
  estrategia: [
    { id: 'est_1', title: 'Definir visión a largo plazo para Gobierno de Datos', description: 'Crear el manifiesto y plan estratégico de la visión de datos para los próximos 3 años.', impact: '+5% score' },
    { id: 'est_2', title: 'Establecer la política de Gobernanza de Datos', description: 'Redactar y formalizar la política que rige el uso, propiedad y responsabilidades sobre los datos corporativos.', impact: '+8% score' },
    { id: 'est_3', title: 'Alinear metas de negocio con indicadores de datos', description: 'Vincular los objetivos del negocio con metas concretas de calidad y gobernanza de la información.', impact: '+6% score' },
    { id: 'est_4', title: 'Definir presupuesto anual para iniciativas de datos', description: 'Asignar fondos específicos para herramientas de gobierno, capacitación y saneamiento de bases.', impact: '+4% score' },
    { id: 'est_5', title: 'Implementar Comité Directivo de Datos', description: 'Establecer el órgano directivo interdepartamental para la toma de decisiones prioritarias de datos.', impact: '+7% score' }
  ],
  organizacion: [
    { id: 'org_1', title: 'Asignar Data Owners para dominios críticos', description: 'Identificar y asignar responsables de negocio (Owners) para custodiar los principales activos de datos.', impact: '+8% score' },
    { id: 'org_2', title: 'Asignar Data Stewards para la gestión de calidad', description: 'Nombrar perfiles técnicos y operativos para velar por la correcta ejecución de reglas de datos.', impact: '+7% score' },
    { id: 'org_3', title: 'Establecer Comité de Gobierno interdepartamental', description: 'Formar la mesa técnica operativa con representantes de tecnología, riesgos y áreas funcionales.', impact: '+6% score' },
    { id: 'org_4', title: 'Capacitar a líderes de negocio en Gobierno de Datos', description: 'Impartir talleres sobre la importancia del linaje, calidad y ciclo de vida de los datos.', impact: '+5% score' },
    { id: 'org_5', title: 'Definir matriz RACI para activos clave', description: 'Crear la matriz de responsabilidades operativa para la ingesta y consumo de datos del negocio.', impact: '+6% score' }
  ],
  calidad: [
    { id: 'cal_1', title: 'Definir reglas de calidad automáticas para bases críticas', description: 'Implementar reglas automáticas de formato, nulos y consistencia en tablas maestras del sistema.', impact: '+9% score' },
    { id: 'cal_2', title: 'Configurar monitoreo continuo de anomalías', description: 'Habilitar el programador para realizar escaneos diarios y generar alertas sobre inconsistencias detectadas.', impact: '+8% score' },
    { id: 'cal_3', title: 'Establecer SLA de atención para incidentes de calidad', description: 'Configurar tiempos límite para la mitigación y resolución de incidentes generados por el motor de calidad.', impact: '+7% score' },
    { id: 'cal_4', title: 'Implementar flujos de remediación de datos incorrectos', description: 'Definir el proceso de corrección en origen ante fallos críticos detectados en el sistema.', impact: '+7% score' },
    { id: 'cal_5', title: 'Realizar auditoría trimestral de calidad de datos', description: 'Ejecutar una revisión periódica de los scores de calidad corporativos e incidentes resueltos.', impact: '+6% score' }
  ],
  arquitectura: [
    { id: 'arq_1', title: 'Documentar modelos lógicos y conceptuales de datos', description: 'Crear y disponibilizar los diagramas de entidad-relación de las bases clave para todas las áreas.', impact: '+6% score' },
    { id: 'arq_2', title: 'Configurar linaje técnico de datos automatizado', description: 'Trazar el camino de los datos desde la ingesta hasta el reporte final en tableros de inteligencia.', impact: '+9% score' },
    { id: 'arq_3', title: 'Definir arquitectura de integración de datos', description: 'Normalizar las APIs y servicios web para evitar duplicidades en el consumo de activos clave.', impact: '+6% score' },
    { id: 'arq_4', title: 'Catalogar activos de datos críticos de la empresa', description: 'Registrar en el diccionario de datos las definiciones técnicas e impacto de negocio de cada entidad.', impact: '+8% score' },
    { id: 'arq_5', title: 'Evaluar obsolescencia tecnológica de bases de datos', description: 'Verificar la compatibilidad y seguridad de las plataformas de bases de datos heredadas.', impact: '+5% score' }
  ],
  seguridad: [
    { id: 'seg_1', title: 'Clasificar información confidencial y PII', description: 'Identificar campos que contengan datos personales o sensibles (ej. correos, teléfonos, finanzas).', impact: '+9% score' },
    { id: 'seg_2', title: 'Implementar controles de acceso basados en roles', description: 'Restringir consultas a tablas sensibles basándose estrictamente en el rol de seguridad del usuario.', impact: '+8% score' },
    { id: 'seg_3', title: 'Auditar accesos a bases de datos productivas', description: 'Habilitar registros de auditoría sobre quién y cuándo consulta información confidencial en caliente.', impact: '+7% score' },
    { id: 'seg_4', title: 'Configurar alertas por fuga o anomalías de acceso', description: 'Establecer triggers de seguridad ante descargas masivas o accesos inusuales a activos de datos.', impact: '+8% score' },
    { id: 'seg_5', title: 'Implementar enmascaramiento de datos sensibles en desarrollo', description: 'Ofuscar la información de PII al realizar réplicas hacia ambientes no productivos o de pruebas.', impact: '+7% score' }
  ],
  compliance: [
    { id: 'com_1', title: 'Alinear políticas con marcos regulatorios locales', description: 'Adaptar las reglas de datos a las normativas de protección vigentes (ej. GDPR, Ley de Protección Local).', impact: '+7% score' },
    { id: 'com_2', title: 'Establecer auditoría continua de cumplimiento de datos', description: 'Definir revisiones sistemáticas e informes ejecutivos del cumplimiento normativo de la organización.', impact: '+8% score' },
    { id: 'com_3', title: 'Diseñar flujo de atención a requerimientos ARCO', description: 'Estructurar el canal de atención para responder de manera expedita ante solicitudes de acceso y cancelación de datos.', impact: '+7% score' },
    { id: 'com_4', title: 'Definir plan de retención y purga de datos históricos', description: 'Establecer políticas claras de depuración o archivado de datos antiguos sin uso operativo.', impact: '+6% score' },
    { id: 'com_5', title: 'Realizar evaluación de impacto de protección de datos (PIA)', description: 'Evaluar los riesgos de privacidad implicados en nuevos proyectos o cambios en sistemas de datos.', impact: '+6% score' }
  ]
};

export default function Maturity() {
  const { currentTenant } = usePlatform();
  const { getItem, setItem } = useTenantStorage();
  const [selectedDim, setSelectedDim] = React.useState<any>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = React.useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Dynamic maturity scores from DB + questionnaire
  const [maturityScores, setMaturityScores] = React.useState({
    estrategia: 0,
    organizacion: 0,
    calidad: 0,
    arquitectura: 0,
    seguridad: 0,
    compliance: 0,
  });

  // Previous snapshot (for delta)
  const [prevGlobalScore, setPrevGlobalScore] = React.useState<number | null>(null);

  // Historical evolution data – stored/loaded from localStorage
  const [evolutionData, setEvolutionData] = React.useState<{name:string; score:number; benchmark:number}[]>([]);
  const [findings, setFindings] = React.useState<any[]>([]);
  const [roadmaps, setRoadmaps] = React.useState<any[]>([]);

  // Real DB counters
  const [dbStats, setDbStats] = React.useState({
    totalAssets: 0,
    assetsWithOwner: 0,
    assetsWithSteward: 0,
    assetsClassified: 0,
    assetsWithLineage: 0,
    criticalAssets: 0,
    averageQuality: 0,
    openIncidents: 0,
    resolvedIncidents: 0,
    totalIncidents: 0,
    approvedWorkflows: 0,
    totalWorkflows: 0,
    totalPolicies: 0,
    activePolicies: 0,
    expiredPolicies: 0,
    totalCommittees: 0,
    totalResolutions: 0,
    openQualityIncidents: 0,
    resolvedQualityIncidents: 0,
  });

  const [wizardStep, setWizardStep] = React.useState(0);
  const [selectedCapDetails, setSelectedCapDetails] = React.useState<any>(null);
  const [selectedKpiDetails, setSelectedKpiDetails] = React.useState<any>(null);

  // Questionnaire answers for manual capabilities (hybrid assessment)
  const [answers, setAnswers] = React.useState<Record<string, number>>({
    comite_gobierno: 3,
    modelado_datos: 3,
    alineacion_negocio: 3,
    auditoria_seguridad: 3,
    marcos_normativos: 3
  });

  // Brand colour
  const [primaryColor, setPrimaryColor] = React.useState('#3b82f6');

  React.useEffect(() => {
    (async () => {
      const saved = await getItem('brand_primary');
      if (saved) setPrimaryColor(saved);
    })();
    // Note: tenant storage updates are not broadcast via the storage event.
  }, []);

  // Load tenant-specific answers and history from DB when tenant changes
  React.useEffect(() => {
    if (!currentTenant?.id) return;

    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

    const loadData = async () => {
      if (!isUuid(currentTenant.id)) {
        console.log('[Maturity] Non-UUID tenant.id detected. Running in Demo mode.');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('maturity_assessments')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .eq('dimension', 'GLOBAL')
          .order('assessment_date', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Latest answers
          const latest = data[data.length - 1];
          if (latest.answers) {
            setAnswers({
              comite_gobierno: latest.answers.comite_gobierno ?? 3,
              modelado_datos: latest.answers.modelado_datos ?? 3,
              alineacion_negocio: latest.answers.alineacion_negocio ?? 3,
              auditoria_seguridad: latest.answers.auditoria_seguridad ?? 3,
              marcos_normativos: latest.answers.marcos_normativos ?? 3,
            });
          } else {
            setAnswers({ comite_gobierno: 3, modelado_datos: 3, alineacion_negocio: 3, auditoria_seguridad: 3, marcos_normativos: 3 });
          }

          // Map history (last 12)
          const history = data.slice(-12).map(row => {
            let monthName = 'Ene';
            if (row.assessment_date) {
              const parts = row.assessment_date.split('-');
              if (parts.length >= 2) {
                const monthIdx = parseInt(parts[1], 10) - 1;
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                if (monthIdx >= 0 && monthIdx < 12) {
                  monthName = months[monthIdx];
                }
              }
            }
            return {
              name: monthName,
              score: Number(row.score),
              benchmark: 62 // Static benchmark for UI
            };
          });
          setEvolutionData(history);
        } else {
          setAnswers({ comite_gobierno: 3, modelado_datos: 3, alineacion_negocio: 3, auditoria_seguridad: 3, marcos_normativos: 3 });
          setEvolutionData([]);
        }

        // Fetch Findings
        const { data: findingsData } = await supabase
          .from('maturity_findings')
          .select('*')
          .eq('tenant_id', currentTenant.id);
        setFindings(findingsData || []);

        // Fetch Roadmaps
        const { data: roadmapsData } = await supabase
          .from('maturity_roadmaps')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('phase', { ascending: true });
        setRoadmaps(roadmapsData || []);
      } catch (e: any) {
        console.error('Error fetching maturity data details:', e.message, e.code, e.details, e.stack || e);
        if (e.code === '42P01') {
          alert('Falta la tabla maturity_assessments. Por favor ejecuta los scripts SQL.');
        }
      }
    };

    loadData();
  }, [currentTenant?.id]);

  // ------- Live DB calculation -------
  const fetchLiveMaturity = React.useCallback(async () => {
    if (!currentTenant) return;
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
    if (!isUuid(currentTenant.id)) {
      console.log('[Maturity] Non-UUID tenant.id in fetchLiveMaturity. Skipping DB query.');
      return;
    }
    try {
      setLoading(true);

      const [
        { data: assetsData },
        { data: workflowsData },
        { data: incidentsData },
        { data: policiesData },
        { data: committeesData },
        { data: committeeDocsData }
      ] = await Promise.all([
        supabase
          .from('data_assets')
          .select('id, quality_score, data_owner, data_steward, sensitivity, criticality, source')
          .eq('tenant_id', currentTenant.id),
        supabase
          .from('workflow_requests')
          .select('id, status')
          .eq('tenant_id', currentTenant.id),
        supabase
          .from('quality_incidents')
          .select('id, severity, status')
          .eq('tenant_id', currentTenant.id),
        supabase
          .from('data_policies')
          .select('id, status')
          .eq('tenant_id', currentTenant.id),
        supabase
          .from('gov_committees')
          .select('id')
          .eq('tenant_id', currentTenant.id),
        supabase
          .from('gov_committee_documents')
          .select('id, committee_id')
      ]);

      const assets = assetsData ?? [];
      const workflows = workflowsData ?? [];
      const incidents = incidentsData ?? [];
      const policies = policiesData ?? [];
      const committees = committeesData ?? [];
      const committeeDocs = committeeDocsData ?? [];

      // Filter resolutions/acts by tenant committees
      const tenantCommitteeIds = committees.map((c: any) => c.id);
      const tenantDocs = committeeDocs.filter((d: any) => tenantCommitteeIds.includes(d.committee_id));

      const totalAssets = assets.length;
      const assetsWithOwner = assets.filter(a => a.data_owner && a.data_owner.trim() !== '' && a.data_owner.trim().toLowerCase() !== 'por definir').length;
      const assetsWithSteward = assets.filter(a => a.data_steward && a.data_steward.trim() !== '' && a.data_steward.trim().toLowerCase() !== 'por definir').length;
      const assetsClassified = assets.filter(a => a.sensitivity && a.sensitivity.trim() !== '').length;
      const assetsWithLineage = assets.filter(a => a.source && a.source.trim() !== '').length;
      const criticalAssets = assets.filter(a => a.criticality === 'Alta' || a.criticality === 'Crítica').length;

      let averageQuality = 80;
      if (totalAssets > 0) {
        const assetsWithVal = assets.filter(a => a.quality_score && a.quality_score > 0);
        if (assetsWithVal.length > 0) {
          const totalQuality = assetsWithVal.reduce((sum, a) => sum + (a.quality_score || 0), 0);
          averageQuality = Math.round(totalQuality / assetsWithVal.length);
        } else {
          averageQuality = 80;
        }
      }

      const openQualityIncidents = incidents.filter(i => i.status !== 'Cerrado' && i.status !== 'Resuelto' && i.status !== 'Corregido').length;
      const openWorkflows = workflows.filter(w => 
        w.status === 'Pendiente' || 
        w.status === 'En Progreso' || 
        w.status === 'Escalado' || 
        w.status === 'En Revisión' ||
        w.status === 'Abierto'
      ).length;
      const openIncidents = openQualityIncidents + openWorkflows;

      const resolvedQualityIncidents = incidents.filter(i => i.status === 'Resuelto' || i.status === 'Cerrado' || i.status === 'Corregido').length;
      const resolvedWorkflows = workflows.filter(w => 
        w.status === 'Aprobado' || 
        w.status === 'Cerrado' || 
        w.status === 'Completado' || 
        w.status === 'Rechazado'
      ).length;
      const resolvedIncidents = resolvedQualityIncidents + resolvedWorkflows;
      const totalIncidents = openIncidents + resolvedIncidents;

      const approvedWorkflows = workflows.filter(w => w.status === 'Aprobado' || w.status === 'Completado' || w.status === 'Cerrado').length;
      const totalWorkflows = workflows.length;

      const totalPolicies = policies.length;
      const expiredPolicies = policies.filter(p => p.status === 'Vencida').length;
      const activePolicies = totalPolicies - expiredPolicies;

      const totalCommittees = committees.length;
      const totalResolutions = tenantDocs.length;

      setDbStats({
        totalAssets,
        assetsWithOwner,
        assetsWithSteward,
        assetsClassified,
        assetsWithLineage,
        criticalAssets,
        averageQuality,
        openIncidents,
        resolvedIncidents,
        totalIncidents,
        approvedWorkflows,
        totalWorkflows,
        totalPolicies,
        activePolicies,
        expiredPolicies,
        totalCommittees,
        totalResolutions,
        openQualityIncidents,
        resolvedQualityIncidents,
      });

    } catch (e) {
      console.error('Error fetching maturity metrics:', e);
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  React.useEffect(() => {
    fetchLiveMaturity();
  }, [fetchLiveMaturity]);

  // ------- Dynamic hybrid scores recalculator -------
  React.useEffect(() => {
    const calidad = Math.max(0, dbStats.averageQuality - (dbStats.openQualityIncidents * 5));

    const comite_gobierno = answers.comite_gobierno ?? 3;
    const modelado_datos = answers.modelado_datos ?? 3;
    const alineacion_negocio = answers.alineacion_negocio ?? 3;
    const auditoria_seguridad = answers.auditoria_seguridad ?? 3;
    const marcos_normativos = answers.marcos_normativos ?? 3;

    const ownerRatio = dbStats.totalAssets > 0 ? (dbStats.assetsWithOwner / dbStats.totalAssets) * 60 : 30;
    const stewardRatio = dbStats.totalAssets > 0 ? (dbStats.assetsWithSteward / dbStats.totalAssets) * 40 : 20;
    const organizacionAuto = ownerRatio + stewardRatio;
    const organizacion = Math.round(organizacionAuto * 0.5 + (comite_gobierno * 20) * 0.5);

    const classRatio = dbStats.totalAssets > 0 ? (dbStats.assetsClassified / dbStats.totalAssets) * 60 : 30;
    const polRatio = dbStats.totalPolicies > 0 ? (dbStats.activePolicies / dbStats.totalPolicies) * 40 : 20;
    const seguridadAuto = classRatio + polRatio;
    const seguridad = Math.round(seguridadAuto * 0.6 + (auditoria_seguridad * 20) * 0.4);

    const linRatio = dbStats.totalAssets > 0 ? (dbStats.assetsWithLineage / dbStats.totalAssets) * 50 : 25;
    const critRatio = dbStats.totalAssets > 0 ? (dbStats.criticalAssets / dbStats.totalAssets) * 50 : 25;
    const arquitecturaAuto = linRatio + critRatio;
    const arquitectura = Math.round(arquitecturaAuto * 0.6 + (modelado_datos * 20) * 0.4);

    const wfRatio = dbStats.totalWorkflows > 0 ? (dbStats.approvedWorkflows / dbStats.totalWorkflows) * 100 : 50;
    const estrategia = Math.round(wfRatio * 0.5 + (alineacion_negocio * 20) * 0.5);

    const incRatio = dbStats.totalIncidents > 0 ? (dbStats.resolvedIncidents / dbStats.totalIncidents) * 100 : 50;
    const compliance = Math.round(incRatio * 0.5 + (marcos_normativos * 20) * 0.5);

    setMaturityScores({ estrategia, organizacion, calidad, arquitectura, seguridad, compliance });
    setItem('maturity_scores', { estrategia, organizacion, calidad, arquitectura, seguridad, compliance });
  }, [dbStats, answers]);

  // ------- Computed values -------
  const globalScore = React.useMemo(() => {
    const { estrategia, organizacion, calidad, arquitectura, seguridad, compliance } = maturityScores;
    return Math.round((estrategia + organizacion + calidad + arquitectura + seguridad + compliance) / 6);
  }, [maturityScores]);

  const maturityLevel = globalScore >= 80 ? 'Optimizado' : globalScore >= 60 ? 'Gestionado' : globalScore >= 40 ? 'Definido' : 'Inicial';
  const levelColor = globalScore >= 80 ? '#10b981' : globalScore >= 60 ? '#3b82f6' : globalScore >= 40 ? '#f59e0b' : '#ef4444';

  const delta = prevGlobalScore !== null ? globalScore - prevGlobalScore : null;

  // Radar data
  const dynamicMaturityData = [
    { subject: 'Estrategia',   A: maturityScores.estrategia,   B: 70, fullMark: 100 },
    { subject: 'Organización', A: maturityScores.organizacion,  B: 65, fullMark: 100 },
    { subject: 'Calidad',      A: maturityScores.calidad,       B: 80, fullMark: 100 },
    { subject: 'Arquitectura', A: maturityScores.arquitectura,  B: 75, fullMark: 100 },
    { subject: 'Seguridad',    A: maturityScores.seguridad,     B: 85, fullMark: 100 },
    { subject: 'Compliance',   A: maturityScores.compliance,    B: 70, fullMark: 100 },
  ];

  // Dimension cards
  const dynamicDimensions = [
    {
      id: 'estrategia', name: 'Estrategia', score: maturityScores.estrategia, icon: Target,
      status: maturityScores.estrategia >= 80 ? 'Optimizado' : maturityScores.estrategia >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Visión de Gobierno', score: Math.round(dbStats.totalWorkflows > 0 ? (dbStats.approvedWorkflows / dbStats.totalWorkflows) * 100 : 50), type: 'auto' },
        { name: 'Políticas Definidas', score: Math.min(100, Math.round(dbStats.totalPolicies > 0 ? (dbStats.activePolicies / dbStats.totalPolicies) * 100 : 50)), type: 'auto' },
        { name: 'Alineación Negocio',  score: answers.alineacion_negocio * 20, type: 'manual' },
      ],
    },
    {
      id: 'organizacion', name: 'Organización', score: maturityScores.organizacion, icon: Users,
      status: maturityScores.organizacion >= 80 ? 'Optimizado' : maturityScores.organizacion >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Roles y Resp.',         score: Math.min(100, Math.round(dbStats.totalAssets > 0 ? ((dbStats.assetsWithOwner + dbStats.assetsWithSteward) / (dbStats.totalAssets * 2)) * 100 : 50)), type: 'auto' },
        { name: 'Data Owners',           score: Math.min(100, Math.round(dbStats.totalAssets > 0 ? (dbStats.assetsWithOwner / dbStats.totalAssets) * 100 : 50)), type: 'auto' },
        { name: 'Comité de Gobierno',    score: answers.comite_gobierno * 20, type: 'manual' },
      ],
    },
    {
      id: 'calidad', name: 'Calidad', score: maturityScores.calidad, icon: TrendingUp,
      status: maturityScores.calidad >= 80 ? 'Optimizado' : maturityScores.calidad >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Reglas de Calidad',   score: dbStats.averageQuality, type: 'auto' },
        { name: 'Monitoreo Auto.',     score: Math.max(0, 100 - (dbStats.openQualityIncidents * 10)), type: 'auto' },
        { name: 'Gestión Incidentes',  score: Math.min(100, Math.round(dbStats.totalIncidents > 0 ? (dbStats.resolvedIncidents / dbStats.totalIncidents) * 100 : 80)), type: 'auto' },
      ],
    },
    {
      id: 'arquitectura', name: 'Arquitectura', score: maturityScores.arquitectura, icon: BarChart3,
      status: maturityScores.arquitectura >= 80 ? 'Optimizado' : maturityScores.arquitectura >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Modelado Datos', score: answers.modelado_datos * 20, type: 'manual' },
        { name: 'Integración',    score: Math.min(100, Math.round(dbStats.totalAssets > 0 ? (dbStats.assetsWithLineage / dbStats.totalAssets) * 100 : 50)), type: 'auto' },
        { name: 'Linaje Técnico', score: Math.min(100, Math.round(dbStats.totalAssets > 0 ? (dbStats.assetsWithLineage / dbStats.totalAssets) * 100 : 50)), type: 'auto' },
      ],
    },
    {
      id: 'seguridad', name: 'Seguridad', score: maturityScores.seguridad, icon: Shield,
      status: maturityScores.seguridad >= 80 ? 'Optimizado' : maturityScores.seguridad >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Clasificación PII', score: Math.min(100, Math.round(dbStats.totalAssets > 0 ? (dbStats.assetsClassified / dbStats.totalAssets) * 100 : 50)), type: 'auto' },
        { name: 'Control Acceso',    score: Math.min(100, Math.round(dbStats.totalAssets > 0 ? (dbStats.assetsClassified / dbStats.totalAssets) * 100 : 80)), type: 'auto' },
        { name: 'Auditoría',         score: answers.auditoria_seguridad * 20, type: 'manual' },
      ],
    },
    {
      id: 'compliance', name: 'Compliance', score: maturityScores.compliance, icon: FileCheck,
      status: maturityScores.compliance >= 80 ? 'Optimizado' : maturityScores.compliance >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Marcos Normativos',  score: answers.marcos_normativos * 20, type: 'manual' },
        { name: 'Incidentes Resueltos', score: Math.min(100, Math.round(dbStats.totalIncidents > 0 ? (dbStats.resolvedIncidents / dbStats.totalIncidents) * 100 : 50)), type: 'auto' },
        { name: 'Auditoría Continua', score: Math.min(100, Math.round(dbStats.totalPolicies > 0 ? (dbStats.activePolicies / dbStats.totalPolicies) * 100 : 80)), type: 'auto' },
      ],
    },
  ];

  const [assigningTaskIds, setAssigningTaskIds] = React.useState<Record<string, boolean>>({});
  const [assignedTasks, setAssignedTasks] = React.useState<Record<string, boolean>>({});

  const handleAssignWorkflowTask = async (task: { title: string; description: string; impact: string }, dimensionName: string, taskId: string) => {
    if (!currentTenant?.id) return;
    setAssigningTaskIds(prev => ({ ...prev, [taskId]: true }));
    try {
      const title = `[Madurez] ${task.title}`;
      const description = `${task.description}\n\nRecomendado desde el Centro de Madurez para la dimensión de ${dimensionName}. Impacto esperado: ${task.impact}`;
      
      const { data, error } = await supabase.from('workflow_requests').insert([{
        tenant_id: currentTenant.id,
        title,
        description,
        status: 'Pendiente',
        category: dimensionName === 'Seguridad' ? 'Seguridad' : dimensionName === 'Calidad' ? 'Calidad' : 'Gobernanza',
        priority: 'Media',
        sla: '72h',
        sla_status: 'Ok',
        current_step: 'Plan de Mejora de Madurez',
        timeline: [
          { step: 'Identificado en Auditoría de Madurez', user: 'Sistema de Madurez GMF', date: new Date().toISOString().split('T')[0], status: 'done' }
        ]
      }]).select();

      if (error) throw error;
      setAssignedTasks(prev => ({ ...prev, [taskId]: true }));
      alert(`¡La recomendación "${task.title}" ha sido asignada exitosamente al Workflow de Gobernanza!`);
    } catch (e: any) {
      console.error('Error assigning workflow task:', e);
      alert('Error al crear la solicitud en el workflow: ' + e.message);
    } finally {
      setAssigningTaskIds(prev => ({ ...prev, [taskId]: false }));
    }
  };

  // ------- Assessment submit -------
  const handleAssessmentSubmit = async () => {
    if (!currentTenant?.id) return;

    // Snapshot previous global score before recalculate
    setPrevGlobalScore(globalScore);
    fetchLiveMaturity();

    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('maturity_assessments').insert([{
        tenant_id: currentTenant.id,
        dimension: 'GLOBAL',
        score: globalScore,
        answers: {
          timestamp: new Date().toISOString(),
          comite_gobierno: answers.comite_gobierno,
          modelado_datos: answers.modelado_datos,
          alineacion_negocio: answers.alineacion_negocio,
          auditoria_seguridad: answers.auditoria_seguridad,
          marcos_normativos: answers.marcos_normativos,
          dbStats: dbStats,
          maturityScores: maturityScores
        },
        assessment_date: today
      }]);
      if (error) throw error;
      
      // Update local evolution graph immediately
      const month = getCurrentMonthLabel();
      const newPoint = { name: month, score: globalScore, benchmark: 62 };
      const updatedHistory = [...evolutionData];
      const existingIdx = updatedHistory.findIndex(e => e.name === month);
      if (existingIdx >= 0) updatedHistory[existingIdx] = newPoint;
      else updatedHistory.push(newPoint);
      const trimmed = updatedHistory.slice(-12);
      setEvolutionData(trimmed);
      
    } catch (e: any) {
      console.error('Error saving maturity assessment:', e);
      alert('Error guardando evaluación en base de datos.');
    }

    setIsAssessmentModalOpen(false);
    setWizardStep(0);
  };

  const renderQuestion = (
    key: string,
    title: string,
    desc: string,
    options: { val: number; text: string }[]
  ) => {
    const currentVal = answers[key] || 3;
    return (
      <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '4px' }}>{title}</label>
        <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>{desc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setAnswers(prev => ({ ...prev, [key]: opt.val }))}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: currentVal === opt.val ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                background: currentVal === opt.val ? '#eff6ff' : '#ffffff',
                color: currentVal === opt.val ? '#1d4ed8' : '#475569',
                textAlign: 'left',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                gap: '8px'
              }}
            >
              <strong>{opt.val}</strong> — {opt.text}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Circle progress helper
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (globalScore / 100) * circumference;

  return (
    <div className={styles.container} style={{ ['--dynamic-primary' as any]: primaryColor }}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.breadcrumb}>Gobierno {'>'} Centro de Madurez</div>
          <h1>🚀 Centro de Evaluación de Madurez (GMF)</h1>
          <p>Basado en <strong>GovData Maturity Framework</strong>. Evaluación híbrida continua.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => setIsHistoryModalOpen(true)}>
            <History size={18} /> Ver Evolución
          </button>
          <button className={styles.primaryBtn} onClick={() => setIsAssessmentModalOpen(true)}>
            <Zap size={18} /> Nueva Evaluación
          </button>
        </div>
      </header>

      {/* ── Consolidated Global Score Banner ── */}
      <motion.div
        className={styles.globalBanner}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.globalLeft}>
          <div className={styles.circleWrap}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={levelColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={loading ? circumference : dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
              <text x="60" y="55" textAnchor="middle" fill={levelColor} fontSize="22" fontWeight="900">
                {loading ? '…' : `${globalScore}%`}
              </text>
              <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                GLOBAL
              </text>
            </svg>
          </div>
          <div className={styles.globalInfo}>
            <div className={styles.globalLevel} style={{ color: levelColor }}>
              <Award size={20} /> {maturityLevel}
            </div>
            <h2 className={styles.globalTitle}>Madurez Global de Gobierno de Datos</h2>
            <p className={styles.globalSub}>
              Calculado sobre 6 dimensiones · {dbStats.totalAssets} activos evaluados
            </p>
            {delta !== null && (
              <div className={styles.deltaChip} style={{ color: delta >= 0 ? '#10b981' : '#ef4444' }}>
                <ArrowUpRight size={14} style={{ transform: delta < 0 ? 'rotate(90deg)' : undefined }} />
                {delta >= 0 ? '+' : ''}{delta}% vs evaluación anterior
              </div>
            )}
          </div>
        </div>

        {/* Mini dimension pills */}
        <div className={styles.globalRight}>
          {dynamicDimensions.map(d => (
            <div key={d.id} className={styles.miniPill} onClick={() => setSelectedDim(d)}>
              <d.icon size={14} />
              <span>{d.name}</span>
              <strong style={{ color: d.score >= 70 ? '#10b981' : d.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                {loading ? '…' : `${d.score}%`}
              </strong>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div className={styles.kpiGrid}>
        <div 
          className={styles.kpiCard}
          onClick={() => setSelectedKpiDetails(getKpiExplanation('Nivel Actual', globalScore, levelColor, maturityLevel, dbStats))}
          style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = levelColor; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; }}
        >
          <div className={styles.kpiHeader}><Target size={20} /><span>Nivel Actual</span></div>
          <div className={styles.kpiValue} style={{ color: levelColor }}>{loading ? '…' : maturityLevel}</div>
          <div className={styles.kpiSub}>Score global: {globalScore}% (Ver detalle 🔍)</div>
        </div>
        <div 
          className={styles.kpiCard}
          onClick={() => setSelectedKpiDetails(getKpiExplanation('Benchmark Sector', globalScore, levelColor, maturityLevel, dbStats))}
          style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; }}
        >
          <div className={styles.kpiHeader}><ArrowUpRight size={20} /><span>Benchmark Sector</span></div>
          <div className={styles.kpiValue}>+{Math.max(0, globalScore - 62)}%</div>
          <div className={styles.kpiSub}>Vs Sector Gubernamental (Ver detalle 🔍)</div>
        </div>
        <div 
          className={styles.kpiCard}
          onClick={() => setSelectedKpiDetails(getKpiExplanation('Incidentes Abiertos', globalScore, levelColor, maturityLevel, dbStats))}
          style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = dbStats.openIncidents > 5 ? '#ef4444' : '#f59e0b'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; }}
        >
          <div className={styles.kpiHeader}><ShieldAlert size={20} /><span>Incidentes Abiertos</span></div>
          <div className={styles.kpiValue} style={{ color: dbStats.openIncidents > 5 ? '#ef4444' : '#f59e0b' }}>
            {loading ? '…' : dbStats.openIncidents}
          </div>
          <div className={styles.kpiSub}>Calidad y Mesa de Servicio (Ver detalle 🔍)</div>
        </div>
        <div 
          className={styles.kpiCard}
          onClick={() => setSelectedKpiDetails(getKpiExplanation('Dimensiones', globalScore, levelColor, maturityLevel, dbStats))}
          style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; }}
        >
          <div className={styles.kpiHeader}><CheckCircle2 size={20} /><span>Dimensiones</span></div>
          <div className={styles.kpiValue}>
            {loading ? '…' : `${dynamicDimensions.filter(d => d.score >= 60).length}/6`}
          </div>
          <div className={styles.kpiSub}>En nivel Gestionado o superior (Ver detalle 🔍)</div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          {/* Radar Chart */}
          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <h3>Dimensiones de Gobierno</h3>
              <div className={styles.legend}>
                <span className={styles.legItem}><div className={styles.dot} style={{ background: primaryColor }} /> Actual</span>
                <span className={styles.legItem}><div className={styles.dot} style={{ background: '#94a3b8' }} /> Industria</span>
              </div>
            </div>
            <div className={styles.radarContainer}>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dynamicMaturityData}>
                  <defs>
                    <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="industryGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#64748b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="#cbd5e1" strokeWidth={1.5} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                      background: '#ffffff', 
                      color: '#1e293b' 
                    }} 
                  />
                  <Radar name="Actual" dataKey="A" stroke={primaryColor} strokeWidth={3.5} fill="url(#actualGrad)" filter="url(#radarGlow)" />
                  <Radar name="Industria" dataKey="B" stroke="#94a3b8" strokeWidth={1.5} fill="url(#industryGrad)" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dimension list */}
          <div className={styles.dimensionsList}>
            {dynamicDimensions.map(dim => (
              <motion.div
                key={dim.id}
                className={`${styles.dimListItem} ${selectedDim?.id === dim.id ? styles.selectedDim : ''}`}
                onClick={() => setSelectedDim(dim)}
                whileHover={{ x: 5 }}
              >
                <div className={styles.dimInfo}>
                  <div className={styles.dimIcon}><dim.icon size={20} /></div>
                  <div>
                    <strong>{dim.name}</strong>
                    <span className={styles.dimStatus}>{dim.status}</span>
                  </div>
                </div>
                <div className={styles.dimScoreArea}>
                  <div className={styles.miniBar}>
                    <div
                      className={styles.miniBarFill}
                      style={{
                        width: loading ? '0%' : `${dim.score}%`,
                        background: dim.score >= 70 ? '#10b981' : dim.score >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className={styles.dimScoreText}>{loading ? '…' : `${dim.score}%`}</span>
                  <ChevronRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className={styles.rightColumn}>
          <AnimatePresence mode="wait">
            {selectedDim ? (
              <motion.div
                key={selectedDim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.detailPanel}
              >
                <div className={styles.detailHeader}>
                  <div className={styles.detailTitle}>
                    <selectedDim.icon size={24} />
                    <h2>Dimensión: {selectedDim.name}</h2>
                  </div>
                  <div className={styles.detailScore}>
                    <span>Score Actual</span>
                    <strong style={{ color: levelColor }}>{selectedDim.score}%</strong>
                  </div>
                </div>

                {/* Score bar */}
                <div className={styles.scoreMeter}>
                  <div className={styles.scoreMeterFill} style={{
                    width: `${selectedDim.score}%`,
                    background: selectedDim.score >= 70 ? '#10b981' : selectedDim.score >= 50 ? '#f59e0b' : '#ef4444',
                  }} />
                </div>
                <div className={styles.scoreMeterLabels}>
                  <span>Inicial</span><span>Definido</span><span>Gestionado</span><span>Optimizado</span>
                </div>

                <div className={styles.capabilitiesList}>
                  <h3>Capacidades Evaluadas</h3>
                  {selectedDim.capabilities.map((cap: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={styles.capItem}
                      onClick={() => setSelectedCapDetails(getCapExplanation(cap.name, dbStats, answers))}
                      style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <div className={styles.capMain}>
                        <div className={styles.capInfo}>
                          <strong>{cap.name}</strong>
                          <span className={styles.capType}>{cap.type === 'auto' ? '⚡ Automatizada' : '👤 Manual'} (Ver detalle 🔍)</span>
                        </div>
                        <span style={{ fontWeight: 800, color: cap.score >= 70 ? '#10b981' : cap.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {cap.score}%
                        </span>
                      </div>
                      <div className={styles.capBarBg}>
                        <div className={styles.capBarFill} style={{
                          width: `${cap.score}%`,
                          background: cap.score >= 70 ? '#10b981' : cap.score >= 50 ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.findingsBox}>
                  <h3><AlertTriangle size={16} /> Hallazgos y Riesgos</h3>
                  {findings.filter(f => f.dimension.toLowerCase() === selectedDim.id.toLowerCase()).map((f, idx) => (
                    <div key={f.id || idx} className={styles.findingItem}>
                      <div className={styles.riskLevel} data-level={f.severity || 'medium'} />
                      <p>{f.finding}</p>
                    </div>
                  ))}
                  {findings.filter(f => f.dimension.toLowerCase() === selectedDim.id.toLowerCase()).length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No hay hallazgos registrados para esta dimensión.</p>
                  )}
                </div>

                <div className={styles.roadmapBox}>
                  <h3>🚀 Roadmap Recomendado ({ROADMAP_RECOMMENDATIONS[selectedDim.id]?.length || 0} Iniciativas)</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                    Selecciona y asigna de manera independiente las iniciativas estratégicas que tu organización decida priorizar para avanzar en el nivel de madurez.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(ROADMAP_RECOMMENDATIONS[selectedDim.id] || []).map((task) => {
                      const isAssigning = !!assigningTaskIds[task.id];
                      const isAssigned = !!assignedTasks[task.id];
                      return (
                        <div 
                          key={task.id} 
                          style={{ 
                            padding: '16px', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{task.title}</strong>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 800, 
                              color: '#6366f1', 
                              background: '#f5f3ff', 
                              padding: '2px 8px', 
                              borderRadius: '20px',
                              whiteSpace: 'nowrap'
                            }}>
                              {task.impact}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>{task.description}</p>
                          
                          <button
                            className={isAssigned ? styles.secondaryBtn : styles.primaryBtn}
                            style={{ 
                              alignSelf: 'flex-start', 
                              padding: '6px 12px', 
                              fontSize: '0.78rem', 
                              marginTop: '4px',
                              background: isAssigned ? '#ecfdf5' : undefined,
                              color: isAssigned ? '#10b981' : undefined,
                              borderColor: isAssigned ? '#10b981' : undefined
                            }}
                            onClick={() => handleAssignWorkflowTask(task, selectedDim.name, task.id)}
                            disabled={isAssigning || isAssigned}
                          >
                            {isAssigning ? 'Asignando...' : isAssigned ? '✓ Asignada a Workflow' : 'Asignar a Workflow'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.generalOverview}
              >
                <div className={styles.overviewHeader}>
                  <TrendingUp size={32} className={styles.overviewIcon} />
                  <div>
                    <h2>Resumen Ejecutivo de Madurez</h2>
                    <p>Estado general de las capacidades de gobierno organizacional.</p>
                  </div>
                </div>

                {/* Consolidated global % bar */}
                <div className={styles.globalScoreBar}>
                  <div className={styles.globalScoreBarHeader}>
                    <span>Madurez Global</span>
                    <strong style={{ color: levelColor }}>{globalScore}%</strong>
                  </div>
                  <div className={styles.bigBar}>
                    <motion.div
                      className={styles.bigBarFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${globalScore}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(90deg, ${primaryColor}, ${levelColor})` }}
                    />
                    {/* Milestone markers */}
                    {[25, 50, 75].map(m => (
                      <div key={m} className={styles.barMarker} style={{ left: `${m}%` }} />
                    ))}
                  </div>
                  <div className={styles.bigBarLabels}>
                    <span>Inicial</span><span>Definido</span><span>Gestionado</span><span>Optimizado</span>
                  </div>
                </div>

                <div className={styles.distributionStats}>
                  <h3>Distribución por Dimensión</h3>
                  <div className={styles.distGrid}>
                    {dynamicDimensions.map(d => (
                      <div key={d.id} className={styles.distItem} onClick={() => setSelectedDim(d)}>
                        <div className={styles.distLabel}><d.icon size={16} /><span>{d.name}</span></div>
                        <div className={styles.distBar}>
                          <motion.div
                            className={styles.distFill}
                            initial={{ width: 0 }}
                            animate={{ width: loading ? '0%' : `${d.score}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            style={{
                              background: d.score >= 70
                                ? 'linear-gradient(90deg,#10b981,#059669)'
                                : d.score >= 50
                                ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                                : 'linear-gradient(90deg,#ef4444,#dc2626)',
                            }}
                          />
                        </div>
                        <span className={styles.distValue} style={{ color: d.score >= 70 ? '#10b981' : d.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {loading ? '…' : `${d.score}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.nextSteps}>
                  <h3>Próximos Pasos Estratégicos</h3>
                  {dynamicDimensions
                    .filter(d => d.score < 70)
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3)
                    .map((d, i) => (
                      <div key={d.id} className={styles.stepCard}>
                        <div className={styles.stepNum}>{i + 1}</div>
                        <p>
                          Mejorar <strong>{d.name}</strong> ({d.score}%) —
                          {d.id === 'calidad' && ' ejecutar escaneo de calidad en activos críticos.'}
                          {d.id === 'organizacion' && ' formalizar Comité de Gobierno y asignar Data Owners.'}
                          {d.id === 'arquitectura' && ' mapear linaje de datos y clasificar activos huérfanos.'}
                          {d.id === 'compliance' && ' resolver incidentes abiertos y actualizar marcos normativos.'}
                          {d.id === 'seguridad' && ' clasificar datos PII y activar políticas de enmascaramiento.'}
                          {d.id === 'estrategia' && ' aprobar workflows pendientes y revisar objetivos de gobierno.'}
                        </p>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Roadmap Section ── */}
      <div className={styles.roadmapSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}><Briefcase size={22} /><h2>Roadmap de Mejora Continua (90 Días)</h2></div>
          <button className={styles.secondaryBtn}><RefreshCw size={16} /> Actualizar Plan</button>
        </div>
        <div className={styles.timeline}>
          {roadmaps.map((r, idx) => (
            <div key={r.id || idx} className={styles.timelineItem}>
              <div className={styles.timeLabel}>{r.phase}</div>
              <div className={styles.timeContent}>
                <strong>{r.title}</strong>
                <p>{r.description}</p>
              </div>
            </div>
          ))}
          {roadmaps.length === 0 && (
            <div style={{ textAlign: 'center', width: '100%', padding: '20px', color: '#64748b' }}>
              No hay pasos de roadmap registrados en la base de datos para esta organización.
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: EVOLUCIÓN HISTÓRICA ── */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsHistoryModalOpen(false); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modalContent}
              style={{ width: '820px' }}
            >
              <div className={styles.modalHeader}>
                <h2>📈 Evolución Histórica de Madurez</h2>
                <button className={styles.closeBtn} onClick={() => setIsHistoryModalOpen(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                {/* Current snapshot */}
                <div className={styles.historySnapshot}>
                  <div className={styles.snapItem}>
                    <span>Score Actual</span>
                    <strong style={{ color: levelColor }}>{globalScore}%</strong>
                  </div>
                  <div className={styles.snapItem}>
                    <span>Nivel</span>
                    <strong>{maturityLevel}</strong>
                  </div>
                  <div className={styles.snapItem}>
                    <span>Evaluaciones</span>
                    <strong>{evolutionData.length}</strong>
                  </div>
                  <div className={styles.snapItem}>
                    <span>Tendencia</span>
                    <strong style={{ color: '#10b981' }}>
                      {evolutionData.length >= 2
                        ? `+${evolutionData[evolutionData.length - 1].score - evolutionData[evolutionData.length - 2].score}%`
                        : 'N/A'}
                    </strong>
                  </div>
                </div>

                <div className={styles.chartLegend}>
                  <div className={styles.legItem}><div className={styles.dot} style={{ background: primaryColor }} /> GovData Score</div>
                  <div className={styles.legItem}><div className={styles.dot} style={{ background: '#94a3b8', border: '1px dashed #64748b' }} /> Benchmark Industria</div>
                </div>

                {evolutionData.length < 2 ? (
                  <div className={styles.emptyHistory}>
                    <History size={40} style={{ color: '#cbd5e1' }} />
                    <p>Realiza al menos 2 evaluaciones para ver la evolución histórica.</p>
                    <button className={styles.primaryBtn} onClick={() => { setIsHistoryModalOpen(false); setIsAssessmentModalOpen(true); }}>
                      <Zap size={16} /> Iniciar Evaluación
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 360, marginTop: '16px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} unit="%" />
                        <Tooltip
                          formatter={(val: any) => [`${val}%`]}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Line
                          type="monotone" dataKey="score" name="Score Global" stroke={primaryColor}
                          strokeWidth={4} dot={{ r: 6, fill: primaryColor, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone" dataKey="benchmark" name="Benchmark" stroke="#94a3b8"
                          strokeWidth={2} strokeDasharray="5 5" dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {evolutionData.length >= 2 && (
                  <div className={styles.historyInsights}>
                    <div className={styles.insightCard}>
                      <TrendingUp size={20} style={{ color: '#10b981' }} />
                      <div>
                        <strong>Progreso registrado</strong>
                        <p>
                          Desde la primera evaluación ({evolutionData[0].score}%) hasta la más reciente ({evolutionData[evolutionData.length - 1].score}%),
                          se ha logrado un crecimiento de <strong>+{evolutionData[evolutionData.length - 1].score - evolutionData[0].score}%</strong> en madurez global.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: NUEVA EVALUACIÓN ── */}
      <AnimatePresence>
        {isAssessmentModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) { setIsAssessmentModalOpen(false); setWizardStep(0); } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={styles.modalContent}
              style={{ width: '650px', maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              <div className={styles.modalHeader} style={{ padding: '24px 32px 16px', background: 'transparent', borderBottom: 'none' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Asistente de Madurez GovData</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Auditoría Automática de Base de Datos · Paso {wizardStep + 1} de 5
                  </p>
                </div>
                <button className={styles.closeBtn} onClick={() => { setIsAssessmentModalOpen(false); setWizardStep(0); }}>×</button>
              </div>

              <div className={styles.modalBody} style={{ padding: '0 32px 24px', overflowY: 'auto', flex: 1 }}>
                
                {wizardStep === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <Zap size={32} color={primaryColor} style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#334155' }}>
                        <strong>Auditoría Basada en Evidencia</strong>
                        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                          Este asistente escaneará las tablas y registros correspondientes a tu empresa para computar los scores en las 6 dimensiones del GovData Maturity Framework sin estimaciones manuales.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Módulos a Auditar</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Users size={16} color="#3b82f6" /> Organización (Catálogo)
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                          <BarChart3 size={16} color="#10b981" /> Arquitectura (Linaje)
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                          <TrendingUp size={16} color="#f59e0b" /> Calidad de Datos
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Target size={16} color="#8b5cf6" /> Estrategia (Workflows)
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Shield size={16} color="#6366f1" /> Seguridad (PII)
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                          <FileCheck size={16} color="#ef4444" /> Compliance (Políticas)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>1. Catálogo & Estructura Organizativa</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.4 }}>
                      Análisis de activos registrados en `data_assets` y asignación de roles.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Total Activos de Datos:</span>
                        <strong>{dbStats.totalAssets}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Activos con Propietario (Data Owner):</span>
                        <strong>{dbStats.assetsWithOwner} ({dbStats.totalAssets > 0 ? Math.round(dbStats.assetsWithOwner / dbStats.totalAssets * 100) : 0}%)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Activos con Steward Técnico:</span>
                        <strong>{dbStats.assetsWithSteward} ({dbStats.totalAssets > 0 ? Math.round(dbStats.assetsWithSteward / dbStats.totalAssets * 100) : 0}%)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Activos con Trazabilidad (Linaje):</span>
                        <strong>{dbStats.assetsWithLineage} ({dbStats.totalAssets > 0 ? Math.round(dbStats.assetsWithLineage / dbStats.totalAssets * 100) : 0}%)</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Organización (Auto)</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{Math.round(dbStats.totalAssets > 0 ? (dbStats.assetsWithOwner / dbStats.totalAssets * 60 + dbStats.assetsWithSteward / dbStats.totalAssets * 40) : 50)}%</strong>
                      </div>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Arquitectura (Auto)</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{Math.round(dbStats.totalAssets > 0 ? (dbStats.assetsWithLineage / dbStats.totalAssets * 50 + dbStats.criticalAssets / dbStats.totalAssets * 50) : 50)}%</strong>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '10px' }}>Evaluación de Capacidades Manuales</span>
                    {renderQuestion('comite_gobierno', 'Comité de Gobierno (Organización)', 'Nivel de madurez y frecuencia de reuniones del Comité de Gobierno de Datos.', [
                      { val: 1, text: 'No existe comité ni roles formalizados' },
                      { val: 2, text: 'Reuniones de comité ocasionales sin actas de resolución' },
                      { val: 3, text: 'Comité formalizado con reuniones mensuales y actas' },
                      { val: 4, text: 'Decisiones del comité son vinculantes y tienen seguimiento formal' },
                      { val: 5, text: 'Comité maduro, optimización y alineación interdepartamental continua' }
                    ])}
                    {renderQuestion('modelado_datos', 'Modelado de Datos (Arquitectura)', 'Estandarización y documentación de modelos de datos (conceptual, lógico, físico).', [
                      { val: 1, text: 'Sin modelado formal (ad-hoc por desarrollador)' },
                      { val: 2, text: 'Modelado conceptual básico de bases de datos críticas' },
                      { val: 3, text: 'Documentación lógica y física completa de bases de datos críticas' },
                      { val: 4, text: 'Modelado y diccionario de datos sincronizado con el catálogo' },
                      { val: 5, text: 'Metadatos y linaje técnico integrados en workflows automatizados' }
                    ])}
                  </div>
                )}

                {wizardStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>2. Calidad de Datos & Operación de Gobierno</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.4 }}>
                      Análisis de reglas de calidad y eficiencia de flujos de aprobación.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Calidad Promedio del Catálogo:</span>
                        <strong>{dbStats.averageQuality}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Incidentes de Calidad Abiertos:</span>
                        <strong style={{ color: dbStats.openIncidents > 0 ? '#ef4444' : '#10b981' }}>{dbStats.openIncidents}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Solicitudes Operadas a Tiempo (SLA):</span>
                        <strong>{dbStats.approvedWorkflows} de {dbStats.totalWorkflows} aprobados</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Calidad (Auto)</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{maturityScores.calidad}%</strong>
                      </div>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Estrategia (Auto)</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{Math.round(dbStats.totalWorkflows > 0 ? (dbStats.approvedWorkflows / dbStats.totalWorkflows * 100) : 50)}%</strong>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '10px' }}>Evaluación de Capacidades Manuales</span>
                    {renderQuestion('alineacion_negocio', 'Alineación de Negocio (Estrategia)', 'Alineación de la estrategia de datos con los objetivos del negocio.', [
                      { val: 1, text: 'Sin iniciativas de datos vinculadas a metas de negocio' },
                      { val: 2, text: 'Iniciativas aisladas para resolver necesidades inmediatas' },
                      { val: 3, text: 'Casos de uso de negocio priorizados y aprobados por la dirección' },
                      { val: 4, text: 'Impacto y retorno de inversión de datos (ROI) medidos formalmente' },
                      { val: 5, text: 'Los datos impulsan activamente la estrategia comercial y operativa' }
                    ])}
                  </div>
                )}

                {wizardStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>3. Políticas, Seguridad & Comités Directivos</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.4 }}>
                      Análisis de la gobernanza ejecutiva, actas registradas y clasificación de PII.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Activos Clasificados (Sensibilidad):</span>
                        <strong>{dbStats.assetsClassified} ({dbStats.totalAssets > 0 ? Math.round(dbStats.assetsClassified / dbStats.totalAssets * 100) : 0}%)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Políticas Vigentes vs Vencidas:</span>
                        <strong>{dbStats.activePolicies} activas / {dbStats.expiredPolicies} vencidas</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>Comités Creados & Actas Registradas:</span>
                        <strong>{dbStats.totalCommittees} comités / {dbStats.totalResolutions} resoluciones</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Seguridad (Auto)</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{Math.round(dbStats.totalAssets > 0 ? (dbStats.assetsClassified / dbStats.totalAssets * 60 + dbStats.totalPolicies > 0 ? (dbStats.activePolicies / dbStats.totalPolicies) * 40 : 20) : 50)}%</strong>
                      </div>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Compliance (Auto)</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{Math.round(dbStats.totalIncidents > 0 ? (dbStats.resolvedIncidents / dbStats.totalIncidents * 50 + dbStats.totalPolicies > 0 ? (dbStats.activePolicies / dbStats.totalPolicies) * 50 : 25) : 50)}%</strong>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '10px' }}>Evaluación de Capacidades Manuales</span>
                    {renderQuestion('auditoria_seguridad', 'Auditoría de Seguridad', 'Madurez y frecuencia de las auditorías de seguridad y brechas.', [
                      { val: 1, text: 'Reactiva (auditorías solo tras incidentes)' },
                      { val: 2, text: 'Evaluación anual básica de brechas y vulnerabilidades' },
                      { val: 3, text: 'Auditorías de acceso y clasificación semestrales documentadas' },
                      { val: 4, text: 'SOC activo y monitoreo de accesos privilegiados en tiempo real' },
                      { val: 5, text: 'Auditorías y simulacros de brechas automatizados continuos' }
                    ])}
                    {renderQuestion('marcos_normativos', 'Marcos Normativos (Compliance)', 'Adopción de marcos normativos (GDPR, ISO, Ley 1581, etc.).', [
                      { val: 1, text: 'Sin marcos normativos definidos ni adoptados' },
                      { val: 2, text: 'Adopción informal y reactiva ante requerimientos legales' },
                      { val: 3, text: 'Controles y políticas de frameworks formalizados (GDPR, ISO)' },
                      { val: 4, text: 'Evaluación continua de cumplimiento de políticas de datos' },
                      { val: 5, text: 'Cumplimiento normativo automatizado e integrado en todo flujo de datos' }
                    ])}
                  </div>
                )}

                {wizardStep === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>4. Consolidación Final</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.4 }}>
                      Resultados calculados sobre la base de datos de producción:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {dynamicDimensions.map(d => (
                        <div key={d.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{d.name}</span>
                          <strong style={{ color: d.score >= 70 ? '#10b981' : d.score >= 50 ? '#f59e0b' : '#ef4444' }}>{d.score}%</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>Consolidado Global Recalculado</span>
                      <strong style={{ fontSize: '2rem', color: '#1d4ed8' }}>{globalScore}%</strong>
                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: levelColor, marginTop: '4px' }}>Nivel de Madurez: {maturityLevel}</span>
                    </div>
                  </div>
                )}

              </div>

              <div className={styles.modalFooter} style={{ padding: '16px 32px 24px', background: 'transparent', borderTop: 'none', gap: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                {wizardStep > 0 && (
                  <button className={styles.secondaryBtn} onClick={() => setWizardStep(prev => prev - 1)}>
                    Atrás
                  </button>
                )}
                <button className={styles.secondaryBtn} onClick={() => { setIsAssessmentModalOpen(false); setWizardStep(0); }}>
                  Cancelar
                </button>
                {wizardStep < 4 ? (
                  <button className={styles.primaryBtn} onClick={() => setWizardStep(prev => prev + 1)}>
                    Siguiente
                  </button>
                ) : (
                  <button className={styles.primaryBtn} onClick={handleAssessmentSubmit} style={{ background: '#10b981' }}>
                    <CheckCircle2 size={16} /> Confirmar y Guardar
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCapDetails && (
          <div className={styles.modalOverlay} onClick={() => setSelectedCapDetails(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '600px', border: '1px solid #e2e8f0' }}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={styles.titleIcon} style={{ background: '#3b82f6' }}>
                    <Award size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{selectedCapDetails.name}</h2>
                    <span className={styles.capType} style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#475569', display: 'inline-block', marginTop: '4px' }}>
                      {selectedCapDetails.type === 'auto' ? '⚡ Indicador Automatizado' : '👤 Autoevaluación Manual'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedCapDetails(null)} className={styles.closeBtn}>&times;</button>
              </div>

              <div className={styles.modalBody} style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5 }}>{selectedCapDetails.desc}</p>
                </div>

                <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#64748b' }}>Fórmula / Regla</h4>
                    <code style={{ fontSize: '0.85rem', color: '#2563eb', wordBreak: 'break-all' }}>{selectedCapDetails.formula}</code>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '90px', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#64748b' }}>Score Actual</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: selectedCapDetails.score >= 70 ? '#10b981' : selectedCapDetails.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {selectedCapDetails.score}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado de tus Datos (Esta Empresa)</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontWeight: 600 }}>{selectedCapDetails.currentData}</p>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} /> Plan de Acción para Mejorar
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#14532d', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.4 }}>
                    {selectedCapDetails.actionPlan.map((step: string, sIdx: number) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.modalFooter} style={{ padding: '16px 32px' }}>
                <button onClick={() => setSelectedCapDetails(null)} className={styles.primaryBtn} style={{ width: '100%' }}>
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedKpiDetails && (
          <div className={styles.modalOverlay} onClick={() => setSelectedKpiDetails(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '600px', border: `1px solid ${selectedKpiDetails.color || '#cbd5e1'}` }}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={styles.titleIcon} style={{ background: selectedKpiDetails.color || '#3b82f6' }}>
                    <Award size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{selectedKpiDetails.name}</h2>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'inline-block', marginTop: '2px' }}>
                      {selectedKpiDetails.subtitle}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedKpiDetails(null)} className={styles.closeBtn}>&times;</button>
              </div>

              <div className={styles.modalBody} style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción del Indicador</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5 }}>{selectedKpiDetails.desc}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#64748b' }}>¿Cómo se calcula?</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.4 }}>{selectedKpiDetails.origin}</p>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} /> Plan para Mejorar este Indicador
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#14532d', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.4 }}>
                    {selectedKpiDetails.actionPlan.map((step: string, sIdx: number) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.modalFooter} style={{ padding: '16px 32px' }}>
                <button onClick={() => setSelectedKpiDetails(null)} className={styles.primaryBtn} style={{ width: '100%' }}>
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
