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
  Users
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import styles from './page.module.css';
import { usePlatform } from '@/contexts/PlatformContext';
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
  Bar
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

const areaData = [
  { name: 'Ventas', value: 400, color: '#3b82f6' },
  { name: 'IT', value: 300, color: '#10b981' },
  { name: 'Finanzas', value: 300, color: '#f59e0b' },
  { name: 'RRHH', value: 200, color: '#6366f1' },
];

export default function Dashboard() {
  const { currentTenant } = usePlatform();
  const [userName, setUserName] = useState('Carlos');
  
  // Executive Dashboard State
  const [executivePeriod, setExecutivePeriod] = useState<'semestral' | 'trimestral' | 'anual'>('semestral');
  const [activeIncidentFilter, setActiveIncidentFilter] = useState<'Todos' | 'Crítico' | 'Medio'>('Todos');

  // Technical Dashboard State (FitSpark Style)
  const [scannedGb, setScannedGb] = useState(12.4);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
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

  const [meetings, setMeetings] = useState([
    { id: 1, title: 'Comité de Datos Semanal', date: '21', month: 'MAY', time: '10:00 AM', type: 'Comité', badgeColor: '#3b82f6', bg: '#eff6ff' },
    { id: 2, title: 'Revisión de Sensibilidad PII', date: '24', month: 'MAY', time: '02:30 PM', type: 'Revisión', badgeColor: '#f59e0b', bg: '#fffbeb' },
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
    setScanLogs(['[INFO] Inicializando motor de escaneo GovData...']);

    const logsList = [
      '[INFO] Conectando a base de datos relacional...',
      '[SUCCESS] Conexión establecida con PostgreSQL (Schema: public).',
      '[INFO] Analizando metadatos de 45 tablas...',
      '[INFO] Evaluando reglas de calidad para tabla: data_assets...',
      '[SUCCESS] Tabla data_assets verificada: 0 nulos detectados.',
      '[INFO] Evaluando reglas de calidad para tabla: tenant_users...',
      '[WARN] Detectado campo "email" sin validación de formato en 2 registros.',
      '[INFO] Ejecutando algoritmo de enmascaramiento dinámico (PII)...',
      '[SUCCESS] Escaneo completado exitosamente.'
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
        if (currentStep < logsList.length && Math.random() > 0.4) {
          setScanLogs(l => [...l, logsList[currentStep]]);
          currentStep++;
        }

        return prev + 10;
      });
    }, 400);
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
    { name: 'Pendiente', value: techTasks.length - completedCount, color: '#334155' }
  ];

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

  // Collaborative: Add Meeting
  const handleAddMeeting = () => {
    const title = prompt('Nombre de la Sesión / Comité:');
    if (!title) return;
    
    const newMeeting = {
      id: Date.now(),
      title,
      date: (new Date().getDate() + 3).toString(),
      month: 'JUN',
      time: '11:00 AM',
      type: 'Sesión',
      badgeColor: '#10b981',
      bg: '#ecfdf5'
    };
    
    setMeetings(m => [...m, newMeeting]);
  };

  // Active tenant and dashboard type selection
  const dashboardType = currentTenant?.dashboardType || 'executive';

  // RENDER EXECUTIVE DASHBOARD
  if (dashboardType === 'executive') {
    const currentData = executiveDataMap[executivePeriod];
    
    // Dynamic KPI stats based on period selection
    const kpis = {
      semestral: { quality: '92.4%', maturity: '64%', compliance: '88%', incidents: '12' },
      trimestral: { quality: '94.1%', maturity: '67%', compliance: '91%', incidents: '8' },
      anual: { quality: '89.2%', maturity: '58%', compliance: '85%', incidents: '18' }
    }[executivePeriod];

    const allIncidents = [
      { id: 1, title: 'Fuga detectada: PII en Logs', source: 'Azure Storage', severity: 'Crítico', colorClass: styles.red },
      { id: 2, title: 'Calidad: Nulos en RUT', source: 'SQL Server', severity: 'Medio', colorClass: styles.yellow }
    ];

    const filteredIncidents = activeIncidentFilter === 'Todos'
      ? allIncidents
      : allIncidents.filter(inc => inc.severity === activeIncidentFilter);

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Executive Command Center</h1>
            <p>Bienvenido, {userName}. Visualización consolidada del ecosistema de datos.</p>
          </div>
          <div className={styles.headerActions}>
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              {(['semestral', 'trimestral', 'anual'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setExecutivePeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    executivePeriod === p 
                      ? 'bg-white text-blue-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className={styles.secondaryBtn} onClick={() => alert('Sincronizando...')}>
              <Clock size={18} />
              Sincronizado: 10:45 AM
            </button>
          </div>
        </header>

        <div className={styles.statsGrid}>
          <StatCard 
            title="Madurez Global" 
            value={kpis.maturity} 
            icon={TrendingUp} 
            trend={12} 
            trendLabel="Incremento vs Q1"
            color="#003366"
          />
          <StatCard 
            title="Calidad Promedio" 
            value={kpis.quality} 
            icon={Activity} 
            trend={4.2} 
            trendLabel="Meta: 95%"
            color="#10b981"
          />
          <StatCard 
            title="Compliance Score" 
            value={kpis.compliance} 
            icon={ShieldCheck} 
            trend={2.5} 
            trendLabel="Riesgos mitigados"
            color="#3b82f6"
          />
          <StatCard 
            title="Incidentes Activos" 
            value={kpis.incidents} 
            icon={ShieldAlert} 
            trend={-15} 
            trendLabel="Tendencia a la baja"
            color="#ef4444"
          />
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Evolución de Calidad vs Madurez</h3>
                <p>Desempeño del programa de gobierno - {executivePeriod === 'anual' ? '2025' : '2024'}</p>
              </div>
              <div className={styles.legend}>
                <div className={styles.legendItem}><i style={{ backgroundColor: '#3b82f6' }}></i> Calidad</div>
                <div className={styles.legendItem}><i style={{ backgroundColor: '#64748b' }}></i> Madurez</div>
              </div>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={currentData}>
                  <defs>
                    <linearGradient id="colorQual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="calidad" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorQual)" />
                  <Area type="monotone" dataKey="madurez" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <h3>Distribución de Activos</h3>
              <p>Por área de negocio</p>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={areaData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {areaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.incidentList} style={{ marginTop: '16px' }}>
                {areaData.map(area => (
                  <div key={area.name} className={styles.incidentItem}>
                    <div className={styles.statusDot} style={{ backgroundColor: area.color }}></div>
                    <div className={styles.incidentInfo}>
                      <h4>{area.name}</h4>
                      <p>{(area.value / 12).toFixed(1)}% del total</p>
                    </div>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Incidentes Activos</h3>
              <select 
                value={activeIncidentFilter} 
                onChange={(e) => setActiveIncidentFilter(e.target.value as any)}
                className="text-xs border border-slate-200 rounded p-1"
              >
                <option value="Todos">Todos</option>
                <option value="Crítico">Crítico</option>
                <option value="Medio">Medio</option>
              </select>
            </div>
            <div className={styles.incidentList}>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map(inc => (
                  <div key={inc.id} className={styles.incidentItem}>
                    <div className={`${styles.statusDot} ${inc.colorClass}`}></div>
                    <div className={styles.incidentInfo}>
                      <h4>{inc.title}</h4>
                      <p>{inc.source} • {inc.severity}</p>
                    </div>
                    <AlertTriangle size={18} className={styles.alertIcon} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No hay incidentes para este filtro.</p>
              )}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Certificación de Datos</h3>
            </div>
            <div className={styles.incidentList}>
              <div className={styles.incidentItem}>
                <CheckCircle2 size={20} color="#10b981" />
                <div className={styles.incidentInfo}>
                  <h4>Maestro Clientes</h4>
                  <p>Certificado por Auditoría</p>
                </div>
              </div>
              <div className={styles.incidentItem}>
                <Clock size={20} color="#f59e0b" />
                <div className={styles.incidentInfo}>
                  <h4>Ventas 2023</h4>
                  <p>En proceso de revisión</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Nexus AI Insights</h3>
              <Sparkles size={20} color="#3b82f6" />
            </div>
            <div className={styles.aiLog}>
              <div className={styles.logItem}>
                <Zap size={14} />
                <span>Optimización: Sugeridas 12 nuevas etiquetas para el catálogo.</span>
              </div>
              <div className={styles.logItem}>
                <ShieldCheck size={14} />
                <span>Seguridad: Detectado acceso inusual en Financiero.</span>
              </div>
              <div className={styles.logItem}>
                <Globe size={14} />
                <span>Linaje: Mapeadas 4 nuevas relaciones entre SAP y Salesforce.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER TECHNICAL DASHBOARD (FitSpark Style - Dark-Neon Green)
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
              className="bg-lime-500 hover:bg-lime-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md"
              onClick={startTechnicalScan}
              disabled={isScanning}
            >
              <Activity size={18} className={isScanning ? 'animate-spin' : ''} />
              {isScanning ? `Escaneando (${scanProgress}%)` : 'Iniciar Escaneo'}
            </button>
          </div>
        </header>

        <div className={styles.statsGrid} style={{ marginTop: '24px' }}>
          <StatCard 
            title="Reglas Ejecutadas" 
            value="780" 
            icon={Cpu} 
            trend={8.5} 
            trendLabel="Escaneos automáticos"
            color="#84cc16"
          />
          <StatCard 
            title="Escaneos Fallidos" 
            value="3" 
            icon={AlertTriangle} 
            trend={-40} 
            trendLabel="Mejora vs ayer"
            color="#ef4444"
          />
          <StatCard 
            title="Tablas en Catálogo" 
            value="45" 
            icon={Database} 
            trend={2.4} 
            trendLabel="+3 añadidas recientemente"
            color="#3b82f6"
          />
          <StatCard 
            title="Volumen Almacenado" 
            value={`${scannedGb.toFixed(1)} GB`} 
            icon={Activity} 
            trend={15.2} 
            trendLabel="Espacio monitoreado"
            color="#a855f7"
          />
        </div>

        <div className={styles.mainGrid} style={{ marginTop: '24px' }}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Consola de Escaneo en Vivo</h3>
                <p>Estatus de los pipelines de integración</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-500 animate-ping"></span>
                <span className="text-xs font-semibold text-lime-400">Live Connection</span>
              </div>
            </div>
            
            <div className={styles.scanConsole} ref={consoleRef}>
              {scanLogs.length > 0 ? (
                scanLogs.map((log, index) => (
                  <div key={index} className={styles.scanLine} style={{ color: log.startsWith('[SUCCESS]') ? '#22c55e' : log.startsWith('[WARN]') ? '#eab308' : '#a3e635' }}>
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-center py-10">
                  Consola inactiva. Haz clic en "Iniciar Escaneo" arriba a la derecha.
                </div>
              )}
            </div>

            {isScanning && (
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-lime-500 h-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <h3>Volumen Escaneado</h3>
              <p>Meta diaria: 20 GB</p>
            </div>
            <div className={styles.trackerWidget}>
              <h4>Consumo Diario</h4>
              <div className={styles.trackerValue}>{scannedGb.toFixed(1)} GB</div>
              <button 
                className={styles.trackerBtn}
                onClick={() => setScannedGb(g => Math.min(g + 0.8, 20.0))}
              >
                +
              </button>
              <div 
                className={styles.trackerWave} 
                style={{ height: `${(scannedGb / 20.0) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid} style={{ marginTop: '24px' }}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Chequeo Diario</h3>
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
              <h3>Logs de Calidad</h3>
            </div>
            <div className={styles.aiLog}>
              <div className={styles.logItem} style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', borderLeftColor: '#ef4444' }}>
                <span>[ERROR] Pipeline 'ventas_sap' falló debido a llave duplicada.</span>
              </div>
              <div className={styles.logItem} style={{ background: 'rgba(234,179,8,0.1)', color: '#fef08a', borderLeftColor: '#eab308' }}>
                <span>[WARN] Tablas sin descripción superaron el 15%.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER COLLABORATIVE DASHBOARD (Crextio Style - Light Warm / Sand glassmorphism)
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
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md text-sm"
              onClick={handleAddMeeting}
            >
              <Plus size={16} />
              Agendar Comité
            </button>
          </div>
        </header>

        <div className={styles.statsGrid} style={{ marginTop: '24px' }}>
          <StatCard 
            title="Data Stewards Activos" 
            value="8" 
            icon={Users} 
            trend={2} 
            trendLabel="Añadidos recientemente"
            color="#d97706"
          />
          <StatCard 
            title="Flujos Pendientes" 
            value="5" 
            icon={Zap} 
            trend={-25} 
            trendLabel="Tendencia al día"
            color="#10b981"
          />
          <StatCard 
            title="Políticas Publicadas" 
            value="14" 
            icon={BookOpen} 
            trend={1.2} 
            trendLabel="+1 esta semana"
            color="#3b82f6"
          />
          <StatCard 
            title="Comités Realizados" 
            value="12" 
            icon={Calendar} 
            trend={0} 
            trendLabel="Sesiones de gobierno"
            color="#ec4899"
          />
        </div>

        <div className={styles.mainGrid} style={{ marginTop: '24px' }}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Horas de Auditoría Semanal</h3>
                <p>Esfuerzo invertido en remediación de datos</p>
              </div>
            </div>
            
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { day: 'Lun', horas: 6.1 },
                  { day: 'Mar', horas: 4.5 },
                  { day: 'Mie', horas: 7.2 },
                  { day: 'Jue', horas: 5.8 },
                  { day: 'Vie', horas: 8.0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e0' }} />
                  <Bar dataKey="horas" fill="#d97706" radius={[8, 8, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <h3>Sesión de Trabajo</h3>
              <p>Auditoría de Activos en Vivo</p>
            </div>
            <div className={styles.timeTrackerWidget}>
              <h4>Auditoría Activa</h4>
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
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid} style={{ marginTop: '24px' }}>
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
                    Comité
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Nuevos Colaboradores</h3>
            </div>
            <div className={styles.incidentList}>
              <div className={styles.incidentItem}>
                <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center text-sm">
                  JL
                </div>
                <div className={styles.incidentInfo}>
                  <h4>Juan Lopez</h4>
                  <p>Asignado como Data Owner</p>
                </div>
              </div>
              <div className={styles.incidentItem}>
                <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  MG
                </div>
                <div className={styles.incidentInfo}>
                  <h4>Maria Garcia</h4>
                  <p>Asignado como Data Steward</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Historial de Cambios</h3>
            </div>
            <div className={styles.aiLog}>
              <div className={styles.logItem} style={{ background: '#f5f5f4', color: '#44403c', borderLeftColor: '#d97706' }}>
                <span>[POLÍTICA] Juan Lopez certificó el Catálogo de Proveedores.</span>
              </div>
              <div className={styles.logItem} style={{ background: '#f5f5f4', color: '#44403c', borderLeftColor: '#d97706' }}>
                <span>[WORKFLOW] Aprobado cambio de sensibilidad en 'Clientes VIP'.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
