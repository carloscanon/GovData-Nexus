'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Eye, 
  UserCheck, 
  AlertOctagon,
  CheckCircle,
  FileWarning,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  Search,
  Filter,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Shield,
  Info,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './security.module.css';

// --- MOCK DATA ---

const kpis = [
  { label: 'Riesgos Críticos', value: '3', trend: 'down', trendVal: '2', desc: 'Riesgos de impacto extremo.', color: '#ef4444', pct: 30 },
  { label: 'Activos Sensibles', value: '28', trend: 'up', trendVal: '5', desc: 'Datos PII detectados.', color: '#6366f1', pct: 45 },
  { label: 'Políticas Vencidas', value: '5', trend: 'neutral', trendVal: '0', desc: 'Revisión requerida.', color: '#f59e0b', pct: 20 },
  { label: 'Accesos Excesivos', value: '12', trend: 'down', trendVal: '3', desc: 'Privilegios no usados.', color: '#ec4899', pct: 60 },
  { label: 'Incidentes Abiertos', value: '4', trend: 'up', trendVal: '1', desc: 'Alertas en investigación.', color: '#8b5cf6', pct: 15 },
];

const risksData = [
  { 
    id: 'RSK-001', 
    name: 'Exposición Datos PII', 
    asset: 'Leads Marketing', 
    severity: 'Crítico', 
    impact: 'Alto', 
    probability: 'Alta', 
    status: 'Mitigando', 
    owner: 'Seguridad TI', 
    date: '2026-05-10',
    description: 'Se detectaron campos de identificación personal sin enmascarar en el entorno de desarrollo.',
    actionPlan: 'Implementar enmascaramiento dinámico y restringir acceso a solo usuarios autorizados.',
    controls: ['Cifrado en reposo', 'MFA Obligatorio']
  },
  { 
    id: 'RSK-002', 
    name: 'Accesos Admin Excesivos', 
    asset: 'Oracle DB Finanzas', 
    severity: 'Alto', 
    impact: 'Alto', 
    probability: 'Media', 
    status: 'Abierto', 
    owner: 'Gobierno Datos', 
    date: '2026-05-12',
    description: 'Más de 15 usuarios tienen privilegios de administrador en la base de datos de producción de finanzas.',
    actionPlan: 'Revisión de privilegios y aplicación del principio de mínimo privilegio (PoLP).',
    controls: ['PAM (Privileged Access Mgt)', 'Log de Auditoría']
  },
  { 
    id: 'RSK-003', 
    name: 'Política de Retención Vencida', 
    asset: 'Archivo General', 
    severity: 'Bajo', 
    impact: 'Bajo', 
    probability: 'Media', 
    status: 'En Revisión', 
    owner: 'Legal', 
    date: '2026-05-08',
    description: 'La política de retención de documentos no ha sido actualizada en los últimos 24 meses.',
    actionPlan: 'Actualización de política según nueva normativa Habeas Data.',
    controls: ['Revisiones Periódicas']
  },
];

const complianceData = [
  { name: 'Habeas Data (Ley 1581)', pct: 95, color: '#10b981' },
  { name: 'ISO 27001', pct: 82, color: '#6366f1' },
  { name: 'GDPR (Global)', pct: 70, color: '#f59e0b' },
  { name: 'NIST Framework', pct: 64, color: '#f97316' },
];

const accessData = [
  { user: 'Carlos Ruiz', role: 'Analista Jr', asset: 'Finanzas DB', level: 'Admin', activity: 'Hace 45 días', risk: 'Alto' },
  { user: 'Elena Marín', role: 'Consultor Ext', asset: 'Marketing Cloud', level: 'Editor', activity: 'Hoy', risk: 'Medio' },
  { user: 'Juan Pérez', role: 'DevOps', asset: 'AWS S3 Buckets', level: 'Admin', activity: 'Hace 2 horas', risk: 'Bajo' },
];

const incidentsData = [
  { id: 'INC-001', type: 'Fuga de Datos', description: 'Posible exfiltración de base de datos de marketing.', severity: 'Crítico', status: 'Investigando', date: 'Hace 2 horas' },
  { id: 'INC-002', type: 'Acceso Indebido', description: 'Intento de acceso fallido recurrente desde IP externa.', severity: 'Alto', status: 'Bloqueado', date: 'Ayer' },
  { id: 'INC-003', type: 'Malware Detectado', description: 'Detección de troyano en servidor de archivos.', severity: 'Medio', status: 'Mitigado', date: 'Hace 3 días' },
];

// --- COMPONENTS ---

export default function SecurityModule() {
  const [activeTab, setActiveTab] = useState('riesgos');
  const [selectedRisk, setSelectedRisk] = useState<any>(null);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [detailTab, setDetailTab] = useState('general');
  const [isRemediating, setIsRemediating] = useState(false);
  const [remediationProgress, setRemediationProgress] = useState(0);
  const [showRemediationSuccess, setShowRemediationSuccess] = useState(false);

  const handleRunRemediation = () => {
    setIsRemediating(true);
    setRemediationProgress(0);
    
    // Simular pasos de remediación
    const interval = setInterval(() => {
      setRemediationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRemediating(false);
            setShowRemediationSuccess(true);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const kpiExplanations: Record<string, string> = {
    'Riesgos Críticos': 'Se han identificado 3 riesgos con impacto Alto y probabilidad Alta, principalmente relacionados con la exposición de PII (Datos de Identificación Personal) en entornos de producción y accesos admin no supervisados.',
    'Activos Sensibles': '28 activos del catálogo han sido clasificados como "Confidencial" o "Restringido" debido a la presencia de datos sensibles (cédulas, correos, teléfonos) detectada automáticamente por el motor de clasificación de Nexus AI.',
    'Políticas Vencidas': '5 políticas de gobierno y seguridad (incluyendo Retención Documental y Gestión de Accesos) han superado su fecha de revisión anual de 24 meses y requieren actualización según la Ley 1581.',
    'Accesos Excesivos': 'Se detectaron 12 usuarios con privilegios de Administrador que no han tenido actividad en los últimos 30 días o que tienen niveles de acceso que no corresponden a su rol actual en el organigrama.',
    'Incidentes Abiertos': 'Hay 4 incidentes de seguridad activos: 1 Fuga de Datos (Investigación), 1 Acceso Indebido (Bloqueado), 1 Malware Detectado (Mitigado) y 1 Anomalía de Comportamiento.'
  };

  // Dynamic Heatmap Calculation
  const getHeatmapCount = (impact: string, prob: string) => {
    return risksData.filter(r => r.impact === impact && r.probability === prob).length;
  };

  // ── Consolidated Global Score Banner calculations ──
  const sciScore = Math.round(complianceData.reduce((acc, c) => acc + c.pct, 0) / complianceData.length);

  let levelText = 'CRÍTICO';
  let levelColor = '#ef4444';
  if (sciScore >= 88) {
    levelText = 'FUERTE';
    levelColor = '#10b981';
  } else if (sciScore >= 70) {
    levelText = 'PROTEGIDO';
    levelColor = '#6366f1';
  }

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (sciScore / 100) * circumference;

  const criticalRisksCount = risksData.filter(r => r.severity === 'Crítico' || r.severity === 'Alto').length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Seguridad y Riesgos</h1>
          <p>Gobierno de seguridad, cumplimiento normativo y gestión de riesgos corporativos.</p>
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
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
              <text x="60" y="55" textAnchor="middle" fill={levelColor} fontSize="22" fontWeight="900">
                {sciScore}%
              </text>
              <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                SEGURIDAD
              </text>
            </svg>
          </div>
          <div className={styles.globalInfo}>
            <div className={styles.globalLevel} style={{ color: levelColor }}>
              <Award size={20} /> {levelText}
            </div>
            <h2 className={styles.globalTitle}>Índice de Seguridad y Cumplimiento (SCI)</h2>
            <p className={styles.globalSub}>
              Evaluación ponderada de normativas Habeas Data, ISO 27001, GDPR y directrices NIST.
            </p>
          </div>
        </div>

        {/* Mini dimension pills */}
        <div className={styles.globalRight}>
          <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Riesgos Críticos', value: '3', explanation: kpiExplanations['Riesgos Críticos'] })}>
            <ShieldAlert size={14} />
            <span>Riesgos Críticos</span>
            <strong style={{ color: criticalRisksCount > 0 ? '#ef4444' : '#10b981' }}>{criticalRisksCount}</strong>
          </div>
          <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Activos Sensibles', value: '28', explanation: kpiExplanations['Activos Sensibles'] })}>
            <Lock size={14} />
            <span>Activos Sensibles</span>
            <strong style={{ color: '#6366f1' }}>28</strong>
          </div>
          <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Políticas Vencidas', value: '5', explanation: kpiExplanations['Políticas Vencidas'] })}>
            <FileWarning size={14} />
            <span>Políticas Vencidas</span>
            <strong style={{ color: '#f59e0b' }}>5</strong>
          </div>
          <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Accesos Excesivos', value: '12', explanation: kpiExplanations['Accesos Excesivos'] })}>
            <UserCheck size={14} />
            <span>Accesos Excesivos</span>
            <strong style={{ color: '#ec4899' }}>12</strong>
          </div>
          <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Incidentes Abiertos', value: incidentsData.length.toString(), explanation: kpiExplanations['Incidentes Abiertos'] })}>
            <Zap size={14} />
            <span>Incidentes Abiertos</span>
            <strong style={{ color: incidentsData.length > 0 ? '#ef4444' : '#10b981' }}>{incidentsData.length}</strong>
          </div>
          <div className={styles.miniPill}>
            <CheckCircle size={14} />
            <span>Cumplimiento SCI</span>
            <strong style={{ color: '#10b981' }}>{sciScore}%</strong>
          </div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <div className={styles.tabs}>
        {[
          { id: 'riesgos', label: 'Riesgos', icon: <ShieldAlert size={18} /> },
          { id: 'cumplimiento', label: 'Cumplimiento', icon: <CheckCircle size={18} /> },
          { id: 'accesos', label: 'Accesos', icon: <UserCheck size={18} /> },
          { id: 'incidentes', label: 'Incidentes', icon: <Zap size={18} /> },
          { id: 'politicas', label: 'Políticas', icon: <FileWarning size={18} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Left Content Area */}
        <div className={styles.leftColumn}>
          {activeTab === 'riesgos' && (
            <>
              <div className={styles.heatmapCard}>
                <div className={styles.cardTitle}>
                  <Activity className={styles.riskIcon} color="#4f46e5" />
                  <h3>Mapa de Calor de Riesgos Corporativos</h3>
                </div>
                <div className={styles.heatmapContainer}>
                  <div className={styles.heatmapGrid}>
                    {/* Dynamic 3x3 Heatmap */}
                    <div className={`${styles.heatmapCell} ${styles.critical}`} title="Alto/Alta">
                      {getHeatmapCount('Alto', 'Alta')}
                      <span className={styles.cellLabel}>Crítico</span>
                    </div>
                    <div className={`${styles.heatmapCell} ${styles.high}`} title="Medio/Alta">{getHeatmapCount('Medio', 'Alta')}</div>
                    <div className={`${styles.heatmapCell} ${styles.medium}`} title="Bajo/Alta">{getHeatmapCount('Bajo', 'Alta')}</div>
                    
                    <div className={`${styles.heatmapCell} ${styles.high}`} title="Alto/Media">{getHeatmapCount('Alto', 'Media')}</div>
                    <div className={`${styles.heatmapCell} ${styles.medium}`} title="Medio/Media">{getHeatmapCount('Medio', 'Media')}</div>
                    <div className={`${styles.heatmapCell} ${styles.low}`} title="Bajo/Media">{getHeatmapCount('Bajo', 'Media')}</div>
                    
                    <div className={`${styles.heatmapCell} ${styles.medium}`} title="Alto/Baja">{getHeatmapCount('Alto', 'Baja')}</div>
                    <div className={`${styles.heatmapCell} ${styles.low}`} title="Medio/Baja">{getHeatmapCount('Medio', 'Baja')}</div>
                    <div className={`${styles.heatmapCell} ${styles.low}`} title="Bajo/Baja">{getHeatmapCount('Bajo', 'Baja')}</div>
                  </div>
                  <div className={styles.heatmapLabels}>
                    <span>Impacto →</span>
                    <span>Probabilidad ↑</span>
                  </div>
                </div>
              </div>

              <div className={styles.sectionHeader}>
                <h2>Riesgos Identificados</h2>
                <button className={styles.viewBtn}>Nuevo Riesgo</button>
              </div>

              <div className={styles.riskTable}>
                <div className={styles.tableHeader}>
                  <span>ID</span>
                  <span>Nombre</span>
                  <span>Activo</span>
                  <span>Severidad</span>
                  <span>Estado</span>
                  <span></span>
                </div>
                {risksData.map(risk => (
                  <div key={risk.id} className={styles.riskRow}>
                    <span className={styles.riskId}>{risk.id}</span>
                    <span className={styles.riskName}>{risk.name}</span>
                    <div className={styles.riskAsset}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Database size={14} color="#64748b" /> {risk.asset}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#eef2ff', color: '#6366f1', borderRadius: '4px', fontWeight: 700 }}>PII</span>
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#fff1f2', color: '#e11d48', borderRadius: '4px', fontWeight: 700 }}>CONFIDENCIAL</span>
                        </div>
                      </div>
                    </div>
                    <span className={styles.sevBadge} style={{ 
                      background: risk.severity === 'Crítico' ? '#fef2f2' : risk.severity === 'Alto' ? '#fff7ed' : '#f0fdf4',
                      color: risk.severity === 'Crítico' ? '#ef4444' : risk.severity === 'Alto' ? '#f97316' : '#10b981'
                    }}>
                      {risk.severity}
                    </span>
                    <span className={styles.statusBadge} style={{ 
                      borderColor: '#e2e8f0',
                      color: '#64748b'
                    }}>
                      {risk.status}
                    </span>
                    <button className={styles.viewBtn} onClick={() => setSelectedRisk(risk)}>
                      Ver Detalles
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'incidentes' && (
            <div className={styles.assetList}>
              {incidentsData.map((inc, i) => (
                <motion.div 
                  key={inc.id}
                  className={styles.riskItem}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: inc.severity === 'Crítico' ? '#fef2f2' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertOctagon color={inc.severity === 'Crítico' ? '#ef4444' : '#64748b'} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{inc.type}</h4>
                        <span className={styles.sevBadge} style={{ 
                          background: inc.severity === 'Crítico' ? '#fef2f2' : '#f1f5f9',
                          color: inc.severity === 'Crítico' ? '#ef4444' : '#64748b',
                          fontSize: '0.65rem'
                        }}>{inc.severity}</span>
                      </div>
                      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>{inc.description}</p>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '12px' }}>
                         <span><Clock size={12} /> {inc.date}</span>
                         <span>•</span>
                         <span style={{ color: '#4f46e5', fontWeight: 600 }}>{inc.status}</span>
                      </div>
                    </div>
                  </div>
                  <button className={styles.viewBtn}>Investigar</button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'cumplimiento' && (
            <div className={styles.complianceGrid}>
              <div className={styles.sectionHeader}>
                <h2>Auditoría de Controles Normativos</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className={styles.viewBtn} style={{ padding: '8px 16px' }}>
                    <option>ISO 27001:2022</option>
                    <option>Habeas Data Ley 1581</option>
                    <option>GDPR</option>
                  </select>
                </div>
              </div>

              <div className={styles.riskTable}>
                <div className={styles.tableHeader}>
                  <span>Control ID</span>
                  <span>Nombre del Control</span>
                  <span>Estado</span>
                  <span>Última Eval.</span>
                  <span>Evidencia</span>
                </div>
                {[
                  { id: 'ISO-A.5.1', name: 'Políticas para la seguridad de la info.', status: 'OK', date: '2026-05-01', evidence: 'DOC-POL-01' },
                  { id: 'ISO-A.5.9', name: 'Inventario de activos de información', status: 'OK', date: '2026-05-01', evidence: 'NEXUS-CAT-01' },
                  { id: 'ISO-A.5.15', name: 'Clasificación de la información', status: 'Parcial', date: '2026-05-05', evidence: 'NEXUS-SEC-04' },
                  { id: 'ISO-A.8.1', name: 'Seguridad en el desarrollo (SDLC)', status: 'Falla', date: '2026-05-10', evidence: 'PENDIENTE' },
                  { id: 'ISO-A.8.10', name: 'Eliminación de información (Wipe)', status: 'OK', date: '2026-04-28', evidence: 'PROC-DEL-02' },
                ].map((ctrl, i) => (
                  <div key={i} className={styles.riskRow}>
                    <span className={styles.riskId}>{ctrl.id}</span>
                    <span className={styles.riskName}>{ctrl.name}</span>
                    <span className={styles.sevBadge} style={{ 
                      background: ctrl.status === 'OK' ? '#f0fdf4' : ctrl.status === 'Parcial' ? '#fffbeb' : '#fef2f2',
                      color: ctrl.status === 'OK' ? '#10b981' : ctrl.status === 'Parcial' ? '#f59e0b' : '#ef4444'
                    }}>
                      {ctrl.status === 'OK' ? 'CUMPLE' : ctrl.status === 'Parcial' ? 'PARCIAL' : 'NO CUMPLE'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{ctrl.date}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>
                      <ExternalLink size={12} /> {ctrl.evidence}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.methodology} style={{ marginTop: '24px' }}>
                <Info size={20} color="#4f46e5" />
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Los controles se evalúan automáticamente cruzando datos del <strong>Catálogo (A.5.9)</strong>, 
                  <strong>Calidad (A.5.15)</strong> y <strong>Workflows (A.8.1)</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'accesos' && (
            <div className={styles.riskTable}>
              <div className={styles.tableHeader}>
                <span>Usuario</span>
                <span>Rol</span>
                <span>Activo</span>
                <span>Nivel</span>
                <span>Actividad</span>
                <span>Riesgo</span>
              </div>
              {accessData.map((acc, i) => (
                <div key={i} className={styles.riskRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
                      <Users size={16} style={{ margin: '0 auto' }} />
                    </div>
                    <span className={styles.riskName}>{acc.user}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem' }}>{acc.role}</span>
                  <span className={styles.riskAsset}>{acc.asset}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{acc.level}</span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{acc.activity}</span>
                  <span className={styles.sevBadge} style={{ 
                    background: acc.risk === 'Alto' ? '#fef2f2' : '#f0fdf4',
                    color: acc.risk === 'Alto' ? '#ef4444' : '#10b981'
                  }}>{acc.risk}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'politicas' && (
            <div className={styles.riskTable}>
              <div className={styles.tableHeader}>
                <span>Referencia</span>
                <span>Nombre de Política</span>
                <span>Estado</span>
                <span>Responsable</span>
                <span>Vencimiento</span>
              </div>
              {[
                { ref: 'POL-SEC-01', name: 'Política de Protección de Datos', status: 'Vigente', owner: 'Legal', expiry: '2027-01-15' },
                { ref: 'POL-SEC-02', name: 'Retención Documental', status: 'Vencida', owner: 'Archivo', expiry: '2024-05-10' },
                { ref: 'POL-SEC-03', name: 'Gestión de Accesos y MFA', status: 'Vigente', owner: 'Seguridad TI', expiry: '2026-12-20' },
                { ref: 'POL-SEC-04', name: 'Cifrado y Llaves', status: 'En Revisión', owner: 'TI Infra', expiry: '2025-06-30' },
                { ref: 'POL-SEC-05', name: 'Backup y Recuperación', status: 'Vigente', owner: 'TI Infra', expiry: '2026-11-05' },
              ].map((pol, i) => (
                <div key={i} className={styles.riskRow}>
                  <span className={styles.riskId}>{pol.ref}</span>
                  <span className={styles.riskName}>{pol.name}</span>
                  <span className={styles.sevBadge} style={{ 
                    background: pol.status === 'Vigente' ? '#f0fdf4' : pol.status === 'Vencida' ? '#fef2f2' : '#fffbeb',
                    color: pol.status === 'Vigente' ? '#10b981' : pol.status === 'Vencida' ? '#ef4444' : '#f59e0b'
                  }}>{pol.status}</span>
                  <span style={{ fontSize: '0.85rem' }}>{pol.owner}</span>
                  <span style={{ fontSize: '0.85rem', color: pol.status === 'Vencida' ? '#ef4444' : '#64748b' }}>
                    {pol.expiry}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Column (Compliance) */}
        <div className={styles.rightColumn}>
          <div className={styles.sideCard}>
            <div className={styles.cardTitle}>
              <ShieldCheck className={styles.successIcon} color="#10b981" />
              <h3>Cumplimiento Normativo</h3>
            </div>
            <div className={styles.complianceList}>
              {complianceData.map((comp, idx) => (
                <div key={idx} className={styles.compItem}>
                  <div className={styles.compHeader}>
                    <span className={styles.compName}>{comp.name}</span>
                    <span className={styles.compPct}>{comp.pct}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <motion.div 
                      className={styles.progressFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${comp.pct}%` }}
                      style={{ background: comp.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.viewBtn} style={{ width: '100%', marginTop: '24px' }}>
              Ver Reporte Completo
            </button>
          </div>

          <div className={styles.sideCard} style={{ marginTop: '24px', background: '#1e293b', color: 'white', border: 'none' }}>
             <div className={styles.cardTitle}>
                <Zap size={20} color="#f59e0b" />
                <h3 style={{ color: 'white' }}>Nexus AI Insights</h3>
             </div>
             <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6 }}>
               Se detectaron <strong>3 usuarios huérfanos</strong> con acceso a Datos PII en Salesforce. Se recomienda revocación inmediata.
             </p>
              {!showRemediationSuccess ? (
                <button 
                  className={styles.primaryBtn} 
                  onClick={handleRunRemediation}
                  disabled={isRemediating}
                  style={{ 
                    background: isRemediating ? '#4b5563' : '#4f46e5', 
                    border: 'none', 
                    color: 'white', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    cursor: isRemediating ? 'not-allowed' : 'pointer', 
                    width: '100%', 
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isRemediating ? (
                    <>
                      <div className={styles.spinnerSmall}></div>
                      Remediando {remediationProgress}%
                    </>
                  ) : (
                    <>Ejecutar Remediación</>
                  )}
                </button>
              ) : (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', border: '1px solid #10b981', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShieldCheck size={18} color="#10b981" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Accesos Revocados Exitosamente</span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* KPI Explainer Modal */}
      <AnimatePresence>
        {selectedKPI && (
          <div className={styles.modalOverlay} onClick={() => setSelectedKPI(null)}>
            <motion.div 
              className={styles.modalContent}
              style={{ maxWidth: '500px' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader} style={{ background: selectedKPI.color, color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex' }}>
                     <ShieldAlert size={24} />
                   </div>
                   <h3 style={{ margin: 0, color: 'white' }}>{selectedKPI.label}</h3>
                </div>
                <button onClick={() => setSelectedKPI(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'white' }}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalBody} style={{ padding: '32px' }}>
                 <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>
                   {selectedKPI.explanation}
                 </p>
                 <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={20} color="#6366f1" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      Este valor se actualiza en tiempo real basado en el motor de escaneo de Nexus AI y el registro de riesgos.
                    </p>
                 </div>
              </div>
              <div className={styles.modalFooter}>
                 <button className={styles.viewBtn} style={{ background: '#4f46e5', color: 'white' }} onClick={() => setSelectedKPI(null)}>
                   Entendido
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Risk Detail Modal */}
      <AnimatePresence>
        {selectedRisk && (
          <div className={styles.modalOverlay} onClick={() => setSelectedRisk(null)}>
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <span className={styles.riskId}>{selectedRisk.id}</span>
                  <h2 style={{ margin: '8px 0', fontSize: '1.75rem' }}>{selectedRisk.name}</h2>
                  <div style={{ display: 'flex', gap: '12px' }}>
                     <span className={styles.sevBadge} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                       {selectedRisk.severity}
                     </span>
                     <span className={styles.statusBadge} style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                       {selectedRisk.status}
                     </span>
                  </div>
                </div>
                <button className={styles.closeBtn} onClick={() => setSelectedRisk(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.detailTabs}>
                {['general', 'activos', 'controles', 'plan', 'historial'].map(t => (
                  <div 
                    key={t}
                    className={`${styles.detailTab} ${detailTab === t ? styles.activeDetailTab : ''}`}
                    onClick={() => setDetailTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </div>
                ))}
              </div>

              <div className={styles.modalBody}>
                <div className={styles.tabContent}>
                  {detailTab === 'general' && (
                    <div className={styles.infoGrid}>
                      <div className={styles.infoField}>
                        <label>Descripción del Riesgo</label>
                        <div>{selectedRisk.description}</div>
                      </div>
                      <div className={styles.infoField}>
                        <label>Responsable</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={16} /> {selectedRisk.owner}
                        </div>
                      </div>
                      <div className={styles.infoField}>
                        <label>Impacto Estimado</label>
                        <div>{selectedRisk.impact}</div>
                      </div>
                      <div className={styles.infoField}>
                        <label>Probabilidad</label>
                        <div>{selectedRisk.probability}</div>
                      </div>
                    </div>
                  )}

                  {detailTab === 'plan' && (
                    <div className={styles.mitigationBox}>
                       <h5>Plan de Acción / Mitigación</h5>
                       <p style={{ color: '#166534', fontSize: '0.95rem', lineHeight: 1.6 }}>{selectedRisk.actionPlan}</p>
                       <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                          <button className={styles.viewBtn}>Actualizar Progreso</button>
                          <button className={styles.viewBtn} style={{ background: '#166534', color: 'white' }}>Cerrar Riesgo</button>
                       </div>
                    </div>
                  )}

                  {detailTab === 'controles' && (
                    <div className={styles.complianceList}>
                      {selectedRisk.controls.map((c: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                          <Shield size={18} color="#10b981" />
                          <span style={{ fontWeight: 600 }}>{c}</span>
                          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>VERIFICADO</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
