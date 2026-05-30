'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';
import { 
  Rocket, Server, Building2, BrainCircuit, Activity, 
  ShieldCheck, FileText, CheckCircle2, ChevronRight, TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './launchpad.module.css';

const FRAMEWORKS = [
  { id: 'dama', name: 'DAMA-DMBOK', icon: <DatabaseIcon />, desc: 'Estándar global de gestión de datos' },
  { id: 'dcam', name: 'EDM Council DCAM', icon: <Building2 />, desc: 'Framework para el sector financiero' },
  { id: 'public', name: 'Gobierno Público', icon: <Server />, desc: 'Orientado a entidades estatales' },
  { id: 'health', name: 'Sector Salud (HIPAA)', icon: <Activity />, desc: 'Protección y gestión en salud' },
  { id: 'custom', name: 'Personalizado', icon: <BrainCircuit />, desc: 'A la medida de tu organización' }
];

import { QUESTIONS } from '@/lib/assessmentQuestions';

export default function Launchpad() {
  const router = useRouter();
  const { currentTenant } = usePlatform();
  const [step, setStep] = useState(1);
  
  // Step 1: Info
  const [companyInfo, setCompanyInfo] = useState({ sector: '', size: '', level: '' });
  // Step 2: Framework
  const [selectedFw, setSelectedFw] = useState('');
  // Step 3: Assessment
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState('Iniciando parametrización...');
  
  // Results
  const [finalScore, setFinalScore] = useState(0);

  const handleNext = async () => {
    if (step === 1) {
      if (!companyInfo.sector) return alert('Por favor, selecciona un sector.');
      setStep(2);
    } else if (step === 2) {
      if (!selectedFw) return alert('Selecciona un framework.');
      setStep(3);
    } else if (step === 3) {
      if (Object.keys(answers).length < QUESTIONS.length) {
        return alert('Responde todas las preguntas.');
      }
      setStep(4);
      await executeBootstrap();
    }
  };

  const handleAnswer = (val: number) => {
    setAnswers({ ...answers, [QUESTIONS[currentQIndex].id]: val });
    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const executeBootstrap = async () => {
    if (!currentTenant?.id) return;
    setIsProcessing(true);

    try {
      // 1. Calculate Score
      const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
      const answeredCount = Object.keys(answers).length;
      const normalizedTotal = totalScore - answeredCount;
      const maxScore = answeredCount * 4;
      const calcScore = answeredCount > 0 ? Math.round((normalizedTotal / maxScore) * 100) : 0;
      setFinalScore(calcScore);

      setProcessLog('Limpiando entorno actual (Reset a 0)...');
      await new Promise(r => setTimeout(r, 800));
      // Delete old data for clean state
      await supabase.from('maturity_assessments').delete().eq('tenant_id', currentTenant.id);
      await supabase.from('team_members').delete().eq('tenant_id', currentTenant.id);
      await supabase.from('team_domains').delete().eq('tenant_id', currentTenant.id);
      await supabase.from('data_policies').delete().eq('tenant_id', currentTenant.id);
      await supabase.from('data_assets').delete().eq('tenant_id', currentTenant.id);
      await supabase.from('workflow_requests').delete().eq('tenant_id', currentTenant.id);

      setProcessLog('Evaluando madurez base...');
      await new Promise(r => setTimeout(r, 800));
      
      // Insert Assessment
      const { error: err1 } = await supabase.from('maturity_assessments').insert([{
        tenant_id: currentTenant.id,
        dimension: 'GLOBAL',
        score: calcScore,
        answers: answers
      }]);
      if (err1) throw err1;

      // 2. Roles Base
      setProcessLog('Creando roles fundamentales (Owner, Steward, Custodio)...');
      await new Promise(r => setTimeout(r, 1200));
      const { error: err2 } = await supabase.from('team_members').insert([
        { tenant_id: currentTenant.id, name: 'Director de Datos', role: 'CDO', allocation: 100 },
        { tenant_id: currentTenant.id, name: 'Líder Negocio', role: 'Data Owner', allocation: 50 },
        { tenant_id: currentTenant.id, name: 'Experto Operativo', role: 'Data Steward', allocation: 50 },
        { tenant_id: currentTenant.id, name: 'Arquitecto TI', role: 'Data Custodian', allocation: 100 }
      ]);
      if (err2) throw err2;

      // 3. Dominios Base
      setProcessLog('Configurando dominios de datos corporativos...');
      await new Promise(r => setTimeout(r, 1000));
      const { error: err3 } = await supabase.from('team_domains').insert([
        { tenant_id: currentTenant.id, name: 'Clientes & CRM', priority: 'Alta' },
        { tenant_id: currentTenant.id, name: 'Finanzas', priority: 'Crítica' },
        { tenant_id: currentTenant.id, name: 'Talento Humano', priority: 'Media' },
        { tenant_id: currentTenant.id, name: 'Proveedores', priority: 'Media' }
      ]);
      if (err3) throw err3;

      // 4. Políticas Base
      setProcessLog('Generando políticas normativas predeterminadas...');
      await new Promise(r => setTimeout(r, 1200));
      const { error: err4 } = await supabase.from('data_policies').insert([
        { tenant_id: currentTenant.id, title: 'Política General de Gobierno de Datos', status: 'Borrador' },
        { tenant_id: currentTenant.id, title: 'Estándar de Calidad de Datos', status: 'Borrador' },
        { tenant_id: currentTenant.id, title: 'Normativa de Privacidad (PII)', status: 'En Revisión' }
      ]);
      if (err4) throw err4;

      // 5. Workflows Base + Roadmap de 90 Días Automático y Pre-carga de Activos
      setProcessLog('Generando Roadmap de 90 días basado en 100% del diagnóstico...');
      await new Promise(r => setTimeout(r, 1000));
      
      const roadmapTickets: any[] = [];
      const dataAssets: any[] = [];
      
      const getRoleForPillar = (pillar: string) => {
        const roles: Record<string, string> = {
          'estrategia': 'CDO',
          'organizacion': 'Data Owner',
          'calidad': 'Data Steward',
          'arquitectura': 'Data Custodian',
          'seguridad': 'CISO',
          'cumplimiento': 'Legal'
        };
        return roles[pillar] || 'CDO';
      };

      const getCategoryForPillar = (pillar: string) => {
        const cats: Record<string, string> = {
          'estrategia': 'Roadmap',
          'organizacion': 'Gobierno',
          'calidad': 'Calidad',
          'arquitectura': 'Catalogo',
          'seguridad': 'Seguridad',
          'cumplimiento': 'Politicas'
        };
        return cats[pillar] || 'Roadmap';
      };

      // Recorremos todas las preguntas de la evaluación para generar tareas precisas
      QUESTIONS.forEach(q => {
        const val = answers[q.id];
        if (!val) return;

        let title = '';
        let phase = 1;
        let priority = 'Media';

        if (val === 5) {
          title = `Digitalizar y cargar a plataforma: ${q.title.replace('¿', '').replace('?', '')}`;
          phase = 1;
          priority = 'Media';
        } else if (val === 3) {
          title = `Formalizar y estandarizar: ${q.title.replace('¿', '').replace('?', '')}`;
          phase = 2;
          priority = 'Alta';
        } else {
          title = `Diseñar e implementar: ${q.title.replace('¿', '').replace('?', '')}`;
          phase = 3;
          priority = 'Crítica';
        }

        const now = new Date();
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const targetMonth = new Date(now);
        if (phase === 2) targetMonth.setMonth(now.getMonth() + 1);
        if (phase === 3) targetMonth.setMonth(now.getMonth() + 2);
        
        const slaString = `Finales de ${monthNames[targetMonth.getMonth()]}`;

        roadmapTickets.push({
          tenant_id: currentTenant.id,
          title: `[Roadmap M${phase}] ${title}`,
          description: `Acción derivada del diagnóstico inicial. Puntaje actual: ${val}/5 en la pregunta: "${q.title}". Pilar: ${q.pillar}. | CATEGORY: ${getCategoryForPillar(q.pillar)} | PRIORITY: ${priority} | SLA: ${slaString}`,
          status: 'Pendiente'
        });
      });

      // 6. Pre-poblar el Catálogo si indicaron que tienen Catálogo o Datos Maestros
      if (answers['arq_1'] >= 3 || answers['arq_5'] >= 3) {
        setProcessLog('Inicializando activos de datos base según respuestas de arquitectura...');
        const baseAssetsCount = answers['arq_1'] === 5 ? 8 : 3;
        const qualityBase = answers['cal_1'] === 5 ? 95 : 60;
        const confBase = answers['seg_1'] === 5 ? 'Confidencial' : 'No Clasificado';
        const ownerBase = answers['org_1'] === 5 ? 'Data Owner' : 'Sin Asignar';

        for (let i = 1; i <= baseAssetsCount; i++) {
          dataAssets.push({
            tenant_id: currentTenant.id,
            code_id: `AST-INITIAL-${i}`,
            name: `Activo Crítico Pre-identificado ${i}`,
            type: 'Tabla SQL',
            source: 'Core System',
            owner: ownerBase,
            sensitivity: confBase,
            quality_score: qualityBase - (i * 2), // varían un poco
            status: 'Vigente',
            risk_level: confBase === 'Confidencial' ? 'Medio' : 'Alto'
          });
        }
      }

      // 7. Modificar estado de Políticas según Cumplimiento
      if (answers['cum_1'] === 5) {
        // Actualizamos las políticas insertadas para que sean Vigentes
        await supabase.from('data_policies').update({ status: 'Vigente' }).eq('tenant_id', currentTenant.id);
      } else if (answers['cum_1'] === 3) {
        await supabase.from('data_policies').update({ status: 'En Revisión' }).eq('tenant_id', currentTenant.id);
      }

      // Insertar masivamente Workflows y Activos (si aplica)
      if (dataAssets.length > 0) {
        const { error: err5 } = await supabase.from('data_assets').insert(dataAssets);
        if (err5) throw err5;
      }

      // Procesamos las solicitudes en bloques de 20 para evitar problemas de límite
      for (let i = 0; i < roadmapTickets.length; i += 20) {
        const { error: err6 } = await supabase.from('workflow_requests').insert(roadmapTickets.slice(i, i + 20));
        if (err6) throw err6;
      }

      setProcessLog('¡GovData Nexus inicializado exitosamente!');
      await new Promise(r => setTimeout(r, 800));
      setStep(5); // Show results

    } catch (e: any) {
      console.error('Error in bootstrap:', e);
      alert('Error en la parametrización automática: ' + (e.message || JSON.stringify(e)));
      setStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSteps = () => {
    return (
      <div className={styles.stepper}>
        <div className={styles.stepLine} />
        {['Empresa', 'Framework', 'Evaluación', 'Lanzamiento'].map((label, idx) => {
          const isActive = step === idx + 1;
          const isDone = step > idx + 1;
          return (
            <div key={label} className={`${styles.step} ${isActive ? styles.active : ''} ${isDone ? styles.completed : ''}`}>
              <div className={styles.stepDot}>{isDone ? <CheckCircle2 size={16} /> : idx + 1}</div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.wizardCard}>
        <div className={styles.glowBlob} />
        <div className={styles.content}>
          {getSteps()}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className={styles.header}>
                  <Rocket size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                  <h1 className={styles.title}>GovData Nexus Launchpad</h1>
                  <p className={styles.subtitle}>Asistente de implementación y parametrización Bootstrap</p>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <span className={styles.label}>Empresa Actual</span>
                    <input className={styles.input} type="text" value={currentTenant?.name || ''} disabled />
                  </div>
                  <div className={styles.inputGroup}>
                    <span className={styles.label}>Sector de Industria *</span>
                    <select className={styles.select} value={companyInfo.sector} onChange={e => setCompanyInfo({...companyInfo, sector: e.target.value})}>
                      <option value="">Selecciona...</option>
                      <option value="Financiero">Financiero / Banca</option>
                      <option value="Gobierno">Gobierno / Sector Público</option>
                      <option value="Salud">Salud</option>
                      <option value="Retail">Retail</option>
                      <option value="Tecnologia">Tecnología</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <span className={styles.label}>Tamaño (Empleados)</span>
                    <select className={styles.select} value={companyInfo.size} onChange={e => setCompanyInfo({...companyInfo, size: e.target.value})}>
                      <option value="">Selecciona...</option>
                      <option value="1-50">1 - 50</option>
                      <option value="51-500">51 - 500</option>
                      <option value="500+">Más de 500</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className={styles.header}>
                  <h1 className={styles.title}>Selección de Framework</h1>
                  <p className={styles.subtitle}>¿Qué marco de referencia guiará tu gobierno de datos?</p>
                </div>
                <div className={styles.frameworkGrid}>
                  {FRAMEWORKS.map(fw => (
                    <div 
                      key={fw.id} 
                      className={`${styles.frameworkCard} ${selectedFw === fw.id ? styles.selected : ''}`}
                      onClick={() => setSelectedFw(fw.id)}
                    >
                      <div className={styles.fwIcon}>{fw.icon}</div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{fw.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{fw.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className={styles.header} style={{ marginBottom: '24px' }}>
                  <h1 className={styles.title}>Evaluación Inicial</h1>
                  <p className={styles.subtitle}>Pregunta {currentQIndex + 1} de {QUESTIONS.length}</p>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.qTitle}>{QUESTIONS[currentQIndex].title}</div>
                  <div className={styles.optionsGrid}>
                    {QUESTIONS[currentQIndex].options.map((opt, i) => (
                      <button 
                        key={i} 
                        className={`${styles.optionBtn} ${answers[QUESTIONS[currentQIndex].id] === opt.score ? styles.selectedOption : ''}`}
                        onClick={() => handleAnswer(opt.score)}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={styles.loaderContainer}>
                <div className={styles.spinner} />
                <div className={styles.loadingText}>Arquitectando tu Gobierno de Datos...</div>
                <div className={styles.loadingLog}>{processLog}</div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className={styles.header}>
                  <h1 className={styles.title}>¡Configuración Completada!</h1>
                  <p className={styles.subtitle}>Tu instancia GovData Nexus está parametrizada y lista para operar.</p>
                </div>
                
                <div className={styles.resultGrid}>
                  <div className={styles.scoreCard}>
                    <span style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase' }}>Línea Base Inicial</span>
                    <div className={styles.scoreCircle}>
                      <span className={styles.scoreVal}>{finalScore}%</span>
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>Nivel: {finalScore < 50 ? 'Inicial / Bootstrap' : 'Gestionado'}</span>
                  </div>
                  
                  <div className={styles.roadmapCard}>
                    <div className={styles.roadTitle}><TrendingUp size={20} color="#6366f1" /> Roadmap Estratégico Generado (90 Días)</div>
                    <div className={styles.roadPhase}>
                      <div className={styles.phaseNum}>1</div>
                      <div className={styles.phaseContent}>
                        <h4>Fase 1: Gobierno Básico (30 días)</h4>
                        <p>Validar políticas borrador creadas automáticamente. Capacitar a los 4 roles asignados (Owner, Steward).</p>
                      </div>
                    </div>
                    <div className={styles.roadPhase}>
                      <div className={styles.phaseNum}>2</div>
                      <div className={styles.phaseContent}>
                        <h4>Fase 2: Control de Calidad (60 días)</h4>
                        <p>Conectar primer activo de datos al catálogo y resolver tickets pendientes en el Service Desk.</p>
                      </div>
                    </div>
                    <div className={styles.roadPhase} style={{ marginBottom: 0 }}>
                      <div className={styles.phaseNum}>3</div>
                      <div className={styles.phaseContent}>
                        <h4>Fase 3: Optimización (90 días)</h4>
                        <p>Monitorear Command Center 360 y elevar índice de calidad a &gt; 80%.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 4 && (
            <div className={styles.footer}>
              {step > 1 && step < 4 && <button className={styles.btnSec} onClick={() => setStep(step - 1)}>Atrás</button>}
              <button 
                className={styles.btnPri} 
                onClick={handleNext}
                disabled={step === 3 && Object.keys(answers).length < QUESTIONS.length && currentQIndex === QUESTIONS.length - 1}
              >
                {step === 3 && currentQIndex === QUESTIONS.length - 1 ? 'Iniciar Bootstrap' : 'Siguiente'} <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 5 && (
            <div className={styles.footer} style={{ justifyContent: 'center' }}>
              <button className={styles.btnPri} onClick={() => router.push('/command-center')}>
                Ir al Command Center 360 <Rocket size={18} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DatabaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  );
}
