'use client';

import React from 'react';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  ChevronRight,
  Zap,
  Shield,
  Search,
  Users,
  ShieldAlert,
  AlertTriangle,
  FileText,
  History,
  Briefcase,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Info
} from 'lucide-react';
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

const maturityData = [
  { subject: 'Estrategia', A: 85, B: 70, fullMark: 100 },
  { subject: 'Organización', A: 70, B: 65, fullMark: 100 },
  { subject: 'Calidad', A: 65, B: 80, fullMark: 100 },
  { subject: 'Arquitectura', A: 60, B: 75, fullMark: 100 },
  { subject: 'Seguridad', A: 80, B: 85, fullMark: 100 },
  { subject: 'Compliance', A: 75, B: 70, fullMark: 100 },
];

const evolutionData = [
  { name: 'Ene', score: 45, benchmark: 55 },
  { name: 'Feb', score: 48, benchmark: 55 },
  { name: 'Mar', score: 52, benchmark: 58 },
  { name: 'Abr', score: 58, benchmark: 60 },
  { name: 'May', score: 64, benchmark: 62 },
];

const dimensions = [
  { 
    id: 'estrategia', 
    name: 'Estrategia', 
    score: 85, 
    icon: Target, 
    status: 'Optimizado',
    capabilities: [
      { name: 'Visión de Gobierno', score: 90, type: 'auto' },
      { name: 'Políticas Definidas', score: 80, type: 'manual' },
      { name: 'Alineación Negocio', score: 85, type: 'manual' }
    ]
  },
  { 
    id: 'organizacion', 
    name: 'Organización', 
    score: 70, 
    icon: Users, 
    status: 'Gestionado',
    capabilities: [
      { name: 'Roles y Resp.', score: 75, type: 'auto' },
      { name: 'Data Owners', score: 60, type: 'auto' },
      { name: 'Comité de Gobierno', score: 75, type: 'manual' }
    ]
  },
  { 
    id: 'calidad', 
    name: 'Calidad', 
    score: 65, 
    icon: TrendingUp, 
    status: 'Definido',
    capabilities: [
      { name: 'Reglas de Calidad', score: 80, type: 'auto' },
      { name: 'Monitoreo Auto.', score: 50, type: 'auto' },
      { name: 'Gestión Incidentes', score: 65, type: 'auto' }
    ]
  },
  { 
    id: 'arquitectura', 
    name: 'Arquitectura', 
    score: 60, 
    icon: BarChart3, 
    status: 'Definido',
    capabilities: [
      { name: 'Modelado Datos', score: 70, type: 'manual' },
      { name: 'Integración', score: 50, type: 'auto' },
      { name: 'Linaje Técnico', score: 60, type: 'auto' }
    ]
  },
  { 
    id: 'seguridad', 
    name: 'Seguridad', 
    score: 80, 
    icon: Shield, 
    status: 'Gestionado',
    capabilities: [
      { name: 'Clasificación PII', score: 85, type: 'auto' },
      { name: 'Control Acceso', score: 75, type: 'auto' },
      { name: 'Auditoría', score: 80, type: 'manual' }
    ]
  },
];

export default function Maturity() {
  const [selectedDim, setSelectedDim] = React.useState<any>(null);
  const [activeView, setActiveView] = React.useState<'dashboard' | 'assessment' | 'roadmap' | 'history'>('dashboard');
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = React.useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);
  
  // Estado para la nueva evaluación
  const [assessmentStep, setAssessmentStep] = React.useState(1);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const handleAssessmentSubmit = () => {
    alert("✅ Evaluación procesada. El score de Organización ha subido a 75% debido a la formalización del comité.");
    setIsAssessmentModalOpen(false);
    setAssessmentStep(1);
  };

  // Dinámica de colores
  const [primaryColor, setPrimaryColor] = React.useState('#3b82f6');

  React.useEffect(() => {
    const savedColor = localStorage.getItem('govdata_brand_primary');
    if (savedColor) setPrimaryColor(savedColor);

    const handleStorageChange = () => {
      const updatedColor = localStorage.getItem('govdata_brand_primary');
      if (updatedColor) setPrimaryColor(updatedColor);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className={styles.container} style={{ ['--dynamic-primary' as any]: primaryColor }}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.breadcrumb}>Gobierno {' > '} Centro de Madurez</div>
          <h1>🚀 Centro de Evaluación de Madurez (GMF)</h1>
          <p>Basado en <strong>GovData Maturity Framework</strong>. Evaluación híbrida continua.</p>
        </div>
        <div className={styles.headerActions}>
           <button className={styles.secondaryBtn} onClick={() => setIsHistoryModalOpen(true)}><History size={18} /> Ver Evolución</button>
           <button className={styles.primaryBtn} onClick={() => setIsAssessmentModalOpen(true)}><Zap size={18} /> Nueva Evaluación</button>
        </div>
      </header>

      {/* KPIs Superiores */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <Target size={20} />
             <span>Nivel Actual</span>
          </div>
          <div className={styles.kpiValue}>3.2</div>
          <div className={styles.kpiSub}>Nivel: Definido</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <ArrowUpRight size={20} />
             <span>Benchmark Sector</span>
          </div>
          <div className={styles.kpiValue}>+15%</div>
          <div className={styles.kpiSub}>Vs Sector Financiero</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <ShieldAlert size={20} />
             <span>Riesgos Activos</span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#ef4444' }}>8</div>
          <div className={styles.kpiSub}>Baja madurez en Arq.</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <CheckCircle2 size={20} />
             <span>Capacidades</span>
          </div>
          <div className={styles.kpiValue}>24/30</div>
          <div className={styles.kpiSub}>Áreas evaluadas</div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          {/* Gráfico Radar de Madurez */}
          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <h3>Dimensiones de Gobierno</h3>
              <div className={styles.legend}>
                <span className={styles.legItem}><div className={styles.dot} style={{ background: '#3b82f6' }} /> Actual</span>
                <span className={styles.legItem}><div className={styles.dot} style={{ background: '#94a3b8' }} /> Industria</span>
              </div>
            </div>
            <div className={styles.radarContainer}>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={maturityData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <Radar
                    name="Actual"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Industria"
                    dataKey="B"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.1}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Listado de Dimensiones */}
          <div className={styles.dimensionsList}>
            {dimensions.map(dim => (
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
                  <span className={styles.dimScoreText}>{dim.score}%</span>
                  <ChevronRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={styles.rightColumn}>
          {selectedDim ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.detailPanel}
            >
              <div className={styles.detailHeader}>
                 <div className={styles.detailTitle}>
                    <selectedDim.icon size={24} />
                    <h2>Detalle de Dimensión: {selectedDim.name}</h2>
                 </div>
                 <div className={styles.detailScore}>
                    <span>Score</span>
                    <strong>{selectedDim.score}%</strong>
                 </div>
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
                         <span>{cap.score}%</span>
                      </div>
                      <div className={styles.capBarBg}>
                         <div className={styles.capBarFill} style={{ width: `${cap.score}%`, background: cap.score > 70 ? '#10b981' : cap.score > 40 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                   </div>
                 ))}
              </div>

              <div className={styles.findingsBox}>
                 <h3><AlertTriangle size={16} /> Hallazgos y Riesgos</h3>
                 <div className={styles.findingItem}>
                    <div className={styles.riskLevel} data-level="high" />
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.generalOverview}
            >
               <div className={styles.overviewHeader}>
                  <TrendingUp size={32} className={styles.overviewIcon} />
                  <div>
                    <h2>Resumen Ejecutivo de Madurez</h2>
                    <p>Estado general de las capacidades de gobierno organizacional.</p>
                  </div>
               </div>

               <div className={styles.distributionStats}>
                  <h3>Distribución de Madurez</h3>
                  <div className={styles.distGrid}>
                     {dimensions.map(d => (
                       <div key={d.id} className={styles.distItem}>
                          <div className={styles.distLabel}>
                             <d.icon size={16} />
                             <span>{d.name}</span>
                          </div>
                          <div className={styles.distBar}>
                             <div className={styles.distFill} style={{ width: `${d.score}%` }} />
                          </div>
                          <span className={styles.distValue}>{d.score}%</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className={styles.criticalFindings}>
                  <h3>🚨 Hallazgos Críticos Globales</h3>
                  <div className={styles.findingItem}>
                    <div className={styles.riskLevel} data-level="high" />
                    <p><strong>Arquitectura de Datos:</strong> Se detectaron 14 activos huérfanos sin owner definido en el dominio de Finanzas.</p>
                  </div>
                  <div className={styles.findingItem}>
                    <div className={styles.riskLevel} data-level="high" />
                    <p><strong>Seguridad:</strong> El 20% de los datos sensibles (PII) no tienen políticas de enmascaramiento activo.</p>
                  </div>
               </div>

               <div className={styles.nextSteps}>
                  <h3>Próximos Pasos Estratégicos</h3>
                  <div className={styles.stepCard}>
                     <div className={styles.stepNum}>1</div>
                     <p>Formalizar el Comité de Gobierno para elevar el score de <strong>Organización</strong>.</p>
                  </div>
                  <div className={styles.stepCard}>
                     <div className={styles.stepNum}>2</div>
                     <p>Ejecutar escaneo de calidad en el Maestro de Proveedores.</p>
                  </div>
               </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sección de Roadmap General */}
      <div className={styles.roadmapSection}>
         <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
               <Briefcase size={22} />
               <h2>Roadmap de Mejora Continua (90 Días)</h2>
            </div>
            <button className={styles.secondaryBtn}>Descargar PDF</button>
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

      {/* MODAL DE EVOLUCIÓN HISTÓRICA */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modalContent}
              style={{ width: '800px' }}
            >
              <div className={styles.modalHeader}>
                <h2>📈 Evolución Histórica de Madurez</h2>
                <button className={styles.closeBtn} onClick={() => setIsHistoryModalOpen(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.chartLegend}>
                  <div className={styles.legItem}><div className={styles.dot} style={{ background: '#3b82f6' }} /> GovData Score</div>
                  <div className={styles.legItem}><div className={styles.dot} style={{ background: '#94a3b8', border: '1px dashed #64748b' }} /> Benchmark Industria</div>
                </div>
                <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="benchmark" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.historyInsights}>
                   <div className={styles.insightCard}>
                      <TrendingUp size={20} style={{ color: '#10b981' }} />
                      <div>
                         <strong>Crecimiento sostenido</strong>
                         <p>Incremento del 42% en madurez desde Enero gracias a la automatización de reglas de calidad.</p>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE NUEVA EVALUACIÓN (CUESTIONARIO) */}
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
                  <span className={styles.stepIndicator}>Paso {assessmentStep} de 2</span>
                  <h2>Nueva Evaluación de Madurez</h2>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsAssessmentModalOpen(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                {assessmentStep === 1 ? (
                  <div className={styles.questionnaire}>
                    <h3>Dimensión: Organización y Roles</h3>
                    <div className={styles.question}>
                      <p>1. ¿Existe un Comité de Gobierno de Datos formalmente constituido?</p>
                      <div className={styles.options}>
                        {['Si, activo', 'En proceso', 'No existe'].map(opt => (
                          <button 
                            key={opt}
                            className={`${styles.optionBtn} ${answers.q1 === opt ? styles.activeOption : ''}`}
                            onClick={() => setAnswers({...answers, q1: opt})}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.question}>
                      <p>2. ¿Los Data Owners están capacitados y ejerciendo sus funciones?</p>
                      <div className={styles.options}>
                        {['Totalmente', 'Parcialmente', 'No capacitados'].map(opt => (
                          <button 
                            key={opt}
                            className={`${styles.optionBtn} ${answers.q2 === opt ? styles.activeOption : ''}`}
                            onClick={() => setAnswers({...answers, q2: opt})}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.questionnaire}>
                    <h3>Dimensión: Estrategia y Visión</h3>
                    <div className={styles.question}>
                      <p>3. ¿La estrategia de datos está alineada con los objetivos de negocio 2024?</p>
                      <div className={styles.options}>
                        {['Alineada', 'Desalineada', 'No existe estrategia'].map(opt => (
                          <button 
                            key={opt}
                            className={`${styles.optionBtn} ${answers.q3 === opt ? styles.activeOption : ''}`}
                            onClick={() => setAnswers({...answers, q3: opt})}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setIsAssessmentModalOpen(false)}>Cancelar</button>
                {assessmentStep === 1 ? (
                  <button className={styles.primaryBtn} onClick={() => setAssessmentStep(2)}>Siguiente</button>
                ) : (
                  <button className={styles.primaryBtn} onClick={handleAssessmentSubmit}>Finalizar Evaluación</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
