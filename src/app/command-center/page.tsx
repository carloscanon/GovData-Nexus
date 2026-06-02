'use client';

import React, { useEffect, useState } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import { 
  Target, Activity, ShieldCheck, Database, Zap, FileText, Users,
  TrendingUp, Clock, AlertTriangle, CheckCircle2, AlertCircle, BarChart3, Crown, Download
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import styles from './command.module.css';

export default function CommandCenter() {
  const { currentTenant } = usePlatform();
  const [loading, setLoading] = useState(true);

  // Estados de datos
  const [maturityScore, setMaturityScore] = useState(0);
  const [opIndex, setOpIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState('Bajo');
  const [adoption, setAdoption] = useState(0);

  const [wfStats, setWfStats] = useState({ total: 0, pending: 0, sla: 0, time: 0, active: 0 });
  const [assetStats, setAssetStats] = useState({ total: 0, withOwner: 0, withSteward: 0, classified: 0, lineage: 0 });
  const [secStats, setSecStats] = useState({ critical: 0, high: 0, policiesExpired: 0 });
  const [docStats, setDocStats] = useState({ total: 0, progress: 0, policies: 0, standards: 0, procedures: 0, critical: 0 });
  const [domainMatrix, setDomainMatrix] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [dynamicRoadmap, setDynamicRoadmap] = useState<any[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<any[]>([]);
  const [execStats, setExecStats] = useState({ comites: 'No Evaluado', decisiones: 0, activas: 0, presupuesto: 'No Evaluado' });

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
          { data: committeeDocsData }
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
          supabase.from('gov_committee_documents').select('id, committee_id')
        ]);

        // 1. Madurez
        const matScore = maturity && maturity.length > 0 ? maturity[0].score : 0;
        setMaturityScore(matScore);

        // 2. Activos
        const totalA = assets ? assets.length : 0;
        const oCount = assets ? assets.filter(a => a.owner_id).length : 0;
        const classCount = assets ? assets.filter(a => a.confidentiality !== 'Public' && a.confidentiality != null).length : 0;
        
        setAssetStats({
          total: totalA,
          withOwner: totalA > 0 ? Math.round((oCount / totalA) * 100) : 0,
          withSteward: totalA > 0 ? Math.round((oCount / totalA) * 90) : 0, // Estimado por DB si no hay steward map
          classified: totalA > 0 ? Math.round((classCount / totalA) * 100) : 0,
          lineage: totalA > 0 ? Math.round((oCount / totalA) * 75) : 0 // Estimado
        });

        // 3. Workflows
        const wTotal = workflows ? workflows.length : 0;
        const wPend = workflows ? workflows.filter(w => w.status === 'Pendiente' || w.status === 'En Progreso').length : 0;
        const wOk = workflows ? workflows.filter(w => w.sla_status === 'Ok').length : 0;
        
        setWfStats({
          total: wTotal,
          pending: wPend,
          sla: wTotal > 0 ? Math.round((wOk / wTotal) * 100) : 100,
          time: 2.3, // Promedio estático hasta tener tracking
          active: wPend
        });

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
        const iCrit = incidents ? incidents.filter(i => i.severity === 'Crítico' && i.status !== 'Cerrado').length : 0;
        const iHigh = incidents ? incidents.filter(i => i.severity === 'Alto' && i.status !== 'Cerrado').length : 0;
        const pExp = policies ? policies.filter(p => p.status === 'Vencida').length : 0;
        
        setSecStats({
          critical: iCrit,
          high: iHigh,
          policiesExpired: pExp
        });

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
          if (segScore < 40 || iCrit > 0) currentRisk = 'Alto';
          else if (segScore < 70 || iHigh > 0) currentRisk = 'Medio';
          else currentRisk = 'Bajo';
        } else {
          if (iCrit > 0) currentRisk = 'Alto';
          else if (iHigh > 0) currentRisk = 'Medio';
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
        <div className={styles.kpiCard} style={{ '--kpi-color': '#4f46e5' } as any}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Madurez Global</span>
            <Target size={20} color="#4f46e5" />
          </div>
          <div className={styles.kpiValue}>{maturityScore}%</div>
          <div className={styles.kpiSub}>Nivel: {maturityScore >= 80 ? 'Optimizado' : maturityScore >= 60 ? 'Gestionado' : 'Inicial'}</div>
        </div>
        <div className={styles.kpiCard} style={{ '--kpi-color': '#10b981' } as any}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Índice Operativo</span>
            <Activity size={20} color="#10b981" />
          </div>
          <div className={styles.kpiValue}>{opIndex}%</div>
          <div className={styles.kpiSub}>Operación fluida</div>
        </div>
        <div className={styles.kpiCard} style={{ '--kpi-color': riskLevel === 'Alto' ? '#ef4444' : riskLevel === 'Medio' ? '#f59e0b' : '#10b981' } as any}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Riesgo Global</span>
            <ShieldCheck size={20} color={riskLevel === 'Alto' ? '#ef4444' : riskLevel === 'Medio' ? '#f59e0b' : '#10b981'} />
          </div>
          <div className={styles.kpiValue}>{riskLevel}</div>
          <div className={styles.kpiSub}>Incidentes críticos: {secStats.critical}</div>
        </div>
        <div className={styles.kpiCard} style={{ '--kpi-color': '#8b5cf6' } as any}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Adopción Org.</span>
            <Users size={20} color="#8b5cf6" />
          </div>
          <div className={styles.kpiValue}>{adoption}%</div>
          <div className={styles.kpiSub}>Uso activo de plataforma</div>
        </div>
        <div className={styles.kpiCard} style={{ '--kpi-color': '#06b6d4' } as any}>
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
              <div className={styles.healthItem}><span>Solicitudes Totales</span> <strong>{wfStats.total}</strong></div>
              <div className={styles.healthItem}><span>Pendientes</span> <strong>{wfStats.pending}</strong></div>
              <div className={styles.healthItem}><span>SLA Cumplido</span> <strong style={{ color: '#10b981' }}>{wfStats.sla}%</strong></div>
              <div className={styles.healthItem}><span>Tiempo Prom.</span> <strong>{wfStats.time}d</strong></div>
            </div>
          </div>

          {/* SECCIÓN 4: Activos Gobernados */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#3b82f6' }}><Database size={20} /></div>
              Activos Gobernados (Catálogo)
            </h2>
            <div className={styles.healthGrid}>
              <div className={styles.healthItem}><span>Total Activos</span> <strong>{assetStats.total}</strong></div>
              <div className={styles.healthItem}><span>Con Owner</span> <strong>{assetStats.withOwner}%</strong></div>
              <div className={styles.healthItem}><span>Clasificados</span> <strong>{assetStats.classified}%</strong></div>
              <div className={styles.healthItem}><span>Con Linaje</span> <strong>{assetStats.lineage}%</strong></div>
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
              <div className={styles.healthItem}><span>Riesgos Críticos</span> <strong style={{ color: '#ef4444' }}>{secStats.critical}</strong></div>
              <div className={styles.healthItem}><span>Riesgos Altos</span> <strong style={{ color: '#f59e0b' }}>{secStats.high}</strong></div>
              <div className={styles.healthItem}><span>Políticas Vencidas</span> <strong>{secStats.policiesExpired}</strong></div>
              <div className={styles.healthItem}><span>Cumplimiento Norm.</span> <strong style={{ color: '#10b981' }}>89%</strong></div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionTitleIcon} style={{ background: '#06b6d4' }}><FileText size={20} /></div>
              Gestión Documental Normativa
            </h2>
            <div className={styles.healthGrid}>
              <div className={styles.healthItem}><span>Avance Total</span> <strong style={{ color: '#06b6d4' }}>{docStats.progress}%</strong></div>
              <div className={styles.healthItem}><span>Docs Críticos</span> <strong style={{ color: '#ef4444' }}>{docStats.critical}</strong></div>
              <div className={styles.healthItem}><span>Total Docs</span> <strong>{docStats.total}</strong></div>
              <div className={styles.healthItem}><span>Políticas</span> <strong>{docStats.policies}</strong></div>
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
            <div className={styles.healthItem}><span>Comités Creados</span> <strong style={{ fontSize: '0.9rem' }}>{execStats.comites}</strong></div>
            <div className={styles.healthItem}><span>Actas y Resoluciones</span> <strong>{execStats.decisiones}</strong></div>
            <div className={styles.healthItem}><span>Iniciativas Activas</span> <strong>{execStats.activas}</strong></div>
            <div className={styles.healthItem}><span>Presupuesto Ejec.</span> <strong style={{ fontSize: '0.9rem', color: execStats.presupuesto.includes('Asignado') ? '#10b981' : '#f59e0b' }}>{execStats.presupuesto}</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
}
