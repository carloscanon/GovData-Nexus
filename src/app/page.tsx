'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  ArrowRight,
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
  Award
} from 'lucide-react';
import styles from './page.module.css';
import { usePlatform } from '@/contexts/PlatformContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

// Data for Executive Dashboard
const executiveDataMap = {
  semestral: [
    { name: 'Ene', calidad: 78, madurez: 45 },
    { name: 'Feb', calidad: 82, madurez: 48 },
    { name: 'Mar', calidad: 80, madurez: 52 },
    { name: 'Abr', calidad: 85, madurez: 55 },
    { name: 'May', calidad: 88, madurez: 60 },
    { name: 'Jun', calidad: 92, madurez: 64 },
  ],
  trimestral: [
    { name: 'Abr', calidad: 85, madurez: 55 },
    { name: 'May', calidad: 88, madurez: 60 },
    { name: 'Jun', calidad: 92, madurez: 64 },
  ],
  anual: [
    { name: 'Jul', calidad: 70, madurez: 40 },
    { name: 'Ago', calidad: 75, madurez: 42 },
    { name: 'Sep', calidad: 78, madurez: 45 },
    { name: 'Oct', calidad: 82, madurez: 48 },
    { name: 'Nov', calidad: 86, madurez: 52 },
    { name: 'Dic', calidad: 92, madurez: 64 },
  ]
};

// Sparkline Mock Data
const sparklineData = {
  madurez: [
    { value: 40 }, { value: 45 }, { value: 42 }, { value: 50 }, { value: 55 }, { value: 64 }
  ],
  calidad: [
    { value: 85 }, { value: 87 }, { value: 84 }, { value: 90 }, { value: 91 }, { value: 92.4 }
  ],
  compliance: [
    { value: 75 }, { value: 78 }, { value: 82 }, { value: 85 }, { value: 86 }, { value: 88 }
  ],
  incidentes: [
    { value: 20 }, { value: 18 }, { value: 15 }, { value: 16 }, { value: 14 }, { value: 12 }
  ]
};

const areaData = [
  { name: 'Ventas', value: 400, color: '#3b82f6' },
  { name: 'IT', value: 300, color: '#10b981' },
  { name: 'Finanzas', value: 300, color: '#f59e0b' },
  { name: 'RRHH', value: 200, color: '#6366f1' },
];

// Governance glossary items
const glossaryItems = [
  { term: 'Metadata', desc: 'Información estructurada que describe, explica o facilita la recuperación de recursos de información.', tag: 'Estructura' },
  { term: 'Data Asset', desc: 'Cualquier entidad de datos que posee valor para la organización (tablas, reportes, modelos).', tag: 'Activos' },
  { term: 'Linaje de Datos', desc: 'Ciclo de vida que describe el origen físico, transformaciones y destino final de la información.', tag: 'Flujo' },
  { term: 'PII', desc: 'Información Personal Identificable. Datos que pueden usarse para identificar de forma directa o indirecta a una persona.', tag: 'Seguridad' },
];

export default function Dashboard() {
  const { currentTenant } = usePlatform();
  const [userName, setUserName] = useState('Carlos');
  
  // Executive Dashboard State
  const [executivePeriod, setExecutivePeriod] = useState<'semestral' | 'trimestral' | 'anual'>('semestral');
  const [activeIncidentFilter, setActiveIncidentFilter] = useState<'Todos' | 'Crítico' | 'Medio'>('Todos');
  const [remediatingId, setRemediatingId] = useState<number | null>(null);
  const [remediatedIncidents, setRemediatedIncidents] = useState<number[]>([]);

  // Technical Dashboard State (FitSpark Style)
  const [scannedGb, setScannedGb] = useState(12.4);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [terminalSearch, setTerminalSearch] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  
  const [techTasks, setTechTasks] = useState([
    { id: 1, text: 'Revisar logs de base de datos PII', completed: true },
    { id: 2, text: 'Correr escaneo de calidad diario', completed: false },
    { id: 3, text: 'Revisar falsos positivos de RUT', completed: false },
    { id: 4, text: 'Establecer umbral de calidad en 85%', completed: true },
  ]);

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
  const [weeklyHours, setWeeklyHours] = useState([
    { day: 'Lun', horas: 6.1 },
    { day: 'Mar', horas: 4.5 },
    { day: 'Mie', horas: 7.2 },
    { day: 'Jue', horas: 5.8 },
    { day: 'Vie', horas: 8.0 },
  ]);

  // Stewards Leaderboard
  const [stewards, setStewards] = useState([
    { name: 'Juan Lopez', role: 'Data Owner', hours: 14.5, maxHours: 20, color: '#f59e0b', initial: 'JL', points: 120 },
    { name: 'Maria Garcia', role: 'Data Steward', hours: 18.2, maxHours: 20, color: '#10b981', initial: 'MG', points: 185 },
    { name: 'Carlos Canon', role: 'Data Steward', hours: 9.8, maxHours: 20, color: '#3b82f6', initial: 'CC', points: 95 },
  ]);

  // Fetch username from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('govdata_user_name');
      if (savedName) setUserName(savedName);
    }
  }, []);

  // Technical Dashboard Log Autoscroll
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [scanLogs]);

  // Technical: Simulate Scanner
  const startTechnicalScan = () => {
    if (isScanning) return;
    setIsScanning(true);
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
          setIsScanning(false);
          return 100;
        }
        
        // Add log at intervals
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
    setTechTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    );
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
    // Simulate hours: let's map 10 seconds of elapsed timer to 0.5 hours of audit work
    const addedHours = Number((timerTime / 10).toFixed(1));
    if (addedHours === 0) {
      alert('⚠️ Registra al menos un par de segundos en el timer.');
      return;
    }
    
    // Update chart
    setWeeklyHours(prev => 
      prev.map(dayObj => {
        if (dayObj.day === 'Vie') {
          return { ...dayObj, horas: Number((dayObj.horas + addedHours).toFixed(1)) };
        }
        return dayObj;
      })
    );

    // Update carlos' steward score hours
    setStewards(prev => 
      prev.map(steward => {
        if (steward.name.includes('Carlos')) {
          return { 
            ...steward, 
            hours: Math.min(Number((steward.hours + addedHours).toFixed(1)), 20),
            points: steward.points + Math.round(addedHours * 10)
          };
        }
        return steward;
      })
    );

    alert(`✅ Registradas con éxito ${addedHours} horas de auditoría a la cuenta de Carlos Canon para el día Viernes.`);
    setTimerRunning(false);
    setTimerTime(0);
  };

  // Collaborative: Recognize Steward
  const handleRecognizeSteward = (name: string) => {
    setStewards(prev => 
      prev.map(steward => {
        if (steward.name === name) {
          return { ...steward, points: steward.points + 25 };
        }
        return steward;
      })
    );
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

  const [meetings, setMeetings] = useState([
    { id: 1, title: 'Comité de Datos Semanal', date: '21', month: 'MAY', time: '10:00 AM', type: 'Comité', badgeColor: '#3b82f6', bg: '#eff6ff' },
    { id: 2, title: 'Revisión de Sensibilidad PII', date: '24', month: 'MAY', time: '02:30 PM', type: 'Revisión', badgeColor: '#f59e0b', bg: '#fffbeb' },
  ]);

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

    setMeetings(m => [...m, newMeeting]);
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

  // Active tenant and dashboard type selection
  const dashboardType = currentTenant?.dashboardType || 'executive';

  // ==========================================
  // RENDER EXECUTIVE DASHBOARD
  // ==========================================
  if (dashboardType === 'executive') {
    const currentData = executiveDataMap[executivePeriod];
    
    // Dynamic KPI stats based on period selection
    const kpis = {
      semestral: { quality: '92.4%', maturity: '64%', compliance: '88%', incidents: '12' },
      trimestral: { quality: '94.1%', maturity: '67%', compliance: '91%', incidents: '8' },
      anual: { quality: '89.2%', maturity: '58%', compliance: '85%', incidents: '18' }
    }[executivePeriod];

    const allIncidents = [
      { id: 1, title: 'Fuga detectada: PII en Logs', source: 'Azure Storage', severity: 'Crítico', date: '2026-05-19' },
      { id: 2, title: 'Calidad: Nulos en RUT', source: 'SQL Server', severity: 'Medio', date: '2026-05-18' }
    ];

    const filteredIncidents = activeIncidentFilter === 'Todos'
      ? allIncidents
      : allIncidents.filter(inc => inc.severity === activeIncidentFilter);

    // Subtract remediated incidents from the active KPI count
    const baseIncidents = parseInt(kpis.incidents);
    const activeIncidentsCount = Math.max(0, baseIncidents - remediatedIncidents.length);

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Executive Command Center</h1>
            <p>Bienvenido, {userName}. Control inteligente y analítica macro de gobernanza.</p>
          </div>
          
          <div className={styles.headerActions}>
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

            <button className={styles.secondaryBtn}>
              <Clock size={16} />
              Sincronizado: 10:45 AM
            </button>
          </div>
        </header>

        {/* Premium Stat Cards with Sparklines */}
        <div className={styles.statsGrid}>
          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(30, 58, 138, 0.08)', color: '#1e3a8a' }}>
                <TrendingUp size={22} />
              </div>
              <div className={`${styles.cardTrend} ${styles.positiveTrend}`}>
                <span>+12% vs Q1</span>
              </div>
            </div>
            <div className={styles.cardValue}>{kpis.maturity}</div>
            <div className={styles.cardTitle}>Madurez Global</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.madurez}>
                  <Area type="monotone" dataKey="value" stroke="#1e3a8a" fill="rgba(30, 58, 138, 0.03)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                <Activity size={22} />
              </div>
              <div className={`${styles.cardTrend} ${styles.positiveTrend}`}>
                <span>Meta: 95%</span>
              </div>
            </div>
            <div className={styles.cardValue}>{kpis.quality}</div>
            <div className={styles.cardTitle}>Calidad de Datos Promedio</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.calidad}>
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="rgba(16, 185, 129, 0.03)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                <ShieldCheck size={22} />
              </div>
              <div className={`${styles.cardTrend} ${styles.positiveTrend}`}>
                <span>+2.5%</span>
              </div>
            </div>
            <div className={styles.cardValue}>{kpis.compliance}</div>
            <div className={styles.cardTitle}>Compliance Score</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.compliance}>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.03)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
                <ShieldAlert size={22} />
              </div>
              <div className={`${styles.cardTrend} ${styles.negativeTrend}`} style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                <span>Bajo control</span>
              </div>
            </div>
            <div className={styles.cardValue}>{activeIncidentsCount}</div>
            <div className={styles.cardTitle}>Incidentes Activos</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.incidentes}>
                  <Area type="monotone" dataKey="value" stroke="#ef4444" fill="rgba(239, 68, 68, 0.03)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Evolución de Calidad vs Madurez</h3>
                <p>Análisis de madurez del ecosistema organizativo - Periodo {executivePeriod === 'anual' ? '2025' : '2024'}</p>
              </div>
              <div className={styles.legend}>
                <div className={styles.legendItem}><i style={{ backgroundColor: '#3b82f6' }}></i> Calidad</div>
                <div className={styles.legendItem}><i style={{ backgroundColor: '#94a3b8' }}></i> Madurez</div>
              </div>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={currentData}>
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

          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <h3>Distribución de Activos</h3>
              <p>Clasificados por área</p>
            </div>
            <div className={styles.chartWrapper} style={{ minHeight: '220px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={areaData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {areaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.incidentList} style={{ marginTop: '20px' }}>
                {areaData.map(area => (
                  <div key={area.name} className={styles.incidentItem} style={{ padding: '10px 14px' }}>
                    <div className={styles.statusDot} style={{ backgroundColor: area.color }}></div>
                    <div className={styles.incidentInfo}>
                      <h4 style={{ fontSize: '0.85rem' }}>{area.name}</h4>
                      <p style={{ fontSize: '0.75rem' }}>{(area.value / 12).toFixed(1)}% del total</p>
                    </div>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Incident Table Component */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
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

          <div className={styles.incidentTable}>
            <div className={`${styles.tableRow} ${styles.tableHeader}`}>
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
                    className={styles.tableRow}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`${styles.statusDot} ${isRemediated ? styles.green : (inc.severity === 'Crítico' ? styles.red : styles.yellow)}`}></div>
                    <div className={`${styles.tableCell} ${styles.titleCell}`}>{inc.title}</div>
                    <div className={styles.tableCell}>{inc.source}</div>
                    <div className={styles.tableCell}>{inc.date}</div>
                    <div>
                      {isRemediated ? (
                        <button className={`${styles.remediateBtn} ${styles.remediated}`}>
                          <Check size={14} style={{ marginRight: '4px', display: 'inline' }} />
                          Remediado
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRemediate(inc.id)}
                          className={styles.remediateBtn}
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

  // ==========================================
  // RENDER TECHNICAL DASHBOARD (FitSpark Style)
  // ==========================================
  if (dashboardType === 'technical') {
    return (
      <div className={styles.dashboardTech}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Technical Operations Dashboard</h1>
            <p>Hola, {userName}. Sistema Operativo de Datos y Escaneo en Vivo.</p>
          </div>
          <div className={styles.headerActions}>
            <button 
              className="bg-lime-500 hover:bg-lime-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-lime-500/20"
              onClick={startTechnicalScan}
              disabled={isScanning}
            >
              <Activity size={18} className={isScanning ? 'animate-spin' : ''} />
              {isScanning ? `Escaneando (${scanProgress}%)` : 'Iniciar Escaneo'}
            </button>
          </div>
        </header>

        {/* Custom Technical stats */}
        <div className={styles.statsGrid} style={{ marginTop: '24px' }}>
          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(132, 204, 22, 0.08)', color: '#84cc16' }}>
                <Cpu size={22} />
              </div>
              <span className="text-xs font-bold text-lime-400">Escaneos Activos</span>
            </div>
            <div className={styles.cardValue}>780</div>
            <div className={styles.cardTitle}>Reglas Ejecutadas</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.compliance}>
                  <Line type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
                <AlertTriangle size={22} />
              </div>
              <span className="text-xs font-bold text-red-400">Critico</span>
            </div>
            <div className={styles.cardValue}>3</div>
            <div className={styles.cardTitle}>Fallos del Servidor</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.incidentes}>
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                <Database size={22} />
              </div>
              <span className="text-xs font-bold text-blue-400">Postgres & MySQL</span>
            </div>
            <div className={styles.cardValue}>45</div>
            <div className={styles.cardTitle}>Tablas Registradas</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.madurez}>
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#a855f7' }}>
                <Activity size={22} />
              </div>
              <span className="text-xs font-bold text-purple-400">Storage</span>
            </div>
            <div className={styles.cardValue}>{scannedGb.toFixed(1)} GB</div>
            <div className={styles.cardTitle}>Volumen Monitoreado</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.calidad}>
                  <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid} style={{ marginTop: '24px' }}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
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
                  className={styles.searchLogsInput}
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
            
            <div className={styles.terminalContainer}>
              <div className={styles.terminalHeader}>
                <div className={styles.terminalDots}>
                  <div className={`${styles.terminalDot} ${styles.terminalDotRed}`}></div>
                  <div className={`${styles.terminalDot} ${styles.terminalDotYellow}`}></div>
                  <div className={`${styles.terminalDot} ${styles.terminalDotGreen}`}></div>
                </div>
                <div className={styles.terminalTitle}>steward@govdata: ~ops/scan</div>
                <div style={{ width: '50px' }}></div>
              </div>
              
              <div className={styles.terminalConsole} ref={consoleRef}>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={styles.scanLine} 
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
                {isScanning && <span className={styles.terminalCursor}></span>}
              </div>
            </div>

            {isScanning && (
              <div className="w-full bg-slate-850 h-2.5 rounded-full mt-4 overflow-hidden border border-lime-500/20">
                <div 
                  className="bg-lime-500 h-full transition-all duration-300"
                  style={{ width: `${scanProgress}%`, boxShadow: '0 0 10px #84cc16' }}
                ></div>
              </div>
            )}
          </div>

          {/* Interactive Crystal Cylinder Gauge */}
          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <h3>Volumen Escaneado</h3>
              <p>Meta del Día: 20 GB</p>
            </div>
            <div className={styles.cylinderContainer}>
              <div className={styles.cylinderGlass}>
                <div 
                  className={styles.cylinderWater} 
                  style={{ height: `${(scannedGb / 20.0) * 100}%` }}
                ></div>
                {/* Bubble elements inside cylinder */}
                <div className={styles.bubble} style={{ left: '20px', width: '6px', height: '6px', animationDelay: '0s', animationDuration: '4s' }}></div>
                <div className={styles.bubble} style={{ left: '50px', width: '8px', height: '8px', animationDelay: '1.2s', animationDuration: '3s' }}></div>
                <div className={styles.bubble} style={{ left: '80px', width: '5px', height: '5px', animationDelay: '0.5s', animationDuration: '5s' }}></div>
              </div>
              <div className={styles.cylinderValues}>
                <div className={styles.cylinderLabel}>BASE DE DATOS MONITOREADA</div>
                <div className={styles.cylinderMainVal}>{scannedGb.toFixed(1)} GB</div>
                <div className={styles.cylinderMeta}>
                  {scannedGb >= 20 ? '🎉 ¡Meta diaria completada!' : `${(20 - scannedGb).toFixed(1)} GB para la meta`}
                </div>
                <button 
                  onClick={() => setScannedGb(g => Math.min(g + 0.8, 20.0))}
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

        <div className={styles.bottomGrid} style={{ marginTop: '24px' }}>
          {/* Interactive checklist with completion celebration */}
          <div className={styles.chartCard} style={{ position: 'relative', overflow: 'hidden' }}>
            <div className={styles.cardHeader}>
              <h3>Chequeo Operativo Diario</h3>
              <span className="text-xs font-bold text-lime-400">{techCompletionPct}% Completado</span>
            </div>

            <div className={styles.checkGrid}>
              {techTasks.map(t => (
                <div 
                  key={t.id} 
                  className={`${styles.checkItem} ${t.completed ? styles.completed : ''}`}
                  onClick={() => toggleTechTask(t.id)}
                >
                  <div className={styles.checkbox}>
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
                    onClick={() => setTechTasks(prev => prev.map(t => t.id === 2 || t.id === 3 ? { ...t, completed: false } : t))}
                    className="mt-3 bg-lime-500 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-lg border-none cursor-pointer"
                  >
                    Resetear Tareas
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
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

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Logs de Seguridad</h3>
            </div>
            <div className={styles.aiLog}>
              <div className={styles.logItem}>
                <span>[17:01:10] [ERROR] Pipeline &apos;ventas_sap&apos; falló debido a llave duplicada.</span>
              </div>
              <div className={`${styles.logItem} ${styles.logItemWarn}`}>
                <span>[16:45:20] [WARN] Tablas sin descripción superaron el 15% de tolerancia.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER COLLABORATIVE DASHBOARD (Crextio Style)
  // ==========================================
  if (dashboardType === 'collaborative') {
    return (
      <div className={styles.dashboardCollab}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Data Stewardship Portal</h1>
            <p>Bienvenido, {userName}. Centro de colaboración y gobernanza de datos.</p>
          </div>
          <div className={styles.headerActions}>
            <button 
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md text-sm border-none cursor-pointer"
              onClick={() => setIsMeetingModalOpen(true)}
            >
              <Plus size={16} />
              Agendar Comité
            </button>
          </div>
        </header>

        <div className={styles.statsGrid} style={{ marginTop: '24px' }}>
          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}>
                <Users size={22} />
              </div>
              <span className="text-xs font-bold text-amber-700">Activos hoy</span>
            </div>
            <div className={styles.cardValue}>8</div>
            <div className={styles.cardTitle}>Data Owners</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.compliance}>
                  <Area type="monotone" dataKey="value" stroke="#d97706" fill="rgba(217, 119, 6, 0.03)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                <Zap size={22} />
              </div>
              <span className="text-xs font-bold text-emerald-700">En Curso</span>
            </div>
            <div className={styles.cardValue}>5</div>
            <div className={styles.cardTitle}>Flujos Aprobados</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.calidad}>
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="rgba(16, 185, 129, 0.03)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                <BookOpen size={22} />
              </div>
              <span className="text-xs font-bold text-blue-700">Políticas</span>
            </div>
            <div className={styles.cardValue}>14</div>
            <div className={styles.cardTitle}>Artículos de Gobierno</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.madurez}>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.03)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardIconBox} style={{ backgroundColor: 'rgba(236, 72, 153, 0.08)', color: '#ec4899' }}>
                <Calendar size={22} />
              </div>
              <span className="text-xs font-bold text-pink-700">Histórico</span>
            </div>
            <div className={styles.cardValue}>12</div>
            <div className={styles.cardTitle}>Comités Mensuales</div>
            <div className={styles.sparklineWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.incidentes}>
                  <Area type="monotone" dataKey="value" stroke="#ec4899" fill="rgba(236, 72, 153, 0.03)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid} style={{ marginTop: '24px' }}>
          {/* Weekly audit hours graph - updates when timer is saved! */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Horas de Auditoría Semanal</h3>
                <p>Esfuerzo invertido en remediación de datos por Stewards</p>
              </div>
            </div>
            
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyHours}>
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
          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <h3>Sesión de Trabajo</h3>
              <p>Monitoreo y tracking en vivo</p>
            </div>
            <div className={styles.timeTrackerWidget}>
              <h4>Auditoría de Activos</h4>
              <div className={styles.timeDisplay}>{formatTimerTime(timerTime)}</div>
              <div className={styles.trackerControls}>
                <button 
                  className={styles.iconBtn}
                  onClick={() => setTimerRunning(!timerRunning)}
                >
                  {timerRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button 
                  className={styles.iconBtn}
                  onClick={() => { setTimerRunning(false); setTimerTime(0); }}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
              <button 
                onClick={handleRegisterHours}
                className={styles.registerHoursBtn}
              >
                Registrar Horas a Hoy
              </button>
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid} style={{ marginTop: '24px' }}>
          {/* Calendar List */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Próximos Comités</h3>
            </div>
            <div className={styles.calList}>
              {meetings.map(m => (
                <div key={m.id} className={styles.calItem}>
                  <div className={styles.calDateBox}>
                    <span className={styles.calDay}>{m.date}</span>
                    <span className={styles.calMonth}>{m.month}</span>
                  </div>
                  <div className={styles.calInfo}>
                    <h4>{m.title}</h4>
                    <p>{m.time} • {m.type}</p>
                  </div>
                  <span className={styles.calBadge} style={{ backgroundColor: m.bg, color: m.badgeColor }}>
                    Agendado
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stewards Scorecard / Leaderboard */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Stewards del Mes</h3>
            </div>
            <div className={styles.stewardsGrid}>
              {stewards.map(steward => (
                <div key={steward.name} className={styles.stewardCard}>
                  <div className={styles.stewardAvatar} style={{ backgroundColor: steward.color }}>
                    {steward.initial}
                  </div>
                  <div className={styles.stewardInfo}>
                    <h4>{steward.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className={styles.stewardHoursText}>{steward.hours} hrs registradas</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{steward.points} pts</span>
                    </div>
                    <div className={styles.stewardHoursBar}>
                      <div 
                        className={styles.stewardProgress} 
                        style={{ width: `${(steward.hours / steward.maxHours) * 100}%`, backgroundColor: steward.color }}
                      ></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRecognizeSteward(steward.name)}
                    className={styles.recognizeBtn}
                  >
                    ⭐
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive flipping Glossary Widget */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Glosario de Términos</h3>
                <p>Haz clic en las tarjetas para ver definiciones</p>
              </div>
            </div>
            <div className={styles.glossaryContainer}>
              <div className={styles.searchBarContainer}>
                <Search size={16} className={styles.searchIcon} />
                <input 
                  type="text" 
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Buscar término de gobierno..."
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.glossaryGrid}>
                {filteredGlossaryItems.map(item => {
                  const isFlipped = flippedGlossary.includes(item.term);
                  
                  return (
                    <div 
                      key={item.term} 
                      className={`${styles.glossaryCard} ${isFlipped ? styles.flipped : ''}`}
                      onClick={() => handleGlossaryFlip(item.term)}
                    >
                      <div className={styles.glossaryCardInner}>
                        <div className={styles.glossaryCardFront}>
                          <h4>{item.term}</h4>
                          <span>{item.tag}</span>
                        </div>
                        <div className={styles.glossaryCardBack}>
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
              className={styles.modalOverlay}
              onClick={() => setIsMeetingModalOpen(false)}
            >
              <motion.div 
                initial={{ y: 20, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h3>Agendar Comité de Datos</h3>
                  <button className={styles.modalCloseBtn} onClick={() => setIsMeetingModalOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleCreateMeeting}>
                  <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nombre del Comité / Sesión</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Comité de Calidad de Datos"
                        value={newMeetingTitle}
                        onChange={(e) => setNewMeetingTitle(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Steward Responsable</label>
                      <select 
                        value={newMeetingSteward}
                        onChange={(e) => setNewMeetingSteward(e.target.value)}
                        className={styles.formSelect}
                      >
                        {stewards.map(s => (
                          <option key={s.name} value={s.name}>{s.name} ({s.role})</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Hora Predeterminada</label>
                      <input 
                        type="text" 
                        placeholder="Ej. 10:00 AM"
                        value={newMeetingTime}
                        onChange={(e) => setNewMeetingTime(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div className={styles.modalFooter}>
                    <button 
                      type="button" 
                      onClick={() => setIsMeetingModalOpen(false)}
                      className={styles.btnSecondary}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className={styles.btnPrimary}
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

  return null;
}
