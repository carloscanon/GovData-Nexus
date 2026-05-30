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

  // Real DB counters
  const [dbStats, setDbStats] = React.useState({
    totalAssets: 0,
    openIncidents: 0,
    approvedWorkflows: 0,
  });

  // Questionnaire answers (manual hybrid inputs)
  const [answers, setAnswers] = React.useState<Record<string, number>>({
    q1: 3, // formal committee (1-5)
    q2: 4, // data owners training (1-5)
    q3: 3, // strategy alignment (1-5)
    q4: 3, // compliance frameworks (1-5)
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
            const dateObj = new Date(row.assessment_date);
            const monthName = dateObj.toLocaleString('es-ES', { month: 'short' });
            return {
              name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
              score: Number(row.score),
              benchmark: 62 // Static benchmark for UI
            };
          });
          setEvolutionData(history);
        } else {
          setAnswers({ q1: 3, q2: 4, q3: 3, q4: 3 });
          setEvolutionData([]);
        }
      } catch (e: any) {
        console.error('Error fetching maturity data:', e);
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
      ] = await Promise.all([
        supabase
          .from('data_assets')
          .select('id, quality_score, data_owner, sensitivity, criticality')
          .eq('tenant_id', currentTenant.id),
        supabase
          .from('workflows')
          .select('id, status, data_assets!inner(tenant_id)')
          .eq('data_assets.tenant_id', currentTenant.id),
        supabase
          .from('quality_incidents')
          .select('id, severity, status, data_assets!inner(tenant_id)')
          .eq('data_assets.tenant_id', currentTenant.id),
      ]);

      const assets = assetsData ?? [];
      const workflows = workflowsData ?? [];
      const incidents = incidentsData ?? [];

      setDbStats({
        totalAssets: assets.length,
        openIncidents: incidents.filter(i => i.status !== 'Resuelto').length,
        approvedWorkflows: workflows.filter(w => w.status === 'Aprobado').length,
      });

      // --- Calidad: exact global health from incidents ---
      let calidad = 65;
      if (incidents.length > 0) {
        let totalRecords = 0;
        let totalAffected = 0;
        incidents.forEach((inc: any) => {
          totalRecords += (inc.total_records || 0);
          totalAffected += (inc.affected_records || 0);
        });
        if (totalRecords > 0) {
          calidad = Math.round(((totalRecords - totalAffected) / totalRecords) * 100);
        }
      }

      // --- Organización: % assets with data_owner + questionnaire ---
      let orgDB = 50;
      if (assets.length > 0) {
        const owned = assets.filter(a => !!a.data_owner).length;
        orgDB = Math.max(30, Math.round((owned / assets.length) * 100));
      }
      const organizacion = Math.min(100, Math.round(
        (orgDB * 0.4) + ((answers.q1 || 3) * 10) + ((answers.q2 || 4) * 8)
      ));

      // --- Seguridad: PII classified + sensitivity coverage ---
      let seguridad = 60;
      if (assets.length > 0) {
        const classified = assets.filter(a => a.sensitivity && a.sensitivity !== 'Público').length;
        seguridad = Math.min(100, Math.round((classified / assets.length) * 80 + 20));
      }

      // --- Arquitectura: criticality coverage ---
      let arquitectura = 55;
      if (assets.length > 0) {
        const critical = assets.filter(a => a.criticality === 'Alta' || a.criticality === 'Crítica').length;
        arquitectura = Math.min(100, Math.round((critical / assets.length) * 70 + 30));
      }

      // --- Estrategia: approved workflows + questionnaire ---
      const approved = workflows.filter(w => w.status === 'Aprobado').length;
      const estrategia = Math.min(100, Math.round(60 + (approved * 4) + ((answers.q3 || 3) * 6)));

      // --- Compliance: incidents resolved + questionnaire ---
      const resolved = incidents.filter(i => i.status === 'Resuelto').length;
      const totalInc = incidents.length || 1;
      const compliance = Math.min(100, Math.round(
        ((resolved / totalInc) * 60) + ((answers.q4 || 3) * 8)
      ));

      setMaturityScores({ estrategia, organizacion, calidad, arquitectura, seguridad, compliance });
      await setItem('maturity_scores', { estrategia, organizacion, calidad, arquitectura, seguridad, compliance });
    } catch (e) {
      console.error('Error fetching maturity metrics:', e);
    } finally {
      setLoading(false);
    }
  }, [currentTenant, answers]);

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
        answers: answers,
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
                  <div className={styles.findingItem}>
                    <div className={styles.riskLevel} data-level={selectedDim.score < 60 ? 'high' : 'medium'} />
                    <p>Falta de automatización en el monitoreo de {selectedDim.name.toLowerCase()}.</p>
                  </div>
                  <div className={styles.findingItem}>
                    <div className={styles.riskLevel} data-level="medium" />
                    <p>Documentación de procesos desactualizada (última revisión hace 6 meses).</p>
                  </div>
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
                  <button className={styles.primaryBtn} style={{ width: '100%', marginTop: '16px' }}>
                    Asignar Tarea a Workflow
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
          <div className={styles.timelineItem}>
            <div className={styles.timeLabel}>Mes 1</div>
            <div className={styles.timeContent}>
              <strong>Fase: Cimentación</strong>
              <p>Asignar Stewards en Finanzas y Ventas. Automatizar reglas críticas de calidad.</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timeLabel}>Mes 2</div>
            <div className={styles.timeContent}>
              <strong>Fase: Operación</strong>
              <p>Configurar SLAs en Workflows. Integrar logs de auditoría automáticos.</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timeLabel}>Mes 3</div>
            <div className={styles.timeContent}>
              <strong>Fase: Optimización</strong>
              <p>Desplegar enmascaramiento dinámico. Activar portal de autoservicio.</p>
            </div>
          </div>
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
            >
              <div className={styles.modalHeader}>
                <div>
                  <h2>Nueva Evaluación de Madurez</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Score actual: <strong style={{ color: levelColor }}>{globalScore}%</strong> · {maturityLevel}
                  </p>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsAssessmentModalOpen(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.questionnaire}>
                  <h3>Evaluación Híbrida Manual (GMF)</h3>

                  {[
                    { key: 'q1', label: '1. Comité de Gobierno formal constituido', lo: 'No existe (1)', mid: 'En proceso (3)', hi: 'Activo & Formal (5)' },
                    { key: 'q2', label: '2. Capacitación de Data Owners', lo: 'No entrenados (1)', mid: 'Parcial (3)', hi: 'Totalmente (5)' },
                    { key: 'q3', label: '3. Estrategia alineada con Objetivos', lo: 'Desalineada (1)', mid: 'Parcial (3)', hi: 'Integrada (5)' },
                    { key: 'q4', label: '4. Marcos de Compliance activos', lo: 'Sin marcos (1)', mid: 'En adopción (3)', hi: 'Certificados (5)' },
                  ].map(q => (
                    <div key={q.key} className={styles.question} style={{ marginBottom: '20px' }}>
                      <p><strong>{q.label}:</strong> (Actual: {answers[q.key]} / 5)</p>
                      <input
                        type="range" min="1" max="5"
                        value={answers[q.key]}
                        onChange={(e) => setAnswers({ ...answers, [q.key]: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: primaryColor }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                        <span>{q.lo}</span><span>{q.mid}</span><span>{q.hi}</span>
                      </div>
                    </div>
                  ))}

                  {/* Live preview */}
                  <div className={styles.previewBox}>
                    <span>Score estimado tras evaluación:</span>
                    <strong style={{ color: levelColor, fontSize: '1.2rem' }}>{globalScore}%</strong>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setIsAssessmentModalOpen(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleAssessmentSubmit}>
                  <CheckCircle2 size={16} /> Finalizar y Recalcular
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
