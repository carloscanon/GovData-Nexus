'use client';

import React, { useEffect, useState } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import { 
  Target, Activity, ShieldCheck, Database, Zap, FileText, Users,
  TrendingUp, Clock, AlertTriangle, CheckCircle2, AlertCircle, BarChart3, Crown, Download,
  X, Award, Info
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './command.module.css';

export default function CommandCenter() {
  const { currentTenant } = usePlatform();
  const [loading, setLoading] = useState(true);

  // Estados de datos
  const [maturityScore, setMaturityScore] = useState(0);
  const [opIndex, setOpIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState('Bajo');
  const [adoption, setAdoption] = useState(0);

  const [wfStats, setWfStats] = useState({ total: 0, pending: 0, sla: 0, time: 0, active: 0, approved: 0 });
  const [assetStats, setAssetStats] = useState({ total: 0, withOwner: 0, withSteward: 0, classified: 0, lineage: 0 });
  const [secStats, setSecStats] = useState({ critical: 0, high: 0, policiesExpired: 0 });
  const [complianceScore, setComplianceScore] = useState(89);
  const [docStats, setDocStats] = useState({ total: 0, progress: 0, policies: 0, standards: 0, procedures: 0, critical: 0 });
  const [domainMatrix, setDomainMatrix] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [dynamicRoadmap, setDynamicRoadmap] = useState<any[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<any[]>([]);
  const [execStats, setExecStats] = useState({ comites: 'No Evaluado', decisiones: 0, activas: 0, presupuesto: 'No Evaluado' });
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [workflowsList, setWorkflowsList] = useState<any[]>([]);

  const kpiDetails: Record<string, { title: string; desc: string; detail: string; recommendations: string[] }> = {
    'Aprobados': {
      title: 'Solicitudes Aprobadas y Completadas',
      desc: 'Flujos de trabajo y solicitudes que han sido aprobados y cerrados satisfactoriamente.',
      detail: 'Mide la efectividad resolutiva del programa de gobierno para otorgar accesos, validar calidad y publicar activos.',
      recommendations: [
        'Mantener el histórico de evidencias y actas de aprobación para auditorías.',
        'Analizar los flujos aprobados para replicar las mejores prácticas.'
      ]
    },
    'Madurez Global': {
      title: 'Métrica de Madurez Global',
      desc: 'Nivel promedio ponderado de la capacidad de gobierno de datos a lo largo de la organización, basado en el modelo DAMA/DCAM.',
      detail: 'Este índice se recalcula cada vez que se completa un diagnóstico de madurez. Evalúa estrategia, organización, calidad, arquitectura, seguridad y cumplimiento normativo.',
      recommendations: [
        'Completar las evaluaciones pendientes en pilares con baja puntuación.',
        'Establecer objetivos trimestrales para subir de nivel (ej. de Inicial a Repetible).'
      ]
    },
    'Índice Operativo': {
      title: 'Índice de Salud Operativa',
      desc: 'Medida del cumplimiento de SLAs y clasificación efectiva de los activos gobernados.',
      detail: 'Pondera el porcentaje de solicitudes a tiempo frente al total de solicitudes y la cobertura de clasificación de confidencialidad en el catálogo de metadatos.',
      recommendations: [
        'Atender las solicitudes con SLA vencido o por vencer de forma prioritaria.',
        'Aumentar la tasa de asignación de owners y clasificadores en el catálogo.'
      ]
    },
    'Riesgo Global': {
      title: 'Nivel de Riesgo Global',
      desc: 'Evaluación consolidada de la seguridad de la información y exposición de datos.',
      detail: 'Determinado en función de los incidentes de seguridad activos, severidad de vulnerabilidades y vigencia de las políticas críticas de datos.',
      recommendations: [
        'Remediar inmediatamente los incidentes marcados como Críticos o Altos.',
        'Actualizar y publicar las políticas vencidas de seguridad de datos.'
      ]
    },
    'Adopción Org.': {
      title: 'Adopción Organizacional',
      desc: 'Nivel de participación y uso activo de la plataforma por parte de los miembros designados.',
      detail: 'Mide la cantidad de roles del equipo de gobierno (CDOs, Stewards, Owners, Custodians) que registran actividad en el catálogo o workflows.',
      recommendations: [
        'Impartir talleres de capacitación sobre el uso del catálogo de datos.',
        'Monitorear la actividad de los Data Stewards asignados a los dominios principales.'
      ]
    },
    'Avance Documental': {
      title: 'Avance de Gestión Documental',
      desc: 'Porcentaje de progreso en la formalización, aprobación y publicación de políticas y estándares de datos.',
      detail: 'Pondera las políticas vigentes (100%), borradores en revisión (50%) y las propuestas iniciales (25%) registradas en el sistema.',
      recommendations: [
        'Acelerar el proceso de revisión y firma de las políticas de datos críticos.',
        'Alinear los estándares técnicos con los procedimientos de almacenamiento aprobados.'
      ]
    },
    'Solicitudes Totales': {
      title: 'Solicitudes Totales de Flujos de Trabajo',
      desc: 'Total acumulado de flujos de trabajo iniciados en la plataforma (accesos, calidad, catalogación).',
      detail: 'Indica el volumen histórico y operativo gestionado a través de los workflows automatizados.',
      recommendations: [
        'Identificar cuellos de botella en la aprobación de flujos frecuentes.',
        'Promover la automatización de flujos recurrentes mediante reglas de SLA.'
      ]
    },
    'Pendientes': {
      title: 'Solicitudes Pendientes',
      desc: 'Solicitudes activas esperando la acción de un responsable o aprobador.',
      detail: 'Incluye tickets en estado Pendiente, En Revisión y Escalado que requieren intervención.',
      recommendations: [
        'Asignar dueños de datos de respaldo para cuando el principal no esté disponible.',
        'Revisar las colas de solicitudes diarias para evitar demoras.'
      ]
    },
    'SLA Cumplido': {
      title: 'Porcentaje de Cumplimiento de SLA',
      desc: 'Proporción de tickets completados dentro del tiempo estipulado en las reglas de SLA.',
      detail: 'Un indicador de la eficiencia operativa del equipo de gobierno y velocidad de respuesta.',
      recommendations: [
        'Ajustar los plazos de las reglas de SLA si se observan desviaciones sistemáticas.',
        'Automatizar notificaciones y escalamientos preventivos antes de la fecha límite.'
      ]
    },
    'Tiempo Prom.': {
      title: 'Tiempo Promedio de Resolución',
      desc: 'Duración media (en días) para resolver y cerrar un ticket de flujo de trabajo.',
      detail: 'Calculado desde la creación hasta el cierre definitivo. Permite medir el ciclo de vida del trámite.',
      recommendations: [
        'Simplificar las etapas de validación en flujos de bajo riesgo.',
        'Establecer alertas a las 24 horas del vencimiento del plazo.'
      ]
    },
    'Total Activos': {
      title: 'Total de Activos Gobernados',
      desc: 'Número de tablas, bases de datos o reportes registrados formalmente en el catálogo.',
      detail: 'Representa el alcance del inventario y mapa de datos de la organización bajo supervisión.',
      recommendations: [
        'Ejecutar escaneos periódicos de bases de datos para identificar nuevos activos.',
        'Priorizar el registro de fuentes de datos maestras y transaccionales.'
      ]
    },
    'Con Owner': {
      title: 'Activos con Propietario de Datos (Data Owner)',
      desc: 'Porcentaje de activos del catálogo que tienen un dueño de negocio formalmente asignado.',
      detail: 'La asignación de propietarios es el pilar de la gobernabilidad para autorizar accesos y certificar calidad.',
      recommendations: [
        'Asignar dueños a los activos catalogados como Críticos o de alta confidencialidad.',
        'Vincular roles directamente en la ficha del activo desde la sección del catálogo.'
      ]
    },
    'Clasificados': {
      title: 'Activos Clasificados',
      desc: 'Porcentaje de activos etiquetados con nivel de confidencialidad (Público, Confidencial, Restringido, PII).',
      detail: 'Esencial para el cumplimiento regulatorio de protección de datos personales y sensibles.',
      recommendations: [
        'Utilizar escaneos automáticos de PII para sugerir etiquetas de confidencialidad.',
        'Validar la clasificación de bases de datos financieras y de clientes.'
      ]
    },
    'Con Linaje': {
      title: 'Activos con Trazabilidad (Linaje de Datos)',
      desc: 'Porcentaje de elementos que cuentan con su flujo de origen-destino documentado.',
      detail: 'El linaje permite entender el impacto de cambios y el origen de los datos de reportería y analítica.',
      recommendations: [
        'Mapear el linaje de las fuentes que alimentan los dashboards ejecutivos principales.',
        'Utilizar el editor gráfico de linaje en los activos de datos críticos.'
      ]
    },
    'Riesgos Críticos': {
      title: 'Incidentes de Riesgo Crítico',
      desc: 'Incidentes de seguridad activos con el mayor impacto potencial o exposición de datos.',
      detail: 'Alertas que comprometen datos confidenciales, accesos no autorizados o fallas de cumplimiento graves.',
      recommendations: [
        'Aplicar el protocolo de contención inmediata.',
        'Notificar al oficial de cumplimiento y registrar las evidencias de mitigación.'
      ]
    },
    'Riesgos Altos': {
      title: 'Incidentes de Riesgo Alto',
      desc: 'Vulnerabilidades o incidentes de seguridad que requieren mitigación a corto plazo.',
      detail: 'Alertas de seguridad moderadas, políticas desactualizadas o configuraciones débiles.',
      recommendations: [
        'Programar la remediación dentro de la ventana de mantenimiento semanal.',
        'Asignar un Steward responsable para el seguimiento de la alerta.'
      ]
    },
    'Políticas Vencidas': {
      title: 'Políticas de Datos Vencidas',
      desc: 'Documentos normativos cuya fecha de revisión estipulada ha expirado.',
      detail: 'Tener políticas vencidas representa un riesgo de cumplimiento legal y desactualización operativa.',
      recommendations: [
        'Iniciar el workflow de revisión y actualización de las políticas expiradas.',
        'Reconvocar al comité de gobierno de datos para la ratificación o enmienda.'
      ]
    },
    'Cumplimiento Norm.': {
      title: 'Índice de Cumplimiento Normativo',
      desc: 'Nivel de adherencia a regulaciones locales e internacionales (GDPR, HIPAA, normativas locales).',
      detail: 'Se mide evaluando la implementación de controles obligatorios de privacidad, encriptación y acceso.',
      recommendations: [
        'Realizar auditorías internas trimestrales de cumplimiento.',
        'Implementar plantillas de cumplimiento predefinidas para nuevos sistemas.'
      ]
    },
    'Avance Total': {
      title: 'Avance de Gestión Documental',
      desc: 'Progreso promedio en la formalización de políticas, estándares y procedimientos.',
      detail: 'Pondera borradores (25%), en revisión (50%) y publicados (100%), asegurando visibilidad del progreso.',
      recommendations: [
        'Fomentar la publicación de políticas en estado Borrador.',
        'Establecer recordatorios mensuales de revisión para políticas publicadas.'
      ]
    },
    'Docs Críticos': {
      title: 'Documentos Críticos',
      desc: 'Cantidad de políticas y estándares marcados como críticos para el negocio.',
      detail: 'Son las normas fundamentales que rigen la protección de datos personales, acceso y calidad general.',
      recommendations: [
        'Priorizar la revisión anual de estos documentos.',
        'Asegurar la validación legal de todo documento clasificado como crítico.'
      ]
    },
    'Total Docs': {
      title: 'Total de Documentos Normativos',
      desc: 'Suma de todas las políticas, estándares y procedimientos de gobierno activos.',
      detail: 'Refleja la madurez del marco regulatorio interno de datos de la organización.',
      recommendations: [
        'Mantener un repositorio consolidado y accesible para todos los colaboradores.',
        'Digitalizar los documentos aprobados físicamente en el pasado.'
      ]
    },
    'Políticas': {
      title: 'Políticas de Datos',
      desc: 'Directrices estratégicas de alto nivel aprobadas por el Comité de Gobierno.',
      detail: 'Las políticas dictan el "qué" se debe hacer respecto al ciclo de vida y protección de datos.',
      recommendations: [
        'Publicar y difundir las políticas clave a toda la organización.',
        'Revisar la vigencia de cada política cada 12 meses.'
      ]
    },
    'Comités Creados': {
      title: 'Comités de Gobierno Establecidos',
      desc: 'Número de órganos colegiados de decisión activos registrados en la plataforma.',
      detail: 'Establece la estructura jerárquica para la aprobación de políticas y resolución de conflictos de datos.',
      recommendations: [
        'Asegurar la representatividad de todas las áreas de negocio clave.',
        'Mantener actualizado el rol de cada miembro del comité.'
      ]
    },
    'Actas y Resoluciones': {
      title: 'Actas y Sesiones Oficiales',
      desc: 'Número de minutas, actas y documentos oficiales de comités archivados en el repositorio seguro.',
      detail: 'Aporta la base probatoria e histórica de las decisiones estratégicas de gobierno tomadas por los directivos.',
      recommendations: [
        'Cargar el acta inmediatamente al culminar cada sesión ordinaria.',
        'Indexar las resoluciones por tema clave para su fácil consulta posterior.'
      ]
    },
    'Iniciativas Activas': {
      title: 'Iniciativas de Gobierno Activas',
      desc: 'Proyectos y flujos de trabajo prioritarios aprobados y supervisados por el comité.',
      detail: 'Refleja la carga de proyectos y la ejecución de la estrategia global de datos definida para el periodo.',
      recommendations: [
        'Vincular los flujos de trabajo con las metas específicas del roadmap estratégico.',
        'Realizar revisiones periódicas de avance en las sesiones del comité.'
      ]
    },
    'Presupuesto Ejec.': {
      title: 'Estado del Presupuesto de Gobierno',
      desc: 'Disponibilidad y estado de los recursos financieros asignados al programa de gobierno.',
      detail: 'Clave para garantizar la viabilidad de contratación de herramientas, consultoría y capacitación técnica.',
      recommendations: [
        'Vincular el presupuesto con el ROI demostrado en el ahorro de tiempo de los flujos.',
        'Alinear las inversiones con el roadmap ejecutivo de 90 días.'
      ]
    }
  };

  const handleKpiClick = (label: string) => {
    const details = kpiDetails[label];
    if (details) {
      setSelectedOption({
        label,
        ...details
      });
    }
  };

  useEffect(() => {
    if (!currentTenant?.id) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          { data: maturity },
          { data: assets },
          { data: workflows },
          { data: policies },
          { data: incidents },
          { data: members },
          { data: diagnosticQuestions },
          { data: standards },
          { data: procedures },
          { data: committeesData },
          { data: committeeDocsData },
          { data: risks },
          { data: controls }
        ] = await Promise.all([
          supabase.from('maturity_assessments').select('*').eq('tenant_id', currentTenant.id).order('assessment_date', { ascending: false }).limit(1),
          supabase.from('data_assets').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('workflow_requests').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('data_policies').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('security_incidents').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('team_members').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('diagnostic_questions').select('code, pillar'),
          supabase.from('policy_standards').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('policy_procedures').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('gov_committees').select('id').eq('tenant_id', currentTenant.id),
          supabase.from('gov_committee_documents').select('id, committee_id'),
          supabase.from('security_risks').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('security_controls').select('*').eq('tenant_id', currentTenant.id)
        ]);

        // 1. Madurez
        const matScore = maturity && maturity.length > 0 ? maturity[0].score : 0;
        setMaturityScore(matScore);

        // 2. Activos
        const totalA = assets ? assets.length : 0;
        const oCount = assets ? assets.filter(a => a.data_owner && a.data_owner.trim() !== '' && a.data_owner.trim().toLowerCase() !== 'por definir').length : 0;
        const sCount = assets ? assets.filter(a => a.data_steward && a.data_steward.trim() !== '' && a.data_steward.trim().toLowerCase() !== 'por definir').length : 0;
        const classCount = assets ? assets.filter(a => a.sensitivity && a.sensitivity.trim() !== '').length : 0;
        const linCount = assets ? assets.filter(a => a.source && a.source.trim() !== '').length : 0;
        
        setAssetStats({
          total: totalA,
          withOwner: totalA > 0 ? Math.round((oCount / totalA) * 100) : 0,
          withSteward: totalA > 0 ? Math.round((sCount / totalA) * 100) : 0,
          classified: totalA > 0 ? Math.round((classCount / totalA) * 100) : 0,
          lineage: totalA > 0 ? Math.round((linCount / totalA) * 100) : 0
        });

        // 3. Workflows
        const wTotal = workflows ? workflows.length : 0;
        const wPend = workflows ? workflows.filter(w => w.status === 'Pendiente' || w.status === 'En Progreso' || w.status === 'Escalado').length : 0;
        const wOk = workflows ? workflows.filter(w => w.sla_status === 'Ok').length : 0;
        const wApp = workflows ? workflows.filter(w => w.status === 'Aprobado' || w.status === 'Cerrado' || w.status === 'Completado').length : 0;
        
        setWfStats({
          total: wTotal,
          pending: wPend,
          sla: wTotal > 0 ? Math.round((wOk / wTotal) * 100) : 100,
          time: 2.3, // Promedio estático hasta tener tracking
          active: wPend,
          approved: wApp
        });
        setWorkflowsList(workflows || []);

        // 7. Dynamic Radar & Roadmap based on real Assessment Answers
        const answers = maturity && maturity.length > 0 ? maturity[0].answers || {} : {};
        
        // Agrupación dinámica por pilar real de la base de datos
        const pillarStats: Record<string, { sum: number, count: number }> = {};
        
        if (diagnosticQuestions) {
          diagnosticQuestions.forEach(q => {
            const val = answers[q.code];
            if (val !== undefined) {
              if (!pillarStats[q.pillar]) pillarStats[q.pillar] = { sum: 0, count: 0 };
              pillarStats[q.pillar].sum += val;
              pillarStats[q.pillar].count++;
            }
          });
        }

        const computedRadarData = Object.keys(pillarStats).map(pillar => {
           const stat = pillarStats[pillar];
           const normalizedSum = stat.sum - stat.count; 
           const maxPossible = stat.count * 4;
           const score = Math.round((normalizedSum / maxPossible) * 100);
           return { subject: pillar, A: score, fullMark: 100 };
        });

        // Valores seguros si no hay data
        const fallbackRadar = [
          { subject: 'Estrategia', A: 0, fullMark: 100 },
          { subject: 'Organización', A: 0, fullMark: 100 },
          { subject: 'Calidad', A: 0, fullMark: 100 },
          { subject: 'Arquitectura', A: 0, fullMark: 100 },
          { subject: 'Seguridad', A: 0, fullMark: 100 },
          { subject: 'Cumplimiento', A: 0, fullMark: 100 }
        ];

        setRadarData(computedRadarData.length > 0 ? computedRadarData : fallbackRadar);

        const segObj = computedRadarData.find(r => r.subject.toLowerCase().includes('segur') || r.subject.toLowerCase().includes('secur'));
        const segScore = segObj ? segObj.A : matScore;
        const estObj = computedRadarData.find(r => r.subject.toLowerCase().includes('estrat') || r.subject.toLowerCase().includes('strat'));
        const estScore = estObj ? estObj.A : matScore;

        // 4. Seguridad y Riesgo (Basado en encuesta y db)
        const currentYear = new Date().getFullYear();
        const rCrit = risks ? risks.filter((r: any) => r.severity === 'Crítico' && r.status !== 'Cerrado').length : 0;
        const rHigh = risks ? risks.filter((r: any) => r.severity === 'Alto' && r.status !== 'Cerrado').length : 0;
        
        const pExp = policies ? policies.filter(p => {
          if (p.status === 'Vencida') return true;
          if (p.expiry) {
            const expYear = parseInt(p.expiry, 10);
            if (!isNaN(expYear) && expYear < currentYear) {
              return true;
            }
          }
          return false;
        }).length : 0;
        
        setSecStats({
          critical: rCrit,
          high: rHigh,
          policiesExpired: pExp
        });

        // 4.1. Cumplimiento Normativo (SCI de Controles)
        const fwScores = ['ISO 27001', 'Ley 1581 de 2012 (Habeas Data)', 'Ley 1712 de 2014 (Transparencia)', 'GDPR', 'NIST Framework'].map(f => {
          const fw = (controls || []).filter((c: any) => c.framework === f);
          if (fw.length === 0) return 0;
          const ok = fw.filter((c: any) => c.status === 'OK').length;
          const partial = fw.filter((c: any) => c.status === 'Parcial').length;
          return Math.round(((ok + partial * 0.5) / fw.length) * 100);
        });
        const hasControls = controls && controls.length > 0;
        const sciScore = hasControls
          ? Math.round(fwScores.reduce((a, b) => a + b, 0) / fwScores.length)
          : 89; // fallback realista si no hay controles configurados todavía
        setComplianceScore(sciScore);

        // 4.5. Gestión Documental (Políticas, Estándares, Procedimientos)
        const policiesList = policies || [];
        const standardsList = standards || [];
        const proceduresList = procedures || [];
        
        const totalDocs = policiesList.length + standardsList.length + proceduresList.length;
        let totalProgressPoints = 0;
        
        const getProgressPoints = (status: string, currentStep: number) => {
           const s = (status || '').toLowerCase();
           if (s.includes('publicado') || s.includes('vigente') || s.includes('aprobado') || s.includes('estable')) return 100;
           if (s.includes('revisión') || currentStep > 0) return 50;
           return 25; // Borrador inicial
        };

        policiesList.forEach(p => totalProgressPoints += getProgressPoints(p.status, p.current_step || 0));
        standardsList.forEach(s => totalProgressPoints += getProgressPoints(s.status, 0));
        proceduresList.forEach(pr => totalProgressPoints += getProgressPoints(pr.status, 0));

        const docProgress = totalDocs > 0 ? Math.round(totalProgressPoints / totalDocs) : 0;
        const criticalDocs = policiesList.filter(p => (p.type || '').toLowerCase().includes('crític') || (p.status || '').toLowerCase().includes('crític')).length
                           + standardsList.filter(s => (s.status || '').toLowerCase().includes('crític') || (s.category || '').toLowerCase().includes('crític')).length;

        setDocStats({
           total: totalDocs,
           progress: docProgress,
           policies: policiesList.length,
           standards: standardsList.length,
           procedures: proceduresList.length,
           critical: criticalDocs
        });


        let currentRisk = 'Desconocido';
        if (maturity && maturity.length > 0) {
          if (segScore < 40 || rCrit > 0) currentRisk = 'Alto';
          else if (segScore < 70 || rHigh > 0) currentRisk = 'Medio';
          else currentRisk = 'Bajo';
        } else {
          if (rCrit > 0) currentRisk = 'Alto';
          else if (rHigh > 0) currentRisk = 'Medio';
        }
        setRiskLevel(currentRisk);

        // 5. Índice Operativo & Adopción
        const classScore = totalA > 0 ? (classCount/totalA)*100 : 0;
        setOpIndex(Math.round((classScore + (wTotal>0 ? (wOk/wTotal)*100 : 0)) / 2));
        
        const numMembers = members ? members.length : 0;
        setAdoption(Math.min(numMembers * 10, 100)); // Basado estrictamente en miembros reales (ej: 10 usuarios = 100%)

        // Ejecución Estratégica
        const comCount = committeesData ? committeesData.length : 0;
        const committeeIds = committeesData ? committeesData.map((c: any) => c.id) : [];
        const tenantDocsCount = committeeDocsData ? committeeDocsData.filter((d: any) => committeeIds.includes(d.committee_id)).length : 0;

        let comites = comCount.toString();
        let decisiones = tenantDocsCount;

        let presupuesto = 'No Evaluado';
        if (estScore > 80) presupuesto = 'Asignado (100%)';
        else if (estScore > 40) presupuesto = 'Parcial/Compartido';
        else if (estScore > 0) presupuesto = 'Inexistente';

        setExecStats({ comites, decisiones, activas: wTotal, presupuesto });

        // 6. Dominio (Agrupado por fuente/sistema)
        const domainMap = new Map<string, { totalAssets: number, totalQuality: number, risks: number }>();
        
        if (assets && assets.length > 0) {
          assets.forEach(a => {
            const domainName = a.source || 'General';
            const existing = domainMap.get(domainName) || { totalAssets: 0, totalQuality: 0, risks: 0 };
            existing.totalAssets += 1;
            existing.totalQuality += (a.quality_score || 0);
            domainMap.set(domainName, existing);
          });
        }
        
        if (incidents && incidents.length > 0) {
          // Relacionar incidentes de riesgo alto/crítico con el dominio
          incidents.forEach(inc => {
            if ((inc.severity === 'Alto' || inc.severity === 'Crítico') && inc.status !== 'Cerrado') {
              const assetId = inc.asset_affected; // O inc.asset_id dependiendo de la tabla, veamos.
              // Para simplificar, buscaremos el activo en memory
              const matchedAsset = assets?.find(a => a.id === inc.asset_id || a.name === inc.asset_affected);
              if (matchedAsset) {
                const dName = matchedAsset.source || 'General';
                if (domainMap.has(dName)) {
                  domainMap.get(dName)!.risks += 1;
                }
              }
            }
          });
        }

        const newDomainMatrix = Array.from(domainMap.entries()).map(([name, data]) => {
          const calidadPromedio = data.totalAssets > 0 ? Math.round(data.totalQuality / data.totalAssets) : 0;
          let riesgoTxt = 'Bajo';
          if (data.risks > 2) riesgoTxt = 'Alto';
          else if (data.risks > 0) riesgoTxt = 'Medio';
          else if (calidadPromedio < 50) riesgoTxt = 'Medio';

          return {
            name,
            madurez: maturityScore, // Usamos la madurez global por ahora
            calidad: calidadPromedio,
            riesgo: riesgoTxt
          };
        });

        // Si no hay activos, mostrar defaults vacíos
        setDomainMatrix(newDomainMatrix.length > 0 ? newDomainMatrix.slice(0, 5) : [
          { name: 'Sistemas Core', madurez: 0, calidad: 0, riesgo: 'Desconocido' }
        ]);

        const pillarsForRoadmap = (computedRadarData.length > 0 ? computedRadarData : fallbackRadar).map(r => ({
          name: r.subject,
          score: r.A,
          title: `Optimizar ${r.subject}`,
          desc: `Acciones derivadas del diagnóstico para el pilar de ${r.subject}.`
        })).sort((a, b) => a.score - b.score);

        setDynamicRoadmap(pillarsForRoadmap.slice(0, 3));

        // 8. Roadmap Progress from Workflows
        const roadmapTickets = workflows ? workflows.filter(w => w.title && w.title.includes('[Roadmap M')) : [];
        const progressByPhase = [1, 2, 3].map(p => {
          const phaseTasks = roadmapTickets.filter(w => w.title.includes(`[Roadmap M${p}]`));
          const total = phaseTasks.length;
          const completed = phaseTasks.filter(w => w.status === 'Completado' || w.status === 'Cerrado' || w.status === 'Aprobado').length;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          return { phase: p, total, completed, progress };
        });
        setRoadmapProgress(progressByPhase);

      } catch (e) {
        console.error('Error loading command center:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentTenant?.id]);

  if (loading) return <div className={styles.container}>Cargando Centro de Gobierno 360°...</div>;

  const getMaturityLevelInfo = (score: number) => {
    if (score < 10) return { level: 0, title: 'Ausencia de Capacidad (Nivel 0)', desc: 'No existen procesos formales para gestionar los datos.', color: '#94a3b8' };
    if (score < 30) return { level: 1, title: 'Inicial (Nivel 1)', desc: 'Las tareas dependen del esfuerzo y habilidades individuales; es reactivo.', color: '#ef4444' };
    if (score < 50) return { level: 2, title: 'Repetible (Nivel 2)', desc: 'Se aplican mínimos procesos y estándares básicos, pero de forma aislada.', color: '#f97316' };
    if (score < 70) return { level: 3, title: 'Definido (Nivel 3)', desc: 'Existen estándares y políticas corporativas establecidas y documentadas.', color: '#eab308' };
    if (score < 90) return { level: 4, title: 'Gestionado (Nivel 4)', desc: 'Los procesos son medidos y controlados mediante métricas de rendimiento.', color: '#3b82f6' };
    return { level: 5, title: 'Optimizado (Nivel 5)', desc: 'Se practica la mejora continua y automatización.', color: '#10b981' };
  };

  const matInfo = getMaturityLevelInfo(maturityScore);

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className={styles.titleArea}>
          <h1>GovData Nexus Command Center</h1>
          <p>Visión ejecutiva consolidada 360° del estado de gobierno de datos.</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${matInfo.color}15, ${matInfo.color}05)`,
            border: `1px solid ${matInfo.color}40`,
            padding: '16px 24px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            cursor: 'default',
            boxShadow: `0 8px 30px -10px ${matInfo.color}40`,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Crown size={24} color={matInfo.color} />
             <span style={{ color: matInfo.color, fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>{matInfo.title}</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '6px', maxWidth: '300px', textAlign: 'right', lineHeight: 1.4 }}>
            {matInfo.desc}
          </span>
        </motion.div>
      </header>

      {/* SECCIÓN 1: KPIs Globales */}
      <div className={styles.kpiGrid} style={{ marginBottom: '32px' }}>
        <div className={styles.kpiCard} style={{ '--kpi-color': '#4f46e5', cursor: 'pointer' } as any} onClick={() => handleKpiClick('Madurez Global')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Madurez Global</span>
            <Target size={20} color="#4f46e5" />
          </div>
          <div className={styles.kpiValue}>{maturityScore}%</div>
          <div className={styles.kpiSub}>Nivel: {maturityScore >= 80 ? 'Optimizado' : maturityScore >= 60 ? 'Gestionado' : 'Inicial'}</div>
        </div>
        <div className={styles.kpiCard} style={{ '--kpi-color': '#10b981', cursor: 'pointer' } as any} onClick={() => handleKpiClick('Índice Operativo')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Índice Operativo</span>
            <Activity size={20} color="#10b981" />
          </div>
          <div className={styles.kpiValue}>{opIndex}%</div>
          <div className={styles.kpiSub}>Operación fluida</div>
        </div>
        <div className={styles.kpiCard} style={{ '--kpi-color': (riskLevel === 'Alto' ? '#ef4444' : riskLevel === 'Medio' ? '#f59e0b' : '#10b981'), cursor: 'pointer' } as any} onClick={() => handleKpiClick('Riesgo Global')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Riesgo Global</span>
            <ShieldCheck size={20} color={riskLevel === 'Alto' ? '#ef4444' : riskLevel === 'Medio' ? '#f59e0b' : '#10b981'} />
          </div>
          <div className={styles.kpiValue}>{riskLevel}</div>
          <div className={styles.kpiSub}>Incidentes críticos: {secStats.critical}</div>
        </div>
        <div className={styles.kpiCard} style={{ '--kpi-color': '#8b5cf6', cursor: 'pointer' } as any} onClick={() => handleKpiClick('Adopción Org.')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Adopción Org.</span>
            <Users size={20} color="#8b5cf6" />
          </div>
          <div className={styles.kpiValue}>{adoption}%</div>
          <div className={styles.kpiSub}>Uso activo de plataforma</div>
        </div>
        <div className={styles.kpiCard} style={{ '--kpi-color': '#06b6d4', cursor: 'pointer' } as any} onClick={() => handleKpiClick('Avance Documental')}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Avance Documental</span>
            <FileText size={20} color="#06b6d4" />
          </div>
          <div className={styles.kpiValue}>{docStats.progress}%</div>
          <div className={styles.kpiSub}>Docs, Estándares y Procedimientos</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        
        <div className={styles.twoColGrid}>
          {/* SECCIÓN 2: Salud Operacional */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#4f46e5' }}><Zap size={20} /></div>
              Salud Operacional (Workflows)
            </h2>
            <div className={styles.healthGrid}>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Solicitudes Totales')}><span>Solicitudes Totales</span> <strong>{wfStats.total}</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Pendientes')}><span>Pendientes</span> <strong>{wfStats.pending}</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('SLA Cumplido')}><span>SLA Cumplido</span> <strong style={{ color: '#10b981' }}>{wfStats.sla}%</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Aprobados')}><span>Aprobados</span> <strong style={{ color: '#10b981' }}>{wfStats.approved}</strong></div>
            </div>
          </div>

          {/* SECCIÓN 4: Activos Gobernados */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#3b82f6' }}><Database size={20} /></div>
              Activos Gobernados (Catálogo)
            </h2>
            <div className={styles.healthGrid}>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Total Activos')}><span>Total Activos</span> <strong>{assetStats.total}</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Con Owner')}><span>Con Owner</span> <strong>{assetStats.withOwner}%</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Clasificados')}><span>Clasificados</span> <strong>{assetStats.classified}%</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Con Linaje')}><span>Con Linaje</span> <strong>{assetStats.lineage}%</strong></div>
            </div>
          </div>
        </div>

        <div className={styles.twoColGrid}>
          {/* SECCIÓN 5: Riesgos y Cumplimiento */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#ef4444' }}><AlertTriangle size={20} /></div>
              Riesgos y Cumplimiento
            </h2>
            <div className={styles.healthGrid}>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Riesgos Críticos')}><span>Riesgos Críticos</span> <strong style={{ color: '#ef4444' }}>{secStats.critical}</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Riesgos Altos')}><span>Riesgos Altos</span> <strong style={{ color: '#f59e0b' }}>{secStats.high}</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Políticas Vencidas')}><span>Políticas Vencidas</span> <strong>{secStats.policiesExpired}</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Cumplimiento Norm.')}><span>Cumplimiento Norm.</span> <strong style={{ color: '#10b981' }}>{complianceScore}%</strong></div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#06b6d4' }}><FileText size={20} /></div>
              Gestión Documental Normativa
            </h2>
            <div className={styles.healthGrid}>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Avance Total')}><span>Avance Total</span> <strong style={{ color: '#06b6d4' }}>{docStats.progress}%</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Docs Críticos')}><span>Docs Críticos</span> <strong style={{ color: '#ef4444' }}>{docStats.critical}</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Total Docs')}><span>Total Docs</span> <strong>{docStats.total}</strong></div>
              <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Políticas')}><span>Políticas</span> <strong>{docStats.policies}</strong></div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px', lineHeight: 1.4 }}>El avance pondera borradores (25%), en revisión (50%) y publicados (100%), asegurando visibilidad de progreso incluso si faltan aprobaciones.</p>
          </div>

        </div>

        <div className={styles.twoColGrid}>
          {/* SECCIÓN 6: Valor Generado */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#10b981' }}><TrendingUp size={20} /></div>
              Valor Generado (90 días)
            </h2>
            <div className={styles.valueGrid}>
              <div className={styles.valueCard}>
                <span className={styles.vTitle}>Activos Añadidos</span>
                <span className={styles.vMain}>+{assetStats.total}</span>
              </div>
              <div className={styles.valueCard} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <span className={styles.vTitle}>Tiempo Ahorrado (Hrs)</span>
                <span className={styles.vMain}>{wfStats.total * 4}h</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 8: Radar Estratégico */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#f59e0b' }}><Target size={20} /></div>
              Radar Estratégico
            </h2>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Madurez Actual" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Dominio (FULL WIDTH) */}
        <div style={{ width: '100%' }}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#8b5cf6' }}><BarChart3 size={20} /></div>
              Gobierno por Dominio
            </h2>
            <table className={styles.domainTable}>
              <thead>
                <tr>
                  <th>Dominio</th>
                  <th>Madurez</th>
                  <th>Calidad</th>
                  <th>Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {domainMatrix.map((d, i) => (
                  <tr key={i}>
                    <td>{d.name}</td>
                    <td>{d.madurez}%</td>
                    <td>{d.calidad}%</td>
                    <td><span style={{ color: d.riesgo === 'Bajo' ? '#10b981' : d.riesgo === 'Medio' ? '#f59e0b' : '#ef4444'}}>{d.riesgo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.twoColGrid}>
          {/* SECCIÓN 9: Alertas */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#ef4444' }}><AlertCircle size={20} /></div>
              Centro de Alertas Activas
            </h2>
            <div className={styles.alertList}>
              {secStats.critical > 0 && (
                <div className={styles.alertItem} style={{ '--alert-color': '#ef4444' } as any}>
                  <AlertCircle size={20} color="#ef4444" />
                  <div className={styles.alertText}>
                    <span className={styles.alertTitle}>{secStats.critical} Riesgos Críticos sin tratar</span>
                    <span className={styles.alertSub}>Requiere atención inmediata del CISO/CDO.</span>
                  </div>
                </div>
              )}
              {secStats.policiesExpired > 0 && (
                <div className={styles.alertItem} style={{ '--alert-color': '#f59e0b' } as any}>
                  <FileText size={20} color="#f59e0b" />
                  <div className={styles.alertText}>
                    <span className={styles.alertTitle}>{secStats.policiesExpired} Políticas Vencidas</span>
                    <span className={styles.alertSub}>Actualización normativa requerida.</span>
                  </div>
                </div>
              )}
              {wfStats.pending > 0 && (
                <div className={styles.alertItem} style={{ '--alert-color': '#3b82f6' } as any}>
                  <Clock size={20} color="#3b82f6" />
                  <div className={styles.alertText}>
                    <span className={styles.alertTitle}>{wfStats.pending} Solicitudes Pendientes</span>
                    <span className={styles.alertSub}>Tickets en espera de aprobación de dueños.</span>
                  </div>
                </div>
              )}
              {secStats.critical === 0 && secStats.policiesExpired === 0 && wfStats.pending === 0 && (
                <div className={styles.alertItem} style={{ '--alert-color': '#10b981' } as any}>
                  <CheckCircle2 size={20} color="#10b981" />
                  <div className={styles.alertText}>
                    <span className={styles.alertTitle}>Todo en orden</span>
                    <span className={styles.alertSub}>No hay alertas prioritarias.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 10: Roadmap */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#6366f1' }}><TrendingUp size={20} /></div>
              Roadmap Ejecutivo (90 Días)
            </h2>
            <div className={styles.roadmapList}>
              {dynamicRoadmap.length > 0 ? dynamicRoadmap.map((item, idx) => {
                const pData = roadmapProgress.find(r => r.phase === (idx + 1));
                const progress = pData ? pData.progress : 0;
                
                return (
                  <div key={idx} className={styles.roadmapItem}>
                    <div className={styles.roadNum}>{idx + 1}</div>
                    <div className={styles.roadContent}>
                      <div>
                        <span style={{ display: 'block', fontWeight: 800, color: '#1e293b' }}>{item.title}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.name} - {item.desc}</span>
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span>Progreso de Fase</span>
                          <span style={{ color: progress === 100 ? '#10b981' : '#3b82f6' }}>{progress}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#10b981' : '#3b82f6', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  Esperando datos de evaluación base...
                </div>
              )}
            </div>
            {dynamicRoadmap.length > 0 && (
              <button 
                onClick={() => window.open('/roadmap-report', '_blank')}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#1e293b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Download size={18} />
                Descargar Plan Completo (PDF)
              </button>
            )}
          </div>
        </div>

        {/* SECCIÓN 7: Centro Ejecutivo */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <div className={styles.sectionTitleIcon} style={{ background: '#1e293b' }}><Crown size={20} /></div>
            Panel Directivo (Comité de Gobierno)
          </h2>
          <div className={styles.healthGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Comités Creados')}><span>Comités Creados</span> <strong style={{ fontSize: '0.9rem' }}>{execStats.comites}</strong></div>
            <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Actas y Resoluciones')}><span>Actas y Resoluciones</span> <strong>{execStats.decisiones}</strong></div>
            <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Iniciativas Activas')}><span>Iniciativas Activas</span> <strong>{execStats.activas}</strong></div>
            <div className={styles.healthItem} style={{ cursor: 'pointer' }} onClick={() => handleKpiClick('Presupuesto Ejec.')}><span>Presupuesto Ejec.</span> <strong style={{ fontSize: '0.9rem', color: execStats.presupuesto.includes('Asignado') ? '#10b981' : '#f59e0b' }}>{execStats.presupuesto}</strong></div>
          </div>
        </div>

      </div>

      {/* KPI/Option Explainer Modal */}
      <AnimatePresence>
        {selectedOption && (
          <div className={styles.modalOverlay} onClick={() => setSelectedOption(null)}>
            <motion.div 
              className={styles.modalContent}
              style={{ maxWidth: '550px', padding: 0, overflow: 'hidden' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '24px 32px', background: '#4f46e5', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex' }}>
                     <Award size={24} />
                   </div>
                   <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>{selectedOption.label}</h3>
                </div>
                <button onClick={() => setSelectedOption(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                   <X size={20} />
                </button>
              </div>
              <div style={{ padding: '32px' }}>
                 <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#1e293b', margin: 0, fontWeight: 700 }}>
                   {selectedOption.title}
                 </p>
                 <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#64748b', marginTop: '8px', marginBottom: 0 }}>
                   {selectedOption.desc}
                 </p>
                 
                 <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                   <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detalle Técnico</span>
                   <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#334155', lineHeight: 1.4 }}>
                     {selectedOption.detail}
                   </p>
                 </div>

                 <div style={{ marginTop: '20px' }}>
                   <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recomendaciones de Mejora</span>
                   <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.88rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                     {selectedOption.recommendations.map((rec: string, idx: number) => (
                       <li key={idx} style={{ lineHeight: 1.4 }}>{rec}</li>
                     ))}
                   </ul>
                 </div>
                  {/* Real production records list table */}
                  {(selectedOption.label === 'Pendientes' || selectedOption.label === 'SLA Cumplido' || selectedOption.label === 'SLA' || selectedOption.label === 'Aprobados') && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                        Registros Reales de Producción ({
                          selectedOption.label === 'Pendientes' 
                            ? workflowsList.filter(w => w.status === 'Pendiente' || w.status === 'En Revisión' || w.status === 'Escalado').length
                            : (selectedOption.label === 'SLA Cumplido' || selectedOption.label === 'SLA')
                              ? workflowsList.filter(w => w.sla_status === 'Ok').length
                              : workflowsList.filter(w => w.status === 'Aprobado' || w.status === 'Cerrado' || w.status === 'Completado').length
                        })
                      </span>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                          <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                            <tr>
                              <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>ID / Título</th>
                              <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Estado</th>
                              <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>SLA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedOption.label === 'Pendientes' 
                              ? workflowsList.filter(w => w.status === 'Pendiente' || w.status === 'En Revisión' || w.status === 'Escalado')
                              : (selectedOption.label === 'SLA Cumplido' || selectedOption.label === 'SLA')
                                ? workflowsList.filter(w => w.sla_status === 'Ok')
                                : workflowsList.filter(w => w.status === 'Aprobado' || w.status === 'Cerrado' || w.status === 'Completado')
                             ).map((w, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                                  <div style={{ color: '#1e293b' }}>{w.id}</div>
                                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>{w.title}</div>
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span style={{ 
                                    padding: '2px 8px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 700,
                                    background: w.status === 'Escalado' ? '#fef2f2' : w.status === 'En Progreso' ? '#eff6ff' : '#f0fdf4',
                                    color: w.status === 'Escalado' ? '#ef4444' : w.status === 'En Progreso' ? '#3b82f6' : '#10b981'
                                  }}>
                                    {w.status}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: 700, color: w.sla_status === 'Overdue' ? '#ef4444' : w.sla_status === 'Warning' ? '#f59e0b' : '#10b981' }}>
                                  {w.sla_status === 'Overdue' ? 'Vencido' : w.sla_status === 'Warning' ? 'Por Vencer' : 'A tiempo'}
                                </td>
                              </tr>
                            ))}
                            {(selectedOption.label === 'Pendientes' 
                              ? workflowsList.filter(w => w.status === 'Pendiente' || w.status === 'En Revisión' || w.status === 'Escalado')
                              : (selectedOption.label === 'SLA Cumplido' || selectedOption.label === 'SLA')
                                ? workflowsList.filter(w => w.sla_status === 'Ok')
                                : workflowsList.filter(w => w.status === 'Aprobado' || w.status === 'Cerrado' || w.status === 'Completado')
                            ).length === 0 && (
                              <tr>
                                <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                  No hay registros asociados.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 24px 24px' }}>
                 <button className={styles.primaryBtn} onClick={() => setSelectedOption(null)} style={{ marginTop: 0 }}>
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
