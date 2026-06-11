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
  });

  const [wizardStep, setWizardStep] = React.useState(0);

  // Questionnaire answers (for backward compatibility if needed)
  const [answers, setAnswers] = React.useState<Record<string, any>>({
    q1: 3,
    q2: 4,
    q3: 3,
    q4: 3,
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

    const loadData = async () => {
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
            setAnswers(latest.answers);
          } else {
            setAnswers({ q1: 3, q2: 4, q3: 3, q4: 3 });
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
          setAnswers({ q1: 3, q2: 4, q3: 3, q4: 3 });
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
          averageQuality = 80; // Baseline default quality score when no scans have run
        }
      }

      const openIncidents = incidents.filter(i => i.status !== 'Cerrado' && i.status !== 'Resuelto').length;
      const resolvedIncidents = incidents.filter(i => i.status === 'Resuelto' || i.status === 'Cerrado').length;
      const totalIncidents = incidents.length;

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
      });

      // --- 1. Calidad: average quality score minus open incidents ---
      const calidad = Math.max(0, averageQuality - (openIncidents * 5));

      // --- 2. Organización: Data Owners + Data Stewards coverage ---
      const ownerRatio = totalAssets > 0 ? (assetsWithOwner / totalAssets) * 60 : 30;
      const stewardRatio = totalAssets > 0 ? (assetsWithSteward / totalAssets) * 40 : 20;
      const organizacion = Math.round(ownerRatio + stewardRatio);

      // --- 3. Seguridad: PII classified assets + active policies ---
      const classRatio = totalAssets > 0 ? (assetsClassified / totalAssets) * 60 : 30;
      const polRatio = totalPolicies > 0 ? (activePolicies / totalPolicies) * 40 : 20;
      const seguridad = Math.round(classRatio + polRatio);

      // --- 4. Arquitectura: Lineage mapping + Criticality definition ---
      const linRatio = totalAssets > 0 ? (assetsWithLineage / totalAssets) * 50 : 25;
      const critRatio = totalAssets > 0 ? (criticalAssets / totalAssets) * 50 : 25;
      const arquitectura = Math.round(linRatio + critRatio);

      // --- 5. Estrategia: approved workflows + committees & resolutions ---
      const wfRatio = totalWorkflows > 0 ? (approvedWorkflows / totalWorkflows) * 50 : 25;
      const commPoints = totalCommittees > 0 ? 30 : 0;
      const resPoints = totalResolutions > 0 ? 20 : 0;
      const estrategia = Math.round(wfRatio + commPoints + resPoints);

      // --- 6. Compliance: resolved incidents + active policies ---
      const incRatio = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 50 : 25;
      const compPolRatio = totalPolicies > 0 ? (activePolicies / totalPolicies) * 50 : 25;
      const compliance = Math.round(incRatio + compPolRatio);

      setMaturityScores({ estrategia, organizacion, calidad, arquitectura, seguridad, compliance });
      await setItem('maturity_scores', { estrategia, organizacion, calidad, arquitectura, seguridad, compliance });
    } catch (e) {
      console.error('Error fetching maturity metrics:', e);
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  React.useEffect(() => {
    fetchLiveMaturity();
  }, [fetchLiveMaturity]);

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
        { name: 'Visión de Gobierno', score: maturityScores.estrategia, type: 'auto' },
        { name: 'Políticas Definidas', score: Math.min(100, maturityScores.estrategia + 5), type: 'manual' },
        { name: 'Alineación Negocio',  score: Math.min(100, maturityScores.estrategia - 5), type: 'manual' },
      ],
    },
    {
      id: 'organizacion', name: 'Organización', score: maturityScores.organizacion, icon: Users,
      status: maturityScores.organizacion >= 80 ? 'Optimizado' : maturityScores.organizacion >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Roles y Resp.',         score: maturityScores.organizacion, type: 'auto' },
        { name: 'Data Owners',           score: Math.min(100, Math.round(maturityScores.organizacion * 0.9)), type: 'auto' },
        { name: 'Comité de Gobierno',    score: Math.min(100, Math.round(maturityScores.organizacion * 1.1)), type: 'manual' },
      ],
    },
    {
      id: 'calidad', name: 'Calidad', score: maturityScores.calidad, icon: TrendingUp,
      status: maturityScores.calidad >= 80 ? 'Optimizado' : maturityScores.calidad >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Reglas de Calidad',   score: maturityScores.calidad, type: 'auto' },
        { name: 'Monitoreo Auto.',     score: Math.min(100, Math.round(maturityScores.calidad * 0.8)), type: 'auto' },
        { name: 'Gestión Incidentes',  score: Math.min(100, Math.round(maturityScores.calidad * 0.95)), type: 'auto' },
      ],
    },
    {
      id: 'arquitectura', name: 'Arquitectura', score: maturityScores.arquitectura, icon: BarChart3,
      status: maturityScores.arquitectura >= 80 ? 'Optimizado' : maturityScores.arquitectura >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Modelado Datos', score: maturityScores.arquitectura, type: 'manual' },
        { name: 'Integración',    score: Math.min(100, Math.round(maturityScores.arquitectura * 0.9)), type: 'auto' },
        { name: 'Linaje Técnico', score: Math.min(100, Math.round(maturityScores.arquitectura * 1.05)), type: 'auto' },
      ],
    },
    {
      id: 'seguridad', name: 'Seguridad', score: maturityScores.seguridad, icon: Shield,
      status: maturityScores.seguridad >= 80 ? 'Optimizado' : maturityScores.seguridad >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Clasificación PII', score: maturityScores.seguridad, type: 'auto' },
        { name: 'Control Acceso',    score: Math.min(100, Math.round(maturityScores.seguridad * 0.92)), type: 'auto' },
        { name: 'Auditoría',         score: Math.min(100, Math.round(maturityScores.seguridad * 0.97)), type: 'manual' },
      ],
    },
    {
      id: 'compliance', name: 'Compliance', score: maturityScores.compliance, icon: FileCheck,
      status: maturityScores.compliance >= 80 ? 'Optimizado' : maturityScores.compliance >= 60 ? 'Gestionado' : 'Definido',
      capabilities: [
        { name: 'Marcos Normativos',  score: maturityScores.compliance, type: 'manual' },
        { name: 'Incidentes Resueltos', score: Math.min(100, Math.round(maturityScores.compliance * 0.95)), type: 'auto' },
        { name: 'Auditoría Continua', score: Math.min(100, Math.round(maturityScores.compliance * 0.85)), type: 'auto' },
      ],
    },
  ];

  const [isAssigningTask, setIsAssigningTask] = React.useState(false);

  const handleAssignWorkflowTask = async (dimensionName: string) => {
    if (!currentTenant?.id) return;
    setIsAssigningTask(true);
    try {
      const title = `[Madurez] Mejorar dimensión de ${dimensionName}`;
      const description = `Tarea estratégica recomendada desde el Centro de Madurez para solventar brechas identificadas en la dimensión de ${dimensionName}. Se requiere automatizar validaciones, asignar custodios de datos y documentar activos.`;
      
      const { data, error } = await supabase.from('workflow_requests').insert([{
        tenant_id: currentTenant.id,
        title,
        description,
        status: 'Pendiente',
        category: 'Gobernanza',
        priority: 'Media',
        sla: '72h',
        sla_status: 'Ok',
        current_step: 'Definición de Brecha de Madurez',
        timeline: [
          { step: 'Identificado en Auditoría de Madurez', user: 'Sistema de Madurez GMF', date: new Date().toISOString().split('T')[0], status: 'done' }
        ]
      }]).select();

      if (error) throw error;
      alert(`¡Tarea de mejora para la dimensión "${dimensionName}" asignada exitosamente al Workflow de Gobernanza!`);
    } catch (e: any) {
      console.error('Error assigning workflow task:', e);
      alert('Error al crear la solicitud en el workflow: ' + e.message);
    } finally {
      setIsAssigningTask(false);
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
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}><Target size={20} /><span>Nivel Actual</span></div>
          <div className={styles.kpiValue} style={{ color: levelColor }}>{loading ? '…' : maturityLevel}</div>
          <div className={styles.kpiSub}>Score global: {globalScore}%</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}><ArrowUpRight size={20} /><span>Benchmark Sector</span></div>
          <div className={styles.kpiValue}>+{Math.max(0, globalScore - 62)}%</div>
          <div className={styles.kpiSub}>Vs Sector Gubernamental (ref 62%)</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}><ShieldAlert size={20} /><span>Incidentes Abiertos</span></div>
          <div className={styles.kpiValue} style={{ color: dbStats.openIncidents > 5 ? '#ef4444' : '#f59e0b' }}>
            {loading ? '…' : dbStats.openIncidents}
          </div>
          <div className={styles.kpiSub}>Sin resolver en calidad</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}><CheckCircle2 size={20} /><span>Dimensiones</span></div>
          <div className={styles.kpiValue}>
            {loading ? '…' : `${dynamicDimensions.filter(d => d.score >= 60).length}/6`}
          </div>
          <div className={styles.kpiSub}>En nivel Gestionado o superior</div>
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
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Actual" dataKey="A" stroke={primaryColor} fill={primaryColor} fillOpacity={0.4} />
                  <Radar name="Industria" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
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
                    <div key={idx} className={styles.capItem}>
                      <div className={styles.capMain}>
                        <div className={styles.capInfo}>
                          <strong>{cap.name}</strong>
                          <span className={styles.capType}>{cap.type === 'auto' ? '⚡ Automatizada' : '👤 Manual'}</span>
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
                  <h3>🚀 Roadmap Recomendado</h3>
                  <div className={styles.roadmapAction}>
                    <div className={styles.actionIcon}><Zap size={14} /></div>
                    <div className={styles.actionContent}>
                      <strong>Automatizar validaciones de {selectedDim.name}</strong>
                      <span>Impacto esperado: +7% en score global</span>
                    </div>
                  </div>
                  <button 
                    className={styles.primaryBtn} 
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={() => handleAssignWorkflowTask(selectedDim.name)}
                    disabled={isAssigningTask}
                  >
                    {isAssigningTask ? 'Asignando...' : 'Asignar Tarea a Workflow'}
                  </button>
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
          <div className={styles.modalOverlay}>
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
          <div className={styles.modalOverlay}>
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
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Organización</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{maturityScores.organizacion}%</strong>
                      </div>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Arquitectura</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{maturityScores.arquitectura}%</strong>
                      </div>
                    </div>
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
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Calidad</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{maturityScores.calidad}%</strong>
                      </div>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Estrategia</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{maturityScores.estrategia}%</strong>
                      </div>
                    </div>
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
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Seguridad</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{maturityScores.seguridad}%</strong>
                      </div>
                      <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Compliance</span>
                        <strong style={{ fontSize: '1.2rem', color: '#15803d' }}>{maturityScores.compliance}%</strong>
                      </div>
                    </div>
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
    </div>
  );
}
