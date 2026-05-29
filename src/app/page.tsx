'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Database, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Info,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Calendar,
  UserCheck,
  Check,
  Search,
  BookOpen,
  Cpu,
  Users,
  Download,
  X,
  Award,
  Sliders,
  Eye,
  EyeOff,
  Bell,
  Share2,
  Lock,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import styles from './page.module.css';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';



const areaData = [
  { name: 'Ventas', value: 400, color: '#3b82f6' },
  { name: 'IT', value: 300, color: '#10b981' },
  { name: 'Finanzas', value: 300, color: '#f59e0b' },
  { name: 'RRHH', value: 200, color: '#6366f1' },
];

const glossaryItems = [
  { term: 'Metadata', desc: 'Información estructurada que describe, explica o facilita la recuperación de recursos de información.', tag: 'Estructura' },
  { term: 'Data Asset', desc: 'Cualquier entidad de datos que posee valor para la organización (tablas, reportes, modelos).', tag: 'Activos' },
  { term: 'Linaje de Datos', desc: 'Ciclo de vida que describe el origen físico, transformaciones y destino final de la información.', tag: 'Flujo' },
  { term: 'PII', desc: 'Información Personal Identificable. Datos que pueden usarse para identificar de forma directa o indirecta a una persona.', tag: 'Seguridad' },
];

const DEFAULT_TECH_TASKS = [
  { id: 1, text: 'Revisar logs de base de datos PII', completed: true },
  { id: 2, text: 'Correr escaneo de calidad diario', completed: false },
  { id: 3, text: 'Revisar falsos positivos de RUT', completed: false },
  { id: 4, text: 'Establecer umbral de calidad en 85%', completed: true },
];

const DEFAULT_WEEKLY_HOURS = [
  { day: 'Lun', horas: 6.1 },
  { day: 'Mar', horas: 4.5 },
  { day: 'Mie', horas: 7.2 },
  { day: 'Jue', horas: 5.8 },
  { day: 'Vie', horas: 8.0 },
];

const DEFAULT_AUDITED_HOURS = 9.8;

const DEFAULT_STEWARDS = [
  { name: 'Juan Lopez', role: 'Data Owner', hours: 14.5, maxHours: 20, color: '#f59e0b', initial: 'JL', points: 120 },
  { name: 'Maria Garcia', role: 'Data Steward', hours: 18.2, maxHours: 20, color: '#10b981', initial: 'MG', points: 185 },
  { name: 'Carlos Canon', role: 'Data Steward', hours: 9.8, maxHours: 20, color: '#3b82f6', initial: 'CC', points: 95 },
];

const DEFAULT_MEETINGS = [
  { id: 1, title: 'Comité de Datos Semanal', date: '21', month: 'MAY', time: '10:00 AM', type: 'Comité', badgeColor: '#3b82f6', bg: '#eff6ff' },
  { id: 2, title: 'Revisión de Sensibilidad PII', date: '24', month: 'MAY', time: '02:30 PM', type: 'Revisión', badgeColor: '#f59e0b', bg: '#fffbeb' },
];

export default function Dashboard() {
  const { currentTenant, mode } = usePlatform();
  const [dashboardAssets, setDashboardAssets] = React.useState<any[]>([]);

  // Distribución dinámica de activos por área/responsable de la empresa activa
  const AREA_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];
  const computedAreaData = useMemo(() => {
    if (dashboardAssets.length === 0) return [
      { name: 'Sin datos', value: 1, color: '#94a3b8' }
    ];
    const map = new Map<string, number>();
    dashboardAssets.forEach((a: any) => {
      const area = a.owner || a.data_owner || 'Otro';
      map.set(area, (map.get(area) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value], i) => ({
      name,
      value,
      color: AREA_COLORS[i % AREA_COLORS.length]
    }));
  }, [dashboardAssets]);
  const [userName, setUserName] = useState('Carlos');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytic' | 'history' | 'report'>('dashboard');
  const [dashboardLayout, setDashboardLayout] = useState<'classic' | 'moneed'>('classic');

  // Customization States (Parameterization parameters)
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [card1Metric, setCard1Metric] = useState<'calidad' | 'madurez' | 'compliance'>('calidad');
  const [card2Metric, setCard2Metric] = useState<'incidentes' | 'tablas'>('incidentes');
  const [card3Metric, setCard3Metric] = useState<'riesgos' | 'tareas'>('riesgos');
  const [card4Metric, setCard4Metric] = useState<'auditoria' | 'limpieza'>('auditoria');
  const [card5Metric, setCard5Metric] = useState<'evolucion' | 'escaneo'>('evolucion');
  const [card7Metric, setCard7Metric] = useState<'escaneos' | 'seguridad'>('escaneos');

  // Interactive UI states
  const [isMetricHidden, setIsMetricHidden] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qualityScore, setQualityScore] = useState(92.4);
  const [auditedHours, setAuditedHours] = useState(9.8);
  const [searchText, setSearchText] = useState('');

  // Toast / notification logs
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch username and dashboard layout from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('govdata_user_name');
      if (savedName) setUserName(savedName);
      
      const hasReset = localStorage.getItem('govdata_layout_reset_v2');
      if (!hasReset) {
        localStorage.setItem('govdata_dashboard_layout', 'classic');
        localStorage.setItem('govdata_layout_reset_v2', 'true');
        setDashboardLayout('classic');
      } else {
        const savedLayout = localStorage.getItem('govdata_dashboard_layout');
        if (savedLayout === 'classic' || savedLayout === 'moneed') {
          setDashboardLayout(savedLayout as 'classic' | 'moneed');
        }
      }
    }
  }, []);

  // Load tenant-specific interactive states whenever tenant changes
  useEffect(() => {
    if (!currentTenant?.id) return;

    // Load techTasks
    try {
      const saved = localStorage.getItem(`govdata_tech_tasks_${currentTenant.id}`);
      if (saved) setTechTasks(JSON.parse(saved));
      else setTechTasks(DEFAULT_TECH_TASKS);
    } catch {
      setTechTasks(DEFAULT_TECH_TASKS);
    }

    // Load weeklyHours
    try {
      const saved = localStorage.getItem(`govdata_weekly_hours_${currentTenant.id}`);
      if (saved) setWeeklyHours(JSON.parse(saved));
      else setWeeklyHours(DEFAULT_WEEKLY_HOURS);
    } catch {
      setWeeklyHours(DEFAULT_WEEKLY_HOURS);
    }

    // Load auditedHours
    try {
      const saved = localStorage.getItem(`govdata_audited_hours_${currentTenant.id}`);
      if (saved) setAuditedHours(JSON.parse(saved));
      else setAuditedHours(DEFAULT_AUDITED_HOURS);
    } catch {
      setAuditedHours(DEFAULT_AUDITED_HOURS);
    }

    // Load stewards
    try {
      const saved = localStorage.getItem(`govdata_stewards_${currentTenant.id}`);
      if (saved) setStewards(JSON.parse(saved));
      else setStewards(DEFAULT_STEWARDS);
    } catch {
      setStewards(DEFAULT_STEWARDS);
    }

    // Load meetings
    try {
      const saved = localStorage.getItem(`govdata_meetings_${currentTenant.id}`);
      if (saved) setMeetings(JSON.parse(saved));
      else setMeetings(DEFAULT_MEETINGS);
    } catch {
      setMeetings(DEFAULT_MEETINGS);
    }

    // Load scannedGb
    try {
      const saved = localStorage.getItem(`govdata_scanned_gb_${currentTenant.id}`);
      if (saved) setScannedGb(JSON.parse(saved));
      else setScannedGb(12.4);
    } catch {
      setScannedGb(12.4);
    }
  }, [currentTenant?.id]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =========================================================================
  // CLASSIC DASHBOARD STATES & HELPERS
  // =========================================================================
  // Executive Dashboard State
  const [executivePeriod, setExecutivePeriod] = useState<'semestral' | 'trimestral' | 'anual'>('semestral');
  const [activeIncidentFilter, setActiveIncidentFilter] = useState<'Todos' | 'Crítico' | 'Medio'>('Todos');
  const [remediatingId, setRemediatingId] = useState<number | null>(null);
  const [remediatedIncidents, setRemediatedIncidents] = useState<number[]>([]);

  // Dynamic database indicators state
  const [dbKpis, setDbKpis] = useState<{ quality: string; maturity: string; compliance: string; incidents: string; criticalIncidents: number; seguridad: string; catalogo: string } | null>(null);
  const [dbIncidents, setDbIncidents] = useState<any[]>([]);

  // Dynamic sparkline and executive data states
  const [classicSparklineData, setClassicSparklineData] = useState({
    madurez: [{ value: 40 }, { value: 45 }, { value: 42 }, { value: 50 }, { value: 55 }, { value: 64 }],
    calidad: [{ value: 85 }, { value: 87 }, { value: 84 }, { value: 90 }, { value: 91 }, { value: 92.4 }],
    compliance: [{ value: 75 }, { value: 78 }, { value: 82 }, { value: 85 }, { value: 86 }, { value: 88 }],
    incidentes: [{ value: 20 }, { value: 18 }, { value: 15 }, { value: 16 }, { value: 14 }, { value: 12 }]
  });

  const [sparklineData, setSparklineData] = useState({
    calidad: [{ v: 85 }, { v: 87 }, { v: 84 }, { v: 90 }, { v: 91 }, { v: 92.4 }],
    madurez: [{ v: 45 }, { v: 48 }, { v: 52 }, { v: 55 }, { v: 60 }, { v: 64 }],
    compliance: [{ v: 78 }, { v: 82 }, { v: 80 }, { v: 85 }, { v: 86 }, { v: 88 }]
  });

  const [executiveData, setExecutiveData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentTenant) return;

      // ── MODO DEMO: cargar activos desde localStorage con aislamiento por empresa ──
      if (mode === 'DEMO') {
        const localKey = `govdata_assets_${currentTenant.id || 'demo'}`;
        let demoAssets: any[] = [];
        try {
          const saved = localStorage.getItem(localKey);
          if (saved) {
            demoAssets = JSON.parse(saved);
          } else {
            // Activos de prueba alineados con IDs simples de las empresas demo
            const fallback = [
              { id: '1', name: 'Maestro de Clientes', source: 'SAP ERP', owner: 'Ventas', type: 'Tabla SQL', quality_score: 94, sensitivity: 'Confidencial', tenant_id: '1' },
              { id: '2', name: 'Transacciones Q2', source: 'Oracle DB', owner: 'Finanzas', type: 'Vista', quality_score: 88, sensitivity: 'Restringido', tenant_id: '2' },
              { id: '3', name: 'Leads Marketing', source: 'Salesforce', owner: 'Marketing', type: 'API', quality_score: 72, sensitivity: 'Público', tenant_id: '1' },
              { id: '4', name: 'Reporte Consolidado', source: 'Data Lake', owner: 'Estrategia', type: 'Power BI', quality_score: 99, sensitivity: 'Confidencial', tenant_id: '3' },
            ];
            demoAssets = fallback.filter(a => a.tenant_id === currentTenant.id);
          }
        } catch {}
        setDashboardAssets(demoAssets);

        // KPIs demo basados en activos de la empresa
        const avgQuality = demoAssets.length > 0
          ? Math.round(demoAssets.reduce((acc, a) => acc + (a.quality_score ?? 85), 0) / demoAssets.length)
          : 85;
        let answers = { q1: 3, q2: 4, q3: 3, q4: 3 };
        try {
          const rawAnswers = localStorage.getItem(`govdata_maturity_answers_${currentTenant.id}`);
          if (rawAnswers) answers = JSON.parse(rawAnswers);
        } catch {}
        let estrategiaVal = 64, organizacionVal = 72, calidadVal = avgQuality, arquitecturaVal = 55, seguridadVal = 60, complianceVal = 88;
        try {
          const savedScores = localStorage.getItem(`govdata_maturity_scores_${currentTenant.id}`);
          if (savedScores) {
            const parsed = JSON.parse(savedScores);
            if (parsed.estrategia !== undefined) estrategiaVal = Number(parsed.estrategia);
            if (parsed.organizacion !== undefined) organizacionVal = Number(parsed.organizacion);
            if (parsed.calidad !== undefined) calidadVal = Number(parsed.calidad);
            if (parsed.arquitectura !== undefined) arquitecturaVal = Number(parsed.arquitectura);
            if (parsed.seguridad !== undefined) seguridadVal = Number(parsed.seguridad);
            if (parsed.compliance !== undefined) complianceVal = Number(parsed.compliance);
          }
        } catch {}
        const globalScore = Math.round((estrategiaVal + organizacionVal + calidadVal + arquitecturaVal + seguridadVal + complianceVal) / 6);
        let multiplier = executivePeriod === 'trimestral' ? 1.02 : executivePeriod === 'anual' ? 0.96 : 1.0;
        setQualityScore(Math.min(100, Math.round(calidadVal * multiplier * 10) / 10));
        setDbKpis({
          quality: `${Math.min(100, Math.round(calidadVal * multiplier * 10) / 10)}%`,
          maturity: `${Math.min(100, Math.round(globalScore * multiplier))}%`,
          compliance: `${Math.min(100, Math.round(complianceVal * multiplier))}%`,
          incidents: '0',
          criticalIncidents: 0
        });
        const semestralMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        setExecutiveData(semestralMonths.map((m, i) => ({ name: m, calidad: Math.max(50, calidadVal - (5 - i) * 2), madurez: Math.max(30, globalScore - (5 - i) * 3) })));
        return;
      }

      try {
        // Query assets, workflows and incidents in parallel
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
            .select('*, data_assets!inner(name, source, tenant_id)')
            .eq('data_assets.tenant_id', currentTenant.id)
            .order('detected_at', { ascending: false }),
        ]);

        const assets = assetsData ?? [];
        const workflows = workflowsData ?? [];
        const incidents = incidentsData ?? [];

        setDashboardAssets(assets);

        // Format incidents list
        let formattedIncidents = incidents.map((inc: any) => ({
          id: inc.id,
          title: inc.description || `Incidente de calidad en ${inc.data_assets?.name || 'activo'}`,
          source: inc.data_assets?.source || 'Base de datos',
          severity: inc.priority || 'Medio',
          date: new Date(inc.detected_at).toLocaleDateString(),
          status: inc.status
        }));
        setDbIncidents(formattedIncidents);

        // Load answers per tenant
        let answers = { q1: 3, q2: 4, q3: 3, q4: 3 };
        try {
          const rawAnswers = localStorage.getItem(`govdata_maturity_answers_${currentTenant.id}`);
          if (rawAnswers) {
            answers = JSON.parse(rawAnswers);
          }
        } catch {}

        // --- Calidad: exact global health from incidents ---
        let calidad = 0;
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
          (orgDB * 0.4) + (answers.q1 * 10) + (answers.q2 * 8)
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
        const estrategia = Math.min(100, Math.round(60 + (approved * 4) + (answers.q3 * 6)));

        // --- Compliance: incidents resolved + questionnaire ---
        const resolved = incidents.filter(i => i.status === 'Resuelto').length;
        const totalInc = incidents.length || 1;
        const compliance = Math.min(100, Math.round(
          ((resolved / totalInc) * 60) + (answers.q4 * 8)
        ));

        // Load unified maturity scores from the Maturity Module if they exist
        let estrategiaVal = estrategia;
        let organizacionVal = organizacion;
        let calidadVal = calidad;
        let arquitecturaVal = arquitectura;
        let seguridadVal = seguridad;
        let complianceVal = compliance;

        try {
          const savedScores = localStorage.getItem(`govdata_maturity_scores_${currentTenant.id}`);
          if (savedScores) {
            const parsed = JSON.parse(savedScores);
            if (parsed.estrategia !== undefined) estrategiaVal = Number(parsed.estrategia);
            if (parsed.organizacion !== undefined) organizacionVal = Number(parsed.organizacion);
            if (parsed.calidad !== undefined) calidadVal = Number(parsed.calidad);
            if (parsed.arquitectura !== undefined) arquitecturaVal = Number(parsed.arquitectura);
            if (parsed.seguridad !== undefined) seguridadVal = Number(parsed.seguridad);
            if (parsed.compliance !== undefined) complianceVal = Number(parsed.compliance);
          }
        } catch (e) {
          console.error("Error loading maturity scores from maturity module:", e);
        }

        const globalScore = Math.round((estrategiaVal + organizacionVal + calidadVal + arquitecturaVal + seguridadVal + complianceVal) / 6);

        // Calculate critical incidents count
        let criticalCount = incidents.filter((inc: any) => inc.status === 'Abierto' && (inc.priority === 'Crítico' || inc.priority === 'Alta')).length;
        let activeDbIncidentsCount = incidents.filter((inc: any) => inc.status === 'Abierto').length;

        // Apply selected executivePeriod adjustments dynamically
        let multiplier = executivePeriod === 'trimestral' ? 1.02 : executivePeriod === 'anual' ? 0.96 : 1.0;
        let finalQuality = Math.min(100, Math.round(calidadVal * multiplier * 10) / 10);
        let finalMaturity = Math.min(100, Math.round(globalScore * multiplier));
        let finalCompliance = Math.min(100, Math.round(complianceVal * multiplier));

        setDbKpis({
          quality: `${finalQuality}%`,
          maturity: `${finalMaturity}%`,
          compliance: `${finalCompliance}%`,
          incidents: String(activeDbIncidentsCount),
          criticalIncidents: criticalCount,
          seguridad: `${Math.min(100, Math.round(seguridadVal * multiplier))}%`,
          catalogo: String(assets.length)
        });

        setQualityScore(finalQuality);

        // Load evolution history if present
        let history: { name: string; score: number }[] = [];
        try {
          const rawHistory = localStorage.getItem(`govdata_maturity_evolution_${currentTenant.id}`);
          if (rawHistory) {
            history = JSON.parse(rawHistory);
          }
        } catch {}

        const getMaturityHistory = (months: string[], currentVal: number) => {
          return months.map((m, idx) => {
            const histPoint = history.find(h => h.name === m);
            if (histPoint) return histPoint.score;
            const diff = months.length - 1 - idx;
            return Math.max(30, Math.round(currentVal - (diff * 3.5)));
          });
        };

        const getQualityHistory = (months: string[], currentVal: number) => {
          return months.map((m, idx) => {
            const diff = months.length - 1 - idx;
            return Math.max(50, Math.round(currentVal - (diff * 2)));
          });
        };

        const semestralMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const trimestralMonths = ['Abr', 'May', 'Jun'];
        const anualMonths = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        const matSem = getMaturityHistory(semestralMonths, finalMaturity);
        const qualSem = getQualityHistory(semestralMonths, finalQuality);

        const matTri = getMaturityHistory(trimestralMonths, finalMaturity);
        const qualTri = getQualityHistory(trimestralMonths, finalQuality);

        const matAnu = getMaturityHistory(anualMonths, finalMaturity);
        const qualAnu = getQualityHistory(anualMonths, finalQuality);

        const newExecutiveDataMap = {
          semestral: semestralMonths.map((m, i) => ({ name: m, calidad: qualSem[i], madurez: matSem[i] })),
          trimestral: trimestralMonths.map((m, i) => ({ name: m, calidad: qualTri[i], madurez: matTri[i] })),
          anual: anualMonths.map((m, i) => ({ name: m, calidad: qualAnu[i], madurez: matAnu[i] })),
        };

        setExecutiveData(newExecutiveDataMap[executivePeriod]);

        // Sparklines update
        setClassicSparklineData({
          madurez: matSem.map(v => ({ value: v })),
          calidad: qualSem.map(v => ({ value: v })),
          compliance: semestralMonths.map((_, i) => ({ value: Math.max(50, Math.round(finalCompliance - ((5 - i) * 2))) })),
          incidentes: [
            { value: activeDbIncidentsCount + 8 },
            { value: activeDbIncidentsCount + 6 },
            { value: activeDbIncidentsCount + 4 },
            { value: activeDbIncidentsCount + 3 },
            { value: activeDbIncidentsCount + 1 },
            { value: activeDbIncidentsCount }
          ]
        });

        setSparklineData({
          calidad: qualSem.map(v => ({ v })),
          madurez: matSem.map(v => ({ v })),
          compliance: semestralMonths.map((_, i) => ({ v: Math.max(50, Math.round(finalCompliance - ((5 - i) * 2))) }))
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    }
    fetchDashboardData();
  }, [currentTenant?.id, executivePeriod, mode]);

  // Technical Dashboard State (FitSpark Style)
  const [scannedGb, setScannedGb] = useState(12.4);
  const [isScanningTech, setIsScanningTech] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [terminalSearch, setTerminalSearch] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  
  const [techTasks, setTechTasks] = useState(DEFAULT_TECH_TASKS);

  // Collaborative Dashboard State (Crextio Style)
  const [timerTime, setTimerTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [flippedGlossary, setFlippedGlossary] = useState<string[]>([]);
  const [glossarySearch, setGlossarySearch] = useState('');

  // Form states for scheduling
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingSteward, setNewMeetingSteward] = useState('Carlos owner');
  const [newMeetingTime, setNewMeetingTime] = useState('10:00 AM');

  // Dynamic Weekly Auditing Hours State
  const [weeklyHours, setWeeklyHours] = useState(DEFAULT_WEEKLY_HOURS);

  // Stewards Leaderboard
  const [stewards, setStewards] = useState(DEFAULT_STEWARDS);

  const [meetings, setMeetings] = useState(DEFAULT_MEETINGS);

  // Technical Dashboard Log Autoscroll
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [scanLogs]);

  // Technical: Simulate Scanner
  const startTechnicalScan = () => {
    if (isScanningTech) return;
    setIsScanningTech(true);
    setScanProgress(0);
    setScanLogs(['[17:04:10] [INFO] Inicializando motor de escaneo GovData...']);

    const logsList = [
      '[17:04:11] [INFO] Conectando a base de datos relacional...',
      '[17:04:12] [SUCCESS] Conexión establecida con PostgreSQL (Schema: public).',
      '[17:04:12] [INFO] Analizando metadatos de 45 tablas...',
      '[17:04:13] [INFO] Evaluando reglas de calidad para tabla: data_assets...',
      '[17:04:14] [SUCCESS] Tabla data_assets verificada: 0 nulos detectados.',
      '[17:04:15] [INFO] Evaluando reglas de calidad para tabla: tenant_users...',
      '[17:04:15] [WARN] Detectado campo "email" sin validación de formato en 2 registros.',
      '[17:04:16] [INFO] Ejecutando algoritmo de enmascaramiento dinámico (PII)...',
      '[17:04:17] [SUCCESS] Escaneo completado exitosamente.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningTech(false);
          return 100;
        }
        
        if (currentStep < logsList.length && Math.random() > 0.3) {
          setScanLogs(l => [...l, logsList[currentStep]]);
          currentStep++;
        }

        return prev + 10;
      });
    }, 450);
  };

  // Technical: Toggle Task
  const toggleTechTask = (taskId: number) => {
    setTechTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      if (currentTenant?.id) {
        localStorage.setItem(`govdata_tech_tasks_${currentTenant.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Technical: Reset Tasks
  const handleResetTechTasks = () => {
    setTechTasks(prev => {
      const updated = prev.map(t => t.id === 2 || t.id === 3 ? { ...t, completed: false } : t);
      if (currentTenant?.id) {
        localStorage.setItem(`govdata_tech_tasks_${currentTenant.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Technical Task Completion Stats
  const completedCount = techTasks.filter(t => t.completed).length;
  const techCompletionPct = Math.round((completedCount / techTasks.length) * 100);
  
  const techPieData = [
    { name: 'Completado', value: completedCount, color: '#84cc16' },
    { name: 'Pendiente', value: techTasks.length - completedCount, color: '#1e293b' }
  ];

  // Technical: Download logs as .log file
  const downloadTerminalLogs = () => {
    const element = document.createElement("a");
    const file = new Blob([scanLogs.join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "scan-operations.log";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Technical: Filtered logs
  const filteredLogs = scanLogs.filter(log => 
    log.toLowerCase().includes(terminalSearch.toLowerCase())
  );

  // Collaborative: Stopwatch Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerTime(t => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const formatTimerTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Collaborative: Register stopwatch hours to chart
  const handleRegisterHours = () => {
    if (timerTime === 0) {
      alert('⚠️ Por favor inicia el cronómetro antes de registrar horas.');
      return;
    }
    const addedHours = Number((timerTime / 10).toFixed(1));
    if (addedHours === 0) {
      alert('⚠️ Registra al menos un par de segundos en el timer.');
      return;
    }
    
    setWeeklyHours(prev => {
      const updated = prev.map(dayObj => {
        if (dayObj.day === 'Vie') {
          return { ...dayObj, horas: Number((dayObj.horas + addedHours).toFixed(1)) };
        }
        return dayObj;
      });
      if (currentTenant?.id) {
        localStorage.setItem(`govdata_weekly_hours_${currentTenant.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    setStewards(prev => {
      const updated = prev.map(steward => {
        if (steward.name.includes('Carlos')) {
          return { 
            ...steward, 
            hours: Math.min(Number((steward.hours + addedHours).toFixed(1)), 20),
            points: steward.points + Math.round(addedHours * 10)
          };
        }
        return steward;
      });
      if (currentTenant?.id) {
        localStorage.setItem(`govdata_stewards_${currentTenant.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    alert(`✅ Registradas con éxito ${addedHours} horas de auditoría a la cuenta de Carlos Canon para el día Viernes.`);
    setTimerRunning(false);
    setTimerTime(0);
  };

  // Collaborative: Recognize Steward
  const handleRecognizeSteward = (name: string) => {
    setStewards(prev => {
      const updated = prev.map(steward => {
        if (steward.name === name) {
          return { ...steward, points: steward.points + 25 };
        }
        return steward;
      });
      if (currentTenant?.id) {
        localStorage.setItem(`govdata_stewards_${currentTenant.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    alert(`⭐ Aporte reconocido a ${name}. Se le otorgaron +25 puntos GovData.`);
  };

  // Collaborative: Glossary search & flip
  const handleGlossaryFlip = (term: string) => {
    setFlippedGlossary(prev => 
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  const filteredGlossaryItems = glossaryItems.filter(item => 
    item.term.toLowerCase().includes(glossarySearch.toLowerCase()) || 
    item.desc.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  // Collaborative: Add Meeting via Form modal
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle.trim()) {
      alert('Por favor introduce un título para la reunión.');
      return;
    }

    const newMeeting = {
      id: Date.now(),
      title: newMeetingTitle,
      date: (new Date().getDate() + 3).toString(),
      month: 'JUN',
      time: newMeetingTime,
      type: 'Comité',
      badgeColor: '#10b981',
      bg: '#ecfdf5'
    };

    setMeetings(prev => {
      const updated = [...prev, newMeeting];
      if (currentTenant?.id) {
        localStorage.setItem(`govdata_meetings_${currentTenant.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    setIsMeetingModalOpen(false);
    setNewMeetingTitle('');
  };

  // Executive: Remediate Incident
  const handleRemediate = (id: number) => {
    setRemediatingId(id);
    setTimeout(() => {
      setRemediatedIncidents(prev => [...prev, id]);
      setRemediatingId(null);
    }, 1500);
  };

  // =========================================================================

  // Escanear animation handler
  const handleRunScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    triggerToast('⏳ Inicializando escaneo de calidad en base de datos...');
    
    setTimeout(() => {
      setIsScanning(false);
      setQualityScore(93.6);
      triggerToast('🎉 Escaneo completado. Calidad mejoró a 93.6%.');
    }, 2000);
  };

  // Add audited hours handler
  const handleAddAuditHours = () => {
    setAuditedHours(prev => {
      const updated = parseFloat((prev + 1.2).toFixed(1));
      triggerToast(`⏱️ Se registraron +1.2 horas de auditoría (Total: ${updated}h).`);
      if (currentTenant?.id) {
        localStorage.setItem(`govdata_audited_hours_${currentTenant.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Technical cylinder sum volume handler
  const handleAddScannedGb = () => {
    setScannedGb(prev => {
      const updated = Math.min(prev + 0.8, 20.0);
      if (currentTenant?.id) {
        localStorage.setItem(`govdata_scanned_gb_${currentTenant.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Dynamic Evolution Charts computed from live reactive states
  const cashflowCalidadData = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return months.map((m, i) => {
      const calidadVal = classicSparklineData.calidad[i]?.value ?? 80;
      const madurezVal = classicSparklineData.madurez[i]?.value ?? 50;
      return { month: m, calidad: calidadVal, madurez: madurezVal };
    });
  }, [classicSparklineData]);

  const cashflowEscaneoData = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const factors = [0.43, 0.58, 0.55, 0.73, 0.90, 1.0];
    return months.map((m, i) => ({
      month: m,
      escaneo: parseFloat((scannedGb * factors[i]).toFixed(1))
    }));
  }, [scannedGb]);

  // Table transaction history content datasets
  const rawEscaneoTransactions = [
    { id: 't-1', name: 'dbo.users_chile', amount: '124,500 filas', method: 'Postgres', date: '20 Oct 2025', status: 'Complete' },
    { id: 't-2', name: 'sap_billing_logs', amount: '45,210 filas', method: 'SAP Connect', date: '19 Oct 2025', status: 'Canceled' },
    { id: 't-3', name: 'aws_s3_metadata', amount: '8,900 filas', method: 'S3 Sync', date: '18 Oct 2025', status: 'Complete' },
    { id: 't-4', name: 'compliance_report_q3', amount: '230 políticas', method: 'Manual', date: '15 Oct 2025', status: 'Complete' },
  ];

  const rawSeguridadTransactions = [
    { id: 's-1', name: 'Acceso Anónimo PII', amount: 'IP 192.168.1.45', method: 'Auth API', date: '20 Oct 2025', status: 'Canceled' },
    { id: 's-2', name: 'Enmascaramiento RUT', amount: 'Exitoso', method: 'RLS Engine', date: '19 Oct 2025', status: 'Complete' },
    { id: 's-3', name: 'Fuga Detectada', amount: 'Crítico', method: 'Alert System', date: '17 Oct 2025', status: 'Canceled' },
    { id: 's-4', name: 'Cambio Contraseña Steward', amount: 'Exitoso', method: 'Supabase Auth', date: '14 Oct 2025', status: 'Complete' },
  ];

  // Filter transaction list based on search text
  const filteredTransactions = (card7Metric === 'escaneos' ? rawEscaneoTransactions : rawSeguridadTransactions).filter(
    item => item.name.toLowerCase().includes(searchText.toLowerCase()) || item.method.toLowerCase().includes(searchText.toLowerCase())
  );

  // Active tenant and dashboard type selection
  const dashboardType = currentTenant?.dashboardType || 'executive';

  // ==========================================
  // RENDER CLASSIC DASHBOARD LAYOUTS
  // ==========================================
  if (dashboardLayout === 'classic') {
    if (dashboardType === 'executive') {
      const currentData = executiveData;
      
      // Dynamic KPI stats based on period selection or database data
      const defaultKpis = {
        semestral: { quality: '92.4%', maturity: '64%', compliance: '88%', incidents: '12' },
        trimestral: { quality: '94.1%', maturity: '67%', compliance: '91%', incidents: '8' },
        anual: { quality: '89.2%', maturity: '58%', compliance: '85%', incidents: '18' }
      }[executivePeriod];

      const kpis = dbKpis || defaultKpis;

      const defaultIncidents = [
        { id: 1, title: 'Fuga detectada: PII en Logs', source: 'Azure Storage', severity: 'Crítico', date: '2026-05-19' },
        { id: 2, title: 'Calidad: Nulos en RUT', source: 'SQL Server', severity: 'Medio', date: '2026-05-18' }
      ];

      const allIncidents = dbIncidents.length > 0 ? dbIncidents : defaultIncidents;

      const filteredIncidents = activeIncidentFilter === 'Todos'
        ? allIncidents
        : allIncidents.filter(inc => inc.severity === activeIncidentFilter);

      // Subtract remediated incidents from the active KPI count
      const baseIncidents = parseInt(kpis.incidents);
      const activeIncidentsCount = Math.max(0, baseIncidents - remediatedIncidents.length);

      return (
        <div className={styles.classic_container}>
          <header className={styles.classic_header}>
            <div className={styles.classic_headerTitle}>
              <h1>Executive Command Center</h1>
              <p>Bienvenido, {userName}. Control inteligente y analítica macro de gobernanza.</p>
            </div>
            
            <div className={styles.classic_headerActions}>
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {(['semestral', 'trimestral', 'anual'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setExecutivePeriod(p)}
                    style={{
                      backgroundColor: executivePeriod === p ? 'white' : 'transparent',
                      color: executivePeriod === p ? '#1e3a8a' : '#64748b',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: executivePeriod === p ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s',
                      textTransform: 'capitalize'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button className={styles.classic_secondaryBtn}>
                <Clock size={16} />
                Sincronizado: 10:45 AM
              </button>
            </div>
          </header>

          {/* Premium Stat Cards with Sparklines */}
          <div className={styles.classic_statsGrid}>
            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(30, 58, 138, 0.08)', color: '#1e3a8a' }}>
                  <TrendingUp size={22} />
                </div>
                <div className={`${styles.classic_cardTrend} ${styles.classic_positiveTrend}`}>
                  <span>+12% vs Q1</span>
                </div>
              </div>
              <div className={styles.classic_cardValue}>{kpis.maturity}</div>
              <div className={styles.classic_cardTitle}>Madurez Global</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.madurez}>
                    <Area type="monotone" dataKey="value" stroke="#1e3a8a" fill="rgba(30, 58, 138, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                  <Activity size={22} />
                </div>
                <div className={`${styles.classic_cardTrend} ${styles.classic_positiveTrend}`}>
                  <span>Meta: 95%</span>
                </div>
              </div>
              <div className={styles.classic_cardValue}>{kpis.quality}</div>
              <div className={styles.classic_cardTitle}>Calidad de Datos Promedio</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.calidad}>
                    <Area type="monotone" dataKey="value" stroke="#10b981" fill="rgba(16, 185, 129, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                  <ShieldCheck size={22} />
                </div>
                <div className={`${styles.classic_cardTrend} ${styles.classic_positiveTrend}`}>
                  <span>+2.5%</span>
                </div>
              </div>
              <div className={styles.classic_cardValue}>{kpis.compliance}</div>
              <div className={styles.classic_cardTitle}>Compliance Score</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.compliance}>
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
                  <ShieldAlert size={22} />
                </div>
                <div className={`${styles.classic_cardTrend} ${styles.classic_negativeTrend}`} style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                  <span>Críticos: {dbKpis?.criticalIncidents || 0}</span>
                </div>
              </div>
              <div className={styles.classic_cardValue}>{activeIncidentsCount}</div>
              <div className={styles.classic_cardTitle}>Incidentes Activos</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.incidentes}>
                    <Area type="monotone" dataKey="value" stroke="#ef4444" fill="rgba(239, 68, 68, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                  <Lock size={22} />
                </div>
                <div className={`${styles.classic_cardTrend} ${styles.classic_positiveTrend}`}>
                  <span>Protegido</span>
                </div>
              </div>
              <div className={styles.classic_cardValue}>{dbKpis?.seguridad || '60%'}</div>
              <div className={styles.classic_cardTitle}>Seguridad PII</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.madurez}>
                    <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#a855f7' }}>
                  <BookOpen size={22} />
                </div>
                <div className={`${styles.classic_cardTrend} ${styles.classic_positiveTrend}`}>
                  <span>Activos</span>
                </div>
              </div>
              <div className={styles.classic_cardValue}>{dbKpis?.catalogo || '0'}</div>
              <div className={styles.classic_cardTitle}>Catálogo de Datos</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.calidad}>
                    <Area type="monotone" dataKey="value" stroke="#a855f7" fill="rgba(168, 85, 247, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.classic_mainGrid}>
            <div className={styles.classic_chartCard}>
              <div className={styles.classic_cardHeader}>
                <div>
                  <h3>Evolución de Calidad vs Madurez</h3>
                  <p>Análisis de madurez del ecosistema organizativo - Periodo {executivePeriod === 'anual' ? '2025' : '2024'}</p>
                </div>
                <div className={styles.classic_legend}>
                  <div className={styles.classic_legendItem}><i style={{ backgroundColor: '#3b82f6' }}></i> Calidad</div>
                  <div className={styles.classic_legendItem}><i style={{ backgroundColor: '#94a3b8' }}></i> Madurez</div>
                </div>
              </div>
              <div className={styles.classic_chartWrapper}>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={currentData as any[]}>
                    <defs>
                      <linearGradient id="colorQual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '16px', background: 'rgba(15, 23, 42, 0.9)', color: 'white', border: 'none', boxShadow: '0 10px 25px -3px rgba(0,0,0,0.3)' }} />
                    <Area type="monotone" dataKey="calidad" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorQual)" />
                    <Area type="monotone" dataKey="madurez" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_sideCard}>
              <div className={styles.classic_cardHeader}>
                <h3>Distribución de Activos</h3>
                <p>Clasificados por área</p>
              </div>
              <div className={styles.classic_chartWrapper} style={{ minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={computedAreaData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {computedAreaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.classic_incidentList} style={{ marginTop: '20px' }}>
                  {computedAreaData.map(area => (
                    <div key={area.name} className={styles.classic_incidentItem} style={{ padding: '10px 14px' }}>
                      <div className={styles.classic_statusDot} style={{ backgroundColor: area.color }}></div>
                      <div className={styles.classic_incidentInfo}>
                        <h4 style={{ fontSize: '0.85rem' }}>{area.name}</h4>
                        <p style={{ fontSize: '0.75rem' }}>{((area.value / Math.max(1, dashboardAssets.length)) * 100).toFixed(1)}% del total</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Incident Table Component */}
          <div className={styles.classic_chartCard}>
            <div className={styles.classic_cardHeader}>
              <div>
                <h3>Control de Incidentes de Datos</h3>
                <p>Remediación interactiva y alertas de seguridad</p>
              </div>
              <select 
                value={activeIncidentFilter} 
                onChange={(e) => setActiveIncidentFilter(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg p-2 font-bold bg-white text-slate-800 outline-none"
              >
                <option value="Todos">Ver todos</option>
                <option value="Crítico">Críticos</option>
                <option value="Medio">Medios</option>
              </select>
            </div>

            <div className={styles.classic_incidentTable}>
              <div className={`${styles.classic_tableRow} ${styles.classic_tableHeader}`}>
                <div></div>
                <div>Incidente</div>
                <div>Origen</div>
                <div>Fecha</div>
                <div>Acción</div>
              </div>

              <AnimatePresence>
                {filteredIncidents.map(inc => {
                  const isRemediated = remediatedIncidents.includes(inc.id);
                  const isLoading = remediatingId === inc.id;

                  return (
                    <motion.div 
                      key={inc.id}
                      className={styles.classic_tableRow}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`${styles.classic_statusDot} ${isRemediated ? styles.classic_green : (inc.severity === 'Crítico' ? styles.classic_red : styles.classic_yellow)}`}></div>
                      <div className={`${styles.classic_tableCell} ${styles.classic_titleCell}`}>{inc.title}</div>
                      <div className={styles.classic_tableCell}>{inc.source}</div>
                      <div className={styles.classic_tableCell}>{inc.date}</div>
                      <div>
                        {isRemediated ? (
                          <button className={`${styles.classic_remediateBtn} ${styles.classic_remediated}`}>
                            <Check size={14} style={{ marginRight: '4px', display: 'inline' }} />
                            Remediado
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRemediate(inc.id)}
                            className={styles.classic_remediateBtn}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Mitigando...' : 'Remediar'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      );
    }

    if (dashboardType === 'technical') {
      return (
        <div className={styles.classic_dashboardTech}>
          <header className={styles.classic_header}>
            <div className={styles.classic_headerTitle}>
              <h1>Technical Operations Dashboard</h1>
              <p>Hola, {userName}. Sistema Operativo de Datos y Escaneo en Vivo.</p>
            </div>
            <div className={styles.classic_headerActions}>
              <button 
                className="bg-lime-500 hover:bg-lime-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-lime-500/20 border-none cursor-pointer"
                onClick={startTechnicalScan}
                disabled={isScanningTech}
              >
                <Activity size={18} className={isScanningTech ? 'animate-spin' : ''} />
                {isScanningTech ? `Escaneando (${scanProgress}%)` : 'Iniciar Escaneo'}
              </button>
            </div>
          </header>

          {/* Custom Technical stats */}
          <div className={styles.classic_statsGrid} style={{ marginTop: '24px' }}>
            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(132, 204, 22, 0.08)', color: '#84cc16' }}>
                  <Cpu size={22} />
                </div>
                <span className="text-xs font-bold text-lime-400">Escaneos Activos</span>
              </div>
              <div className={styles.classic_cardValue}>780</div>
              <div className={styles.classic_cardTitle}>Reglas Ejecutadas</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={classicSparklineData.compliance}>
                    <Line type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
                  <AlertTriangle size={22} />
                </div>
                <span className="text-xs font-bold text-red-400">Critico</span>
              </div>
              <div className={styles.classic_cardValue}>3</div>
              <div className={styles.classic_cardTitle}>Fallos del Servidor</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={classicSparklineData.incidentes}>
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                  <Database size={22} />
                </div>
                <span className="text-xs font-bold text-blue-400">Postgres & MySQL</span>
              </div>
              <div className={styles.classic_cardValue}>45</div>
              <div className={styles.classic_cardTitle}>Tablas Registradas</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={classicSparklineData.madurez}>
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#a855f7' }}>
                  <Activity size={22} />
                </div>
                <span className="text-xs font-bold text-purple-400">Storage</span>
              </div>
              <div className={styles.classic_cardValue}>{scannedGb.toFixed(1)} GB</div>
              <div className={styles.classic_cardTitle}>Volumen Monitoreado</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={classicSparklineData.calidad}>
                    <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.classic_mainGrid} style={{ marginTop: '24px' }}>
            <div className={styles.classic_chartCard}>
              <div className={styles.classic_cardHeader}>
                <div>
                  <h3>Terminal de Escaneo en Vivo</h3>
                  <p>Registros en tiempo real de los pipelines</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={terminalSearch}
                    onChange={(e) => setTerminalSearch(e.target.value)}
                    placeholder="Buscar en logs..."
                    className={styles.classic_searchLogsInput}
                  />
                  <button 
                    onClick={downloadTerminalLogs}
                    disabled={scanLogs.length === 0}
                    className="bg-slate-800 hover:bg-slate-700 text-lime-400 p-2 rounded-lg border border-lime-500/20 disabled:opacity-50"
                    title="Descargar Log"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </div>
              
              <div className={styles.classic_terminalContainer}>
                <div className={styles.classic_terminalHeader}>
                  <div className={styles.classic_terminalDots}>
                    <div className={`${styles.classic_terminalDot} ${styles.classic_terminalDotRed}`}></div>
                    <div className={`${styles.classic_terminalDot} ${styles.classic_terminalDotYellow}`}></div>
                    <div className={`${styles.classic_terminalDot} ${styles.classic_terminalDotGreen}`}></div>
                  </div>
                  <div className={styles.classic_terminalTitle}>steward@govdata: ~ops/scan</div>
                  <div style={{ width: '50px' }}></div>
                </div>
                
                <div className={styles.classic_terminalConsole} ref={consoleRef}>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className={styles.classic_scanLine} 
                        style={{ 
                          color: log.includes('[SUCCESS]') ? '#22c55e' : log.includes('[WARN]') ? '#eab308' : '#84cc16' 
                        }}
                      >
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 text-center py-10">
                      {terminalSearch ? 'No se encontraron logs que coincidan con la búsqueda.' : 'Terminal en espera de escaneo. Haz clic en "Iniciar Escaneo" arriba.'}
                    </div>
                  )}
                  {isScanningTech && <span className={styles.classic_terminalCursor}></span>}
                </div>
              </div>

              {isScanningTech && (
                <div className="w-full bg-slate-850 h-2.5 rounded-full mt-4 overflow-hidden border border-lime-500/20">
                  <div 
                    className="bg-lime-500 h-full transition-all duration-300"
                    style={{ width: `${scanProgress}%`, boxShadow: '0 0 10px #84cc16' }}
                  ></div>
                </div>
              )}
            </div>

            {/* Interactive Crystal Cylinder Gauge */}
            <div className={styles.classic_sideCard}>
              <div className={styles.classic_cardHeader}>
                <h3>Volumen Escaneado</h3>
                <p>Meta del Día: 20 GB</p>
              </div>
              <div className={styles.classic_cylinderContainer}>
                <div className={styles.classic_cylinderGlass}>
                  <div 
                    className={styles.classic_cylinderWater} 
                    style={{ height: `${(scannedGb / 20.0) * 100}%` }}
                  ></div>
                  {/* Bubble elements inside cylinder */}
                  <div className={styles.classic_bubble} style={{ left: '20px', width: '6px', height: '6px', animationDelay: '0s', animationDuration: '4s' }}></div>
                  <div className={styles.classic_bubble} style={{ left: '50px', width: '8px', height: '8px', animationDelay: '1.2s', animationDuration: '3s' }}></div>
                  <div className={styles.classic_bubble} style={{ left: '80px', width: '5px', height: '5px', animationDelay: '0.5s', animationDuration: '5s' }}></div>
                </div>
                <div className={styles.classic_cylinderValues}>
                  <div className={styles.classic_cylinderLabel}>BASE DE DATOS MONITOREADA</div>
                  <div className={styles.classic_cylinderMainVal}>{scannedGb.toFixed(1)} GB</div>
                  <div className={styles.classic_cylinderMeta}>
                    {scannedGb >= 20 ? '🎉 ¡Meta diaria completada!' : `${(20 - scannedGb).toFixed(1)} GB para la meta`}
                  </div>
                  <button 
                    onClick={handleAddScannedGb}
                    style={{
                      backgroundColor: '#84cc16',
                      color: '#0b0f19',
                      border: 'none',
                      fontWeight: 900,
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      marginTop: '16px',
                      boxShadow: '0 0 15px rgba(132, 204, 22, 0.4)',
                      transition: 'all 0.2s'
                    }}
                    title="Sumar Volumen de Escaneo"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.classic_bottomGrid} style={{ marginTop: '24px' }}>
            {/* Interactive checklist with completion celebration */}
            <div className={styles.classic_chartCard} style={{ position: 'relative', overflow: 'hidden' }}>
              <div className={styles.classic_cardHeader}>
                <h3>Chequeo Operativo Diario</h3>
                <span className="text-xs font-bold text-lime-400">{techCompletionPct}% Completado</span>
              </div>

              <div className={styles.classic_checkGrid}>
                {techTasks.map(t => (
                  <div 
                    key={t.id} 
                    className={`${styles.classic_checkItem} ${t.completed ? styles.classic_completed : ''}`}
                    onClick={() => toggleTechTask(t.id)}
                  >
                    <div className={styles.classic_checkbox}>
                      {t.completed && <Check size={12} strokeWidth={4} />}
                    </div>
                    <span className="text-sm font-semibold">{t.text}</span>
                  </div>
                ))}
              </div>

              {/* Sparkles/confetti celebration overlay */}
              <AnimatePresence>
                {techCompletionPct === 100 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-lime-500/10 backdrop-filter blur-sm flex flex-col items-center justify-center p-6 text-center"
                  >
                    <Award size={48} className="text-lime-400 mb-2 animate-bounce" />
                    <h4 className="text-white font-black text-lg">¡Operaciones Completadas!</h4>
                    <p className="text-xs text-lime-300 mt-1 max-w-[200px]">Has finalizado todas las tareas del Data Steward hoy. Excelente trabajo.</p>
                    <button 
                      onClick={handleResetTechTasks}
                      className="mt-3 bg-lime-500 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-lg border-none cursor-pointer"
                    >
                      Resetear Tareas
                  </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.classic_chartCard}>
              <div className={styles.classic_cardHeader}>
                <h3>Estadística de Tareas</h3>
              </div>
              <div className="flex items-center justify-center" style={{ minHeight: '180px' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={techPieData}
                      innerRadius={50}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {techPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-xs font-bold mt-2">
                <span className="text-lime-400">{completedCount} Listas</span>
                <span className="text-slate-400">{techTasks.length - completedCount} Restantes</span>
              </div>
            </div>

            <div className={styles.classic_chartCard}>
              <div className={styles.classic_cardHeader}>
                <h3>Logs de Seguridad</h3>
              </div>
              <div className={styles.classic_aiLog}>
                <div className={styles.classic_logItem}>
                  <span>[17:01:10] [ERROR] Pipeline &apos;ventas_sap&apos; falló debido a llave duplicada.</span>
                </div>
                <div className={`${styles.classic_logItem} ${styles.classic_logItemWarn}`}>
                  <span>[16:45:20] [WARN] Tablas sin descripción superaron el 15% de tolerancia.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (dashboardType === 'collaborative') {
      return (
        <div className={styles.classic_dashboardCollab}>
          <header className={styles.classic_header}>
            <div className={styles.classic_headerTitle}>
              <h1>Data Stewardship Portal</h1>
              <p>Bienvenido, {userName}. Centro de colaboración y gobernanza de datos.</p>
            </div>
            <div className={styles.classic_headerActions}>
              <button 
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md text-sm border-none cursor-pointer"
                onClick={() => setIsMeetingModalOpen(true)}
              >
                <Plus size={16} />
                Agendar Comité
              </button>
            </div>
          </header>

          <div className={styles.classic_statsGrid} style={{ marginTop: '24px' }}>
            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}>
                  <Users size={22} />
                </div>
                <span className="text-xs font-bold text-amber-700">Activos hoy</span>
              </div>
              <div className={styles.classic_cardValue}>8</div>
              <div className={styles.classic_cardTitle}>Data Owners</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.compliance}>
                    <Area type="monotone" dataKey="value" stroke="#d97706" fill="rgba(217, 119, 6, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                  <Zap size={22} />
                </div>
                <span className="text-xs font-bold text-emerald-700">En Curso</span>
              </div>
              <div className={styles.classic_cardValue}>5</div>
              <div className={styles.classic_cardTitle}>Flujos Aprobados</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.calidad}>
                    <Area type="monotone" dataKey="value" stroke="#10b981" fill="rgba(16, 185, 129, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                  <BookOpen size={22} />
                </div>
                <span className="text-xs font-bold text-blue-700">Políticas</span>
              </div>
              <div className={styles.classic_cardValue}>14</div>
              <div className={styles.classic_cardTitle}>Artículos de Gobierno</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.madurez}>
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.classic_premiumCard}>
              <div className={styles.classic_cardHeaderRow}>
                <div className={styles.classic_cardIconBox} style={{ backgroundColor: 'rgba(236, 72, 153, 0.08)', color: '#ec4899' }}>
                  <Calendar size={22} />
                </div>
                <span className="text-xs font-bold text-pink-700">Histórico</span>
              </div>
              <div className={styles.classic_cardValue}>12</div>
              <div className={styles.classic_cardTitle}>Comités Mensuales</div>
              <div className={styles.classic_sparklineWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={classicSparklineData.incidentes}>
                    <Area type="monotone" dataKey="value" stroke="#ec4899" fill="rgba(236, 72, 153, 0.03)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.classic_mainGrid} style={{ marginTop: '24px' }}>
            {/* Weekly audit hours graph - updates when timer is saved! */}
            <div className={styles.classic_chartCard}>
              <div className={styles.classic_cardHeader}>
                <div>
                  <h3>Horas de Auditoría Semanal</h3>
                  <p>Esfuerzo invertido en remediación de datos por Stewards</p>
                </div>
              </div>
              
              <div className={styles.classic_chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyHours as any[]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e0' }} />
                    <Bar dataKey="horas" fill="#d97706" radius={[8, 8, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Connected Pomodoro / Session Time Tracker */}
            <div className={styles.classic_sideCard}>
              <div className={styles.classic_cardHeader}>
                <h3>Sesión de Trabajo</h3>
                <p>Monitoreo y tracking en vivo</p>
              </div>
              <div className={styles.classic_timeTrackerWidget}>
                <h4>Auditoría de Activos</h4>
                <div className={styles.classic_timeDisplay}>{formatTimerTime(timerTime)}</div>
                <div className={styles.classic_trackerControls}>
                  <button 
                    className={styles.classic_iconBtn}
                    onClick={() => setTimerRunning(!timerRunning)}
                  >
                    {timerRunning ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button 
                    className={styles.classic_iconBtn}
                    onClick={() => { setTimerRunning(false); setTimerTime(0); }}
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
                <button 
                  onClick={handleRegisterHours}
                  className={styles.classic_registerHoursBtn}
                >
                  Registrar Horas a Hoy
                </button>
              </div>
            </div>
          </div>

          <div className={styles.classic_bottomGrid} style={{ marginTop: '24px' }}>
            {/* Calendar List */}
            <div className={styles.classic_chartCard}>
              <div className={styles.classic_cardHeader}>
                <h3>Próximos Comités</h3>
              </div>
              <div className={styles.classic_calList}>
                {meetings.map(m => (
                  <div key={m.id} className={styles.classic_calItem}>
                    <div className={styles.classic_calDateBox}>
                      <span className={styles.classic_calDay}>{m.date}</span>
                      <span className={styles.classic_calMonth}>{m.month}</span>
                    </div>
                    <div className={styles.classic_calInfo}>
                      <h4>{m.title}</h4>
                      <p>{m.time} • {m.type}</p>
                    </div>
                    <span className={styles.classic_calBadge} style={{ backgroundColor: m.bg, color: m.badgeColor }}>
                      Agendado
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stewards Scorecard / Leaderboard */}
            <div className={styles.classic_chartCard}>
              <div className={styles.classic_cardHeader}>
                <h3>Stewards del Mes</h3>
              </div>
              <div className={styles.classic_stewardsGrid}>
                {stewards.map(steward => (
                  <div key={steward.name} className={styles.classic_stewardCard}>
                    <div className={styles.classic_stewardAvatar} style={{ backgroundColor: steward.color }}>
                      {steward.initial}
                    </div>
                    <div className={styles.classic_stewardInfo}>
                      <h4>{steward.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className={styles.classic_stewardHoursText}>{steward.hours} hrs registradas</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{steward.points} pts</span>
                      </div>
                      <div className={styles.classic_stewardHoursBar}>
                        <div 
                          className={styles.classic_stewardProgress} 
                          style={{ width: `${(steward.hours / steward.maxHours) * 100}%`, backgroundColor: steward.color }}
                        ></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRecognizeSteward(steward.name)}
                      className={styles.classic_recognizeBtn}
                    >
                      ⭐
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Glossary Widget */}
            <div className={styles.classic_chartCard}>
              <div className={styles.classic_cardHeader}>
                <div>
                  <h3>Glosario de Términos</h3>
                  <p>Haz clic en las tarjetas para ver definiciones</p>
                </div>
              </div>
              <div className={styles.classic_glossaryContainer}>
                <div className={styles.classic_searchBarContainer}>
                  <Search size={16} className={styles.classic_searchIcon} />
                  <input 
                    type="text" 
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Buscar término de gobierno..."
                    className={styles.classic_searchInput}
                  />
                </div>

                <div className={styles.classic_glossaryGrid}>
                  {filteredGlossaryItems.map(item => {
                    const isFlipped = flippedGlossary.includes(item.term);
                    
                    return (
                      <div 
                        key={item.term} 
                        className={`${styles.classic_glossaryCard} ${isFlipped ? styles.classic_flipped : ''}`}
                        onClick={() => handleGlossaryFlip(item.term)}
                      >
                        <div className={styles.classic_glossaryCardInner}>
                          <div className={styles.classic_glossaryCardFront}>
                            <h4>{item.term}</h4>
                            <span>{item.tag}</span>
                          </div>
                          <div className={styles.classic_glossaryCardBack}>
                            <strong>{item.term}</strong>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Animated Framer-Motion Modal for adding meetings */}
          <AnimatePresence>
            {isMeetingModalOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.classic_modalOverlay}
                onClick={() => setIsMeetingModalOpen(false)}
              >
                <motion.div 
                  initial={{ y: 20, scale: 0.95 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 20, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className={styles.classic_modalContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.classic_modalHeader}>
                    <h3>Agendar Comité de Datos</h3>
                    <button className={styles.classic_modalCloseBtn} onClick={() => setIsMeetingModalOpen(false)}>
                      <X size={18} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateMeeting}>
                    <div className={styles.classic_modalBody}>
                      <div className={styles.classic_formGroup}>
                        <label className={styles.classic_formLabel}>Nombre del Comité / Sesión</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ej. Comité de Calidad de Datos"
                          value={newMeetingTitle}
                          onChange={(e) => setNewMeetingTitle(e.target.value)}
                          className={styles.classic_formInput}
                        />
                      </div>

                      <div className={styles.classic_formGroup}>
                        <label className={styles.classic_formLabel}>Steward Responsable</label>
                        <select 
                          value={newMeetingSteward}
                          onChange={(e) => setNewMeetingSteward(e.target.value)}
                          className={styles.classic_formSelect}
                        >
                          {stewards.map(s => (
                            <option key={s.name} value={s.name}>{s.name} ({s.role})</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.classic_formGroup}>
                        <label className={styles.classic_formLabel}>Hora Predeterminada</label>
                        <input 
                          type="text" 
                          placeholder="Ej. 10:00 AM"
                          value={newMeetingTime}
                          onChange={(e) => setNewMeetingTime(e.target.value)}
                          className={styles.classic_formInput}
                        />
                      </div>
                    </div>

                    <div className={styles.classic_modalFooter}>
                      <button 
                        type="button" 
                        onClick={() => setIsMeetingModalOpen(false)}
                        className={styles.classic_btnSecondary}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className={styles.classic_btnPrimary}
                      >
                        Agendar Comité
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
  }

  // ==========================================
  // RENDER PREMIUM MONEED DASHBOARD
  // ==========================================
  return (
    <div className={styles.container}>
      
      {/* Toast alert banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#0f172a',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '50px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              zIndex: 1000,
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={14} className="text-yellow-400 animate-spin" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Toolbar styled exactly like Moneed */}
      <header className={styles.toolbar}>
        <div className={styles.brandInfo}>
          <div className={styles.brandLogo}>G</div>
          <span className={styles.brandName}>GovData Nexus</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200/80 px-2 py-0.5 rounded font-black uppercase">
            {currentTenant?.name || 'Demo Corp'}
          </span>
        </div>

        <div className={styles.toolbarMenu}>
          <button 
            className={`${styles.menuPill} ${activeTab === 'dashboard' ? styles.menuPillActive : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`${styles.menuPill} ${activeTab === 'analytic' ? styles.menuPillActive : ''}`}
            onClick={() => {
              setActiveTab('analytic');
              triggerToast('📈 Cargando módulo analítico detallado...');
            }}
          >
            Analytic
          </button>
          <button 
            className={`${styles.menuPill} ${activeTab === 'history' ? styles.menuPillActive : ''}`}
            onClick={() => {
              setActiveTab('history');
              triggerToast('🕒 Cargando histórico de auditorías...');
            }}
          >
            History
          </button>
          <button 
            className={`${styles.menuPill} ${activeTab === 'report' ? styles.menuPillActive : ''}`}
            onClick={() => {
              setActiveTab('report');
              triggerToast('📋 Generando reporte ejecutivo...');
            }}
          >
            Report
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <button 
            onClick={() => setIsParamModalOpen(true)}
            className={styles.iconCircle}
            title="Parametrizar Tablero"
          >
            <Sliders size={18} />
          </button>
          
          <div className={styles.iconCircle} title="Notificaciones">
            <Bell size={18} />
          </div>

          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className={styles.userName}>{userName}</span>
          </div>
        </div>
      </header>

      {/* Grid Dashboard - Styled exactly like Moneed */}
      <div className={styles.gridDashboard}>
        
        {/* Card 1: Balance style card (span 6) */}
        <div className={`${styles.card} ${styles.cardBalance}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <Database size={16} className="text-blue-600" />
              {card1Metric === 'calidad' && 'Calidad de Datos Global'}
              {card1Metric === 'madurez' && 'Madurez de Gobernanza'}
              {card1Metric === 'compliance' && 'Cumplimiento de Políticas'}
            </span>
            <div className={styles.filterSelector}>
              <select className={styles.selectMini}>
                <option>USD</option>
                <option>CLP</option>
              </select>
              <select className={styles.selectMini}>
                <option>ALL TIME</option>
                <option>THIS MONTH</option>
              </select>
            </div>
          </div>

          <div className={styles.balanceRow}>
            <div>
              <div className={styles.hugeValue}>
                {isMetricHidden ? (
                  '••••••'
                ) : (
                  <>
                    {card1Metric === 'calidad' && `${qualityScore}%`}
                    {card1Metric === 'madurez' && `${dbKpis ? (parseFloat(dbKpis.maturity) / 20).toFixed(1) : '0.0'} / 5.0`}
                    {card1Metric === 'compliance' && `${dbKpis ? dbKpis.compliance : '0%'}`}
                  </>
                )}
                <button 
                  className={styles.eyeBtn}
                  onClick={() => setIsMetricHidden(!isMetricHidden)}
                >
                  <Eye size={14} />
                </button>
              </div>

              <div className={styles.balanceTrend}>
                <ArrowUpRight size={14} />
                {card1Metric === 'calidad' && '+12% Aumento de calidad, buen progreso.'}
                {card1Metric === 'madurez' && '+8.5% Evolución técnica vs último Q.'}
                {card1Metric === 'compliance' && '+4.2% Cumplimiento regulatorio.'}
              </div>
            </div>

            {/* Sparkline mini chart */}
            <div className={styles.sparklineArea}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={
                    card1Metric === 'calidad' ? sparklineData.calidad :
                    card1Metric === 'madurez' ? sparklineData.madurez : 
                    sparklineData.compliance
                  }
                >
                  <defs>
                    <linearGradient id="colorSp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.balanceActions}>
            <button className={styles.btnPillBlue} onClick={handleRunScan} disabled={isScanning}>
              {isScanning ? 'Escaneando...' : '+ Escanear Datos'}
            </button>
            <button className={styles.btnPillLight} onClick={() => triggerToast('📤 Exportando métricas...')}>
              Reportar
            </button>
          </div>
        </div>

        {/* Card 2: Income style card (span 3) */}
        <div className={`${styles.card} ${styles.cardIncome}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              {card2Metric === 'incidentes' ? 'Incidentes Mitigados' : 'Tablas Catalogadas'}
            </span>
            <select className={styles.selectMini}>
              <option>JUNIO 2025</option>
              <option>MAYO 2025</option>
            </select>
          </div>

          <div>
            <div className={styles.statValueRow}>
              <div className={styles.hugeValue}>
                {card2Metric === 'incidentes' 
                  ? (dbKpis ? dbKpis.incidents : '14')
                  : String(dashboardAssets.length)}
              </div>
              <span className={styles.tagGreen}>
                {card2Metric === 'incidentes' ? '+$456' : '+15%'}
              </span>
            </div>
            <p className={styles.statDescText} style={{ marginTop: '4px' }}>
              {card2Metric === 'incidentes' 
                ? 'Mitigaciones incrementadas en 9.1% respecto al mes pasado.'
                : 'Nuevos activos documentados automáticamente en base de datos.'
              }
            </p>
          </div>

          <div className={styles.statSubgrid}>
            <div className={styles.subStatItem}>
              <span className={styles.subStatLabel}>
                <span className={styles.subStatColorBar} style={{ backgroundColor: '#2563eb' }}></span>
                {card2Metric === 'incidentes' ? 'Críticos' : 'SQL'}
              </span>
              <span className={styles.subStatVal}>
                {card2Metric === 'incidentes' ? (dbKpis ? dbKpis.criticalIncidents : 8) : dashboardAssets.filter(a => a.type?.toLowerCase().includes('tabla') || a.type?.toLowerCase().includes('sql') || a.type?.toLowerCase().includes('vista')).length}
              </span>
            </div>

            <div className={styles.subStatItem}>
              <span className={styles.subStatLabel}>
                <span className={styles.subStatColorBar} style={{ backgroundColor: '#facc15' }}></span>
                {card2Metric === 'incidentes' ? 'Medios' : 'NoSQL'}
              </span>
              <span className={styles.subStatVal}>
                {card2Metric === 'incidentes' ? (dbKpis ? Math.max(0, Number(dbKpis.incidents) - (dbKpis.criticalIncidents || 0)) : 6) : Math.max(0, dashboardAssets.length - dashboardAssets.filter(a => a.type?.toLowerCase().includes('tabla') || a.type?.toLowerCase().includes('sql') || a.type?.toLowerCase().includes('vista')).length)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Expense style card (span 3) */}
        <div className={`${styles.card} ${styles.cardExpense}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              {card3Metric === 'riesgos' ? 'Riesgos Activos' : 'Tareas Stewards'}
            </span>
            <select className={styles.selectMini}>
              <option>JUNIO 2025</option>
              <option>MAYO 2025</option>
            </select>
          </div>

          <div>
            <div className={styles.statValueRow}>
              <div className={styles.hugeValue}>
                {card3Metric === 'riesgos' ? '3' : '7'}
              </div>
              <span className={styles.tagRed}>
                {card3Metric === 'riesgos' ? '+2' : '-3'}
              </span>
            </div>
            <p className={styles.statDescText} style={{ marginTop: '4px' }}>
              {card3Metric === 'riesgos' 
                ? 'Riesgos detectados en enmascaramientos PII.'
                : 'Tareas pendientes asignadas en workflows organizacionales.'
              }
            </p>
          </div>

          <div>
            {/* Segmented bar chart style from Moneed mockup */}
            <div className={styles.segmentedProgress}>
              <div className={styles.segmentBar} style={{ width: '50%', backgroundColor: '#0f172a' }}></div>
              <div className={styles.segmentBar} style={{ width: '32%', backgroundColor: '#2563eb' }}></div>
              <div className={styles.segmentBar} style={{ width: '18%', backgroundColor: '#a3e635' }}></div>
            </div>

            <div className={styles.segmentLabels}>
              <span>
                {card3Metric === 'riesgos' ? 'PII (50%)' : 'Catálogo (50%)'}
              </span>
              <span style={{ color: '#2563eb' }}>
                {card3Metric === 'riesgos' ? 'RLS' : 'Auditoría'}
              </span>
              <span style={{ color: '#84cc16' }}>
                {card3Metric === 'riesgos' ? 'API' : 'Seguridad'}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2 - Card 4: Circular arc gauge card (span 4) */}
        <div className={`${styles.card} ${styles.cardGoals}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              {card4Metric === 'auditoria' ? 'Metas de Auditoría' : 'Calidad RUT'}
            </span>
            <button className={styles.circleBtnMini} onClick={() => triggerToast('⚙️ Abriendo configuración de metas...')}>
              <Sliders size={12} />
            </button>
          </div>

          {/* Dark inner goals card with custom circular progress SVG */}
          <div className={styles.darkInnerCard}>
            <div className={styles.darkCardHeader}>
              <span>{card4Metric === 'auditoria' ? 'Weekly Audit' : 'Calidad RUT'}</span>
              <span>
                {card4Metric === 'auditoria' ? 'Meta: 20h' : 'Meta: 95%'}
              </span>
            </div>

            {/* SVG custom semi-circular arc gauge style */}
            <svg className={styles.svgGauge} viewBox="0 0 100 50">
              <path 
                className={styles.gaugeBackground} 
                d="M 10,50 A 40,40 0 0,1 90,50" 
              />
              <path 
                className={styles.gaugeFill} 
                d="M 10,50 A 40,40 0 0,1 90,50" 
                stroke="#2563eb"
                strokeDasharray="126"
                strokeDashoffset={
                  card4Metric === 'auditoria' 
                    ? 126 - (126 * (auditedHours / 20))
                    : 126 - (126 * (qualityScore / 100))
                }
              />
              <text x="50" y="42" className={styles.gaugeText}>
                {card4Metric === 'auditoria' ? `${auditedHours}h` : `${qualityScore}%`}
              </text>
              <text x="50" y="49" className={styles.gaugeSubtext}>
                {card4Metric === 'auditoria' ? 'acumuladas' : 'precisión'}
              </text>
            </svg>

            {card4Metric === 'auditoria' && (
              <button className={styles.promoBtn} onClick={handleAddAuditHours}>
                + Registrar Horas
              </button>
            )}
          </div>

          {/* Mini goals rows under the dark card */}
          <div className={styles.goalsList}>
            <div className={styles.goalRow}>
              <span className={styles.goalLabel}>
                {card4Metric === 'auditoria' ? 'Maria Garcia (Steward)' : 'Formatos RUT correctos'}
              </span>
              <span>{card4Metric === 'auditoria' ? '91%' : '85%'}</span>
              <div className={styles.goalProgress}>
                <div className={styles.goalBar} style={{ width: card4Metric === 'auditoria' ? '91%' : '85%', backgroundColor: '#2563eb' }}></div>
              </div>
            </div>

            <div className={styles.goalRow}>
              <span className={styles.goalLabel}>
                {card4Metric === 'auditoria' ? 'Juan Lopez (Steward)' : 'Valores Nulos Limpios'}
              </span>
              <span>{card4Metric === 'auditoria' ? '72%' : '60%'}</span>
              <div className={styles.goalProgress}>
                <div className={styles.goalBar} style={{ width: card4Metric === 'auditoria' ? '72%' : '60%', backgroundColor: '#10b981' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 - Card 5: Cashflow style Bar Chart (span 5) */}
        <div className={`${styles.card} ${styles.cardChart}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              {card5Metric === 'evolucion' ? 'Evolución de Gobierno' : 'Escaneos de Datos (GB)'}
            </span>
            <div className={styles.filterSelector}>
              <select className={styles.selectMini}>
                <option>2025</option>
                <option>2024</option>
              </select>
              <select className={styles.selectMini}>
                <option>6 MONTH</option>
                <option>3 MONTH</option>
              </select>
            </div>
          </div>

          <div style={{ width: '100%', height: '220px', marginTop: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={(card5Metric === 'evolucion' ? cashflowCalidadData : cashflowEscaneoData) as any[]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          backgroundColor: '#0f172a',
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginBottom: '4px' }}>
                            {data.month} 2025
                          </div>
                          {card5Metric === 'evolucion' ? (
                            <>
                              <div>Calidad: {data.calidad}%</div>
                              <div style={{ color: '#a3e635' }}>Madurez: {data.madurez}%</div>
                            </>
                          ) : (
                            <div>Escaneo: {data.escaneo} GB</div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {card5Metric === 'evolucion' ? (
                  <Bar dataKey="calidad" radius={[8, 8, 8, 8]}>
                    {cashflowCalidadData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 5 ? '#2563eb' : '#e5e7eb'} 
                      />
                    ))}
                  </Bar>
                ) : (
                  <Bar dataKey="escaneo" radius={[8, 8, 8, 8]}>
                    {cashflowEscaneoData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 5 ? '#2563eb' : '#e5e7eb'} 
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2 - Card 6: Stack Right side promo / small stats (span 3) */}
        <div className={styles.stackRight}>
          
          {/* Box 1: Promo box styled like "Join Pro Plan" */}
          <div className={styles.cardPromo}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-black uppercase">
                AI Insight
              </span>
              <button 
                className="text-slate-400 hover:text-slate-600"
                onClick={() => triggerToast('ℹ️ El asistente de inteligencia analiza la base de datos cada 24 horas.')}
              >
                <Info size={14} />
              </button>
            </div>
            
            <div className={styles.promoTitle}>
              Detección Predictiva de Anomalías AI
            </div>

            <button 
              className={styles.promoBtn}
              onClick={() => triggerToast('🤖 Escaneando anomalías predictivas... 0 encontradas hoy.')}
            >
              Iniciar Test
            </button>
          </div>

          {/* Box 2: Small stat box styled like "Today Received" */}
          <div className={styles.cardSmallStat}>
            <div>
              <span className={styles.smallStatLabel}>Puntos de Steward</span>
              <div className={styles.smallStatVal}>1,250 Pts</div>
            </div>
            <span className={styles.badgeSmallRed}>
              +12% hoy
            </span>
          </div>

          {/* Box 3: Document report action box */}
          <div 
            className={styles.cardActionBox}
            onClick={() => triggerToast('📥 Generando PDF de reporte de auditoría completo...')}
          >
            <div>
              <span className={styles.actionBoxTitle}>Reporte de Madurez</span>
              <div className={styles.actionBoxLabel}>Exportar y firmar reporte</div>
            </div>
            <div className={styles.circleBtnMini}>
              <Download size={14} />
            </div>
          </div>
        </div>

        {/* Row 3 - Card 7: Transaction history style table (span 12) */}
        <div className={`${styles.card} ${styles.cardTable}`}>
          <div className={styles.tableHeaderRow}>
            <span className={styles.cardTitle}>
              {card7Metric === 'escaneos' ? 'Historial de Escaneos de Calidad' : 'Logs e Incidentes de Seguridad'}
            </span>

            <div className="flex items-center gap-3">
              <div className={styles.searchWrapper}>
                <Search size={14} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar logs..." 
                  className={styles.searchInput}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>

              <select 
                value={card7Metric}
                onChange={e => setCard7Metric(e.target.value as any)}
                className={styles.selectMini}
              >
                <option value="escaneos">Ver Escaneos</option>
                <option value="seguridad">Ver Seguridad</option>
              </select>
            </div>
          </div>

          <table className={styles.transTable}>
            <thead>
              <tr>
                <th>{card7Metric === 'escaneos' ? 'Dataset / Tabla' : 'Incidente / Evento'}</th>
                <th>{card7Metric === 'escaneos' ? 'Volumen Registros' : 'Detalles / Origen'}</th>
                <th>Canal / Conector</th>
                <th>Fecha de Cierre</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(trans => (
                  <tr key={trans.id}>
                    <td>
                      <div className="font-extrabold text-slate-800">{trans.name}</div>
                    </td>
                    <td>{trans.amount}</td>
                    <td>
                      <div className={styles.methodCol}>
                        <div className={styles.methodIcon}>
                          <Database size={10} />
                        </div>
                        <span>{trans.method}</span>
                      </div>
                    </td>
                    <td className="text-slate-500 font-medium">{trans.date}</td>
                    <td>
                      <span className={trans.status === 'Complete' ? styles.tagStatusGreen : styles.tagStatusRed}>
                        {trans.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-6">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parameterization Config Overlay Modal */}
      <AnimatePresence>
        {isParamModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsParamModalOpen(false)}>
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Gestión Inteligente de Tarjetas (Moneed)</h2>
                <button className={styles.closeBtn} onClick={() => setIsParamModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <p className="text-xs text-slate-500 mb-2">Parametrice qué datos y KPIs corporativos se asignarán en cada espacio del tablero.</p>
                
                <div className={styles.formField}>
                  <label>Tarjeta 1: Métrica Principal (Balance)</label>
                  <select 
                    value={card1Metric}
                    onChange={e => setCard1Metric(e.target.value as any)}
                    className={styles.selectLarge}
                  >
                    <option value="calidad">Calidad de Datos Global (%)</option>
                    <option value="madurez">Madurez de Gobernanza (1.0 - 5.0)</option>
                    <option value="compliance">Cumplimiento de Políticas (%)</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Tarjeta 2: Métrica Secundaria A (Income)</label>
                  <select 
                    value={card2Metric}
                    onChange={e => setCard2Metric(e.target.value as any)}
                    className={styles.selectLarge}
                  >
                    <option value="incidentes">Incidentes Mitigados (Conteo)</option>
                    <option value="tablas">Tablas Catalogadas (Conteo)</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Tarjeta 3: Métrica Secundaria B (Expense)</label>
                  <select 
                    value={card3Metric}
                    onChange={e => setCard3Metric(e.target.value as any)}
                    className={styles.selectLarge}
                  >
                    <option value="riesgos">Riesgos Activos (Críticos / Medios)</option>
                    <option value="tareas">Tareas Pendientes de Stewards</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Tarjeta 4: Meta Circular (My Goals)</label>
                  <select 
                    value={card4Metric}
                    onChange={e => setCard4Metric(e.target.value as any)}
                    className={styles.selectLarge}
                  >
                    <option value="auditoria">Meta Semanal: Horas de Auditoría (20h)</option>
                    <option value="limpieza">Meta Diaria: Precisión Calidad RUT (95%)</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Tarjeta 5: Gráfico Principal (Cashflow)</label>
                  <select 
                    value={card5Metric}
                    onChange={e => setCard5Metric(e.target.value as any)}
                    className={styles.selectLarge}
                  >
                    <option value="evolucion">Evolución Semestral: Calidad de Datos</option>
                    <option value="escaneo">Evolución Semestral: Volumen Escaneo (GB)</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Tarjeta 7: Tabla de Datos (History)</label>
                  <select 
                    value={card7Metric}
                    onChange={e => setCard7Metric(e.target.value as any)}
                    className={styles.selectLarge}
                  >
                    <option value="escaneos">Historial de Escaneos de Calidad</option>
                    <option value="seguridad">Logs de Seguridad e Incidentes</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  className={styles.btnSecondary}
                  onClick={() => setIsParamModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  className={styles.btnPrimary}
                  onClick={() => {
                    setIsParamModalOpen(false);
                    triggerToast('💾 Configuración guardada y tablero parametrizado correctamente.');
                  }}
                >
                  Aplicar Parámetros
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
