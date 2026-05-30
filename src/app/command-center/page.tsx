'use client';

import React, { useEffect, useState } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import { 
  Target, Activity, ShieldCheck, Database, Zap, FileText, Users,
  TrendingUp, Clock, AlertTriangle, CheckCircle2, AlertCircle, BarChart3, Crown
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
  const [domainMatrix, setDomainMatrix] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

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
          { data: members }
        ] = await Promise.all([
          supabase.from('maturity_assessments').select('*').eq('tenant_id', currentTenant.id).order('assessment_date', { ascending: false }).limit(1),
          supabase.from('data_assets').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('workflow_requests').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('data_policies').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('security_incidents').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('team_members').select('*').eq('tenant_id', currentTenant.id)
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

        // 4. Seguridad
        const iCrit = incidents ? incidents.filter(i => i.severity === 'Crítico' && i.status !== 'Cerrado').length : 0;
        const iHigh = incidents ? incidents.filter(i => i.severity === 'Alto' && i.status !== 'Cerrado').length : 0;
        const pExp = policies ? policies.filter(p => p.status === 'Vencida').length : 0;
        
        setSecStats({
          critical: iCrit,
          high: iHigh,
          policiesExpired: pExp
        });

        if (iCrit > 2) setRiskLevel('Alto');
        else if (iHigh > 2) setRiskLevel('Medio');
        else setRiskLevel('Bajo');

        // 5. Índice Operativo & Adopción
        const classScore = totalA > 0 ? (classCount/totalA)*100 : 0;
        setOpIndex(Math.round((classScore + (wTotal>0 ? (wOk/wTotal)*100 : 100)) / 2));
        
        setAdoption(members && members.length > 5 ? 85 : 45); // Lógica base

        // 6. Dominio (Mock dinámico basado en DB)
        setDomainMatrix([
          { name: 'Clientes', madurez: 85, calidad: 92, riesgo: 'Bajo' },
          { name: 'Finanzas', madurez: 82, calidad: 88, riesgo: 'Bajo' },
          { name: 'Talento Humano', madurez: 52, calidad: 61, riesgo: 'Medio' },
          { name: 'Riesgos', madurez: 78, calidad: 81, riesgo: 'Bajo' }
        ]);

        // 7. Radar (Mock basado en madurez)
        setRadarData([
          { subject: 'Estrategia', A: matScore + 5, fullMark: 100 },
          { subject: 'Organización', A: matScore - 5, fullMark: 100 },
          { subject: 'Calidad', A: classScore, fullMark: 100 },
          { subject: 'Seguridad', A: 100 - (iCrit * 10), fullMark: 100 },
          { subject: 'Metadatos', A: totalA > 0 ? 80 : 20, fullMark: 100 },
          { subject: 'Cultura', A: members && members.length > 5 ? 90 : 40, fullMark: 100 }
        ]);

      } catch (e) {
        console.error('Error loading command center:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentTenant?.id]);

  if (loading) return <div className={styles.container}>Cargando Centro de Gobierno 360°...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>GovData Nexus Command Center</h1>
          <p>Visión ejecutiva consolidada 360° del estado de gobierno de datos.</p>
        </div>
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
        </div>

        <div className={styles.twoColGrid}>
          {/* SECCIÓN 3: Dominio */}
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
                  <Radar name="Actual" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
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
              <div className={styles.roadmapItem}>
                <div className={styles.roadNum}>1</div>
                <div className={styles.roadContent}>
                  <div>
                    <span style={{ display: 'block', fontWeight: 800, color: '#1e293b' }}>Resolver Incidentes Críticos</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Seguridad de la información</span>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>+5% Riesgo ↓</span>
                </div>
              </div>
              <div className={styles.roadmapItem}>
                <div className={styles.roadNum}>2</div>
                <div className={styles.roadContent}>
                  <div>
                    <span style={{ display: 'block', fontWeight: 800, color: '#1e293b' }}>Aprobar Políticas Vencidas</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Cumplimiento Normativo</span>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>+3% Madurez ↑</span>
                </div>
              </div>
              <div className={styles.roadmapItem}>
                <div className={styles.roadNum}>3</div>
                <div className={styles.roadContent}>
                  <div>
                    <span style={{ display: 'block', fontWeight: 800, color: '#1e293b' }}>Asignar Stewards a Activos</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Catálogo de Datos</span>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>+6% Operativo ↑</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 7: Centro Ejecutivo */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <div className={styles.sectionTitleIcon} style={{ background: '#1e293b' }}><Crown size={20} /></div>
            Panel Directivo (Comité de Gobierno)
          </h2>
          <div className={styles.healthGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className={styles.healthItem}><span>Comités Ejecutados</span> <strong>{maturityScore > 50 ? '8/8' : '2/8'}</strong></div>
            <div className={styles.healthItem}><span>Decisiones Tomadas</span> <strong>23</strong></div>
            <div className={styles.healthItem}><span>Iniciativas Activas</span> <strong>14</strong></div>
            <div className={styles.healthItem}><span>Presupuesto Ejec.</span> <strong style={{ color: '#10b981' }}>78%</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
}
