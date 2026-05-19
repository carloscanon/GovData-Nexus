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
  Cell
} from 'recharts';

// Mock sparkline data
const sparklineData = {
  calidad: [{ v: 85 }, { v: 87 }, { v: 84 }, { v: 90 }, { v: 91 }, { v: 92.4 }],
  madurez: [{ v: 45 }, { v: 48 }, { v: 52 }, { v: 55 }, { v: 60 }, { v: 64 }],
  compliance: [{ v: 78 }, { v: 82 }, { v: 80 }, { v: 85 }, { v: 86 }, { v: 88 }]
};

export default function Dashboard() {
  const { currentTenant } = usePlatform();
  const [userName, setUserName] = useState('Carlos');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytic' | 'history' | 'report'>('dashboard');

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

  // Fetch username from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('govdata_user_name');
      if (savedName) setUserName(savedName);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      return updated;
    });
  };

  // Datasets for Recharts Cashflow style chart
  const cashflowCalidadData = [
    { month: 'Ene', calidad: 78, madurez: 45 },
    { month: 'Feb', calidad: 82, madurez: 48 },
    { month: 'Mar', calidad: 80, madurez: 52 },
    { month: 'Abr', calidad: 85, madurez: 55 },
    { month: 'May', calidad: 88, madurez: 60 },
    { month: 'Jun', calidad: 92.4, madurez: 64 },
  ];

  const cashflowEscaneoData = [
    { month: 'Ene', escaneo: 5.4 },
    { month: 'Feb', escaneo: 7.2 },
    { month: 'Mar', escaneo: 6.8 },
    { month: 'Abr', escaneo: 9.1 },
    { month: 'May', escaneo: 11.2 },
    { month: 'Jun', escaneo: 12.4 },
  ];

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
                    {card1Metric === 'madurez' && '3.8 / 5.0'}
                    {card1Metric === 'compliance' && '88.0%'}
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
            <button 
              className={styles.btnPillDark}
              onClick={() => { window.location.href = '/builder'; }}
            >
              Configurar Canvas
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
                {card2Metric === 'incidentes' ? '14' : '145'}
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
                {card2Metric === 'incidentes' ? '8' : '95'}
              </span>
            </div>

            <div className={styles.subStatItem}>
              <span className={styles.subStatLabel}>
                <span className={styles.subStatColorBar} style={{ backgroundColor: '#facc15' }}></span>
                {card2Metric === 'incidentes' ? 'Medios' : 'NoSQL'}
              </span>
              <span className={styles.subStatVal}>
                {card2Metric === 'incidentes' ? '6' : '50'}
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
