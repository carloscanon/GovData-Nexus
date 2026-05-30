'use client';

import { useEffect, useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  FileText,
  User,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Activity,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Filter,
  Search,
  MessageSquare,
  Paperclip,
  History,
  GitBranch,
  Shield,
  Layers,
  BookOpen,
  Award,
  Info,
  X,
  RefreshCw,
  GitMerge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './workflows.module.css';

interface WorkflowReq {
  id: string;
  title: string;
  requester: string;
  type: string;
  category: string;
  status: 'Pendiente' | 'En Revisión' | 'Aprobado' | 'Rechazado' | 'Escalado' | 'Cerrado';
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  date: string;
  sla: string;
  slaStatus: 'Ok' | 'Warning' | 'Overdue';
  description?: string;
  assignee?: string;
  currentStep: string;
  timeline: { step: string; user: string; date: string; status: string }[];
}

interface SlaRule {
  id: string;
  name: string;
  priority: string;
  domain: string;
  hours: number;
}



const auditEvents: any[] = [];

export default function Workflows() {
  const { mode, currentTenant } = usePlatform();
  const [requests, setRequests] = useState<WorkflowReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<WorkflowReq | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [modalTab, setModalTab] = useState('general');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);
  const [slaRules, setSlaRules] = useState<SlaRule[]>([]);
  const [newSlaRule, setNewSlaRule] = useState<Partial<SlaRule>>({ name: '', priority: 'Cualquiera', domain: 'General', hours: 48 });
  const [newReq, setNewReq] = useState({
    title: '',
    category: '',
    priority: 'Media',
    description: ''
  });

  const handleAddRequest = async () => {
    if (!newReq.title || !currentTenant?.id) return;
    
    // Auto-asignar SLA
    let assignedHours = 48;
    const matchingRules = slaRules.filter(r => 
      (r.priority === newReq.priority || r.priority === 'Cualquiera') &&
      (r.domain === newReq.category || r.domain === 'General')
    );
    if (matchingRules.length > 0) {
      assignedHours = Math.min(...matchingRules.map(r => r.hours));
    }

    const timeline = [
      { step: 'Solicitud Creada', user: 'Usuario Actual', date: new Date().toISOString().split('T')[0], status: 'done' }
    ];

    try {
      const { data, error } = await supabase.from('workflow_requests').insert([{
        tenant_id: currentTenant.id,
        title: newReq.title,
        description: newReq.description,
        category: newReq.category,
        priority: newReq.priority,
        status: 'Pendiente',
        sla: `${assignedHours}h`,
        sla_status: 'Ok',
        current_step: 'Validación Inicial',
        timeline: timeline
      }]).select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map snake_case to camelCase for UI
        const mappedReq = {
          ...data[0],
          requester: 'Usuario Actual',
          type: 'Solicitud Manual',
          date: new Date().toISOString().split('T')[0],
          slaStatus: data[0].sla_status,
          currentStep: data[0].current_step
        };
        setRequests([mappedReq, ...requests]);
      }
    } catch (e) {
      console.error('Error adding request:', e);
      alert('Error guardando el ticket en la base de datos.');
    }

    setIsNewRequestModalOpen(false);
    setNewReq({ title: '', category: '', priority: 'Media', description: '' });
  };

  const handleSaveChanges = async () => {
    if (!selectedReq || !currentTenant?.id) return;
    
    try {
      const { error } = await supabase.from('workflow_requests').update({
        status: selectedReq.status,
        sla_status: selectedReq.slaStatus,
        current_step: selectedReq.currentStep,
        timeline: selectedReq.timeline
      }).eq('id', selectedReq.id);

      if (error) throw error;
      
      const updated = requests.map(r => r.id === selectedReq.id ? selectedReq : r);
      setRequests(updated);
    } catch (e) {
      console.error('Error updating request:', e);
    }
    
    setSelectedReq(null);
  };

  const handleAddSlaRule = async () => {
    if (!newSlaRule.name || !newSlaRule.hours || !currentTenant?.id) return;
    
    try {
      const { data, error } = await supabase.from('sla_rules').insert([{
        tenant_id: currentTenant.id,
        name: newSlaRule.name,
        priority: newSlaRule.priority || 'Cualquiera',
        domain: newSlaRule.domain || 'General',
        hours: Number(newSlaRule.hours)
      }]).select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setSlaRules([...slaRules, data[0]]);
      }
    } catch (e) {
      console.error('Error adding SLA:', e);
    }
    setNewSlaRule({ name: '', priority: 'Cualquiera', domain: 'General', hours: 48 });
  };

  const handleDeleteSlaRule = async (id: string) => {
    if (!currentTenant?.id) return;
    try {
      const { error } = await supabase.from('sla_rules').delete().eq('id', id);
      if (error) throw error;
      setSlaRules(slaRules.filter(r => r.id !== id));
    } catch (e) {
      console.error('Error deleting SLA:', e);
    }
  };

  useEffect(() => {
    if (!currentTenant?.id) return;

    const fetchAllData = async () => {
      try {
        const [reqs, slas, doms, team] = await Promise.all([
          supabase.from('workflow_requests').select('*').eq('tenant_id', currentTenant.id).order('created_at', { ascending: false }),
          supabase.from('sla_rules').select('*').eq('tenant_id', currentTenant.id).order('created_at', { ascending: false }),
          supabase.from('team_domains').select('id, name').eq('tenant_id', currentTenant.id),
          supabase.from('team_members').select('id, name').eq('tenant_id', currentTenant.id)
        ]);

        if (reqs.data) {
          const mappedReqs = reqs.data.map(r => ({
            ...r,
            requester: r.requested_by ? 'Miembro Asignado' : 'Sistema', // Simplify for now
            type: 'Solicitud Sistema',
            date: new Date(r.created_at).toISOString().split('T')[0],
            slaStatus: r.sla_status,
            currentStep: r.current_step
          }));
          setRequests(mappedReqs as any);
        }

        if (slas.data) setSlaRules(slas.data as any);
        if (doms.data) setDomains(doms.data);
        if (team.data) setTeamMembers(team.data as any);
        
      } catch (e: any) {
        console.error('Error fetching workflows:', e);
        if (e.code === '42P01') {
          alert('Faltan tablas para Workflows. Por favor ejecuta el script de extensión SQL.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [currentTenant?.id]);

  const filteredRequests = requests.filter(req => {
    if (activeDomain && req.category !== activeDomain) return false;
    if (activeTab === 'pendientes') return req.status === 'Pendiente' || req.status === 'En Revisión';
    if (activeTab === 'mis') return req.requester === 'Usuario Actual'; // Simulación basada en creador real
    return true;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Crítica': return '#ef4444';
      case 'Alta': return '#f97316';
      case 'Media': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getSlaColor = (s: string) => {
    switch (s) {
      case 'Overdue': return '#ef4444';
      case 'Warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <GitMerge size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Centro de Operaciones de Gobierno</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Gestión centralizada de solicitudes, aprobaciones y cumplimiento de SLA.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
           <button className={styles.secondaryBtn} onClick={() => setIsSlaModalOpen(true)}><Clock size={16} /> Configurar SLAs</button>
           <button className={styles.secondaryBtn} onClick={() => setIsAuditModalOpen(true)}><History size={16} /> Auditoría Log</button>
           <button className={styles.primaryBtn} onClick={() => setIsNewRequestModalOpen(true)}><Plus size={16} /> Nueva Solicitud</button>
        </div>
      </header>

      {/* SLA Escalation Alert */}
      <AnimatePresence>
         {requests.some(r => r.slaStatus === 'Overdue') && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className={styles.escalationAlert}
            >
               <AlertTriangle size={20} />
               <span>Atención: Hay <strong>3 solicitudes</strong> con SLA vencido que requieren escalamiento inmediato.</span>
               <button className={styles.alertAction}>Ver Críticos</button>
            </motion.div>
         )}
      </AnimatePresence>

      {/* ── Consolidated Global Score Banner calculations ── */}
      {(() => {
        const totalRequests = requests.length;
        const pendingRequests = requests.filter(r => r.status === 'Pendiente' || r.status === 'En Revisión').length;
        const overdueRequests = requests.filter(r => r.slaStatus === 'Overdue').length;
        const approvedToday = requests.filter(r => r.status === 'Aprobado' || r.status === 'Cerrado').length;
        const escalatedRequests = requests.filter(r => r.status === 'Escalado').length;
        const incidentsCount = requests.filter(r => r.category === 'Calidad' || r.type.includes('Incidente')).length;

        const slaEfficiency = totalRequests > 0 ? Math.round((requests.filter(r => r.slaStatus !== 'Overdue').length / totalRequests) * 100) : 100;

        let levelText = 'CRÍTICO';
        let levelColor = '#ef4444';
        if (slaEfficiency >= 85) {
          levelText = 'EFICIENTE';
          levelColor = '#10b981';
        } else if (slaEfficiency >= 70) {
          levelText = 'ESTABLE';
          levelColor = '#6366f1';
        }

        const circumference = 2 * Math.PI * 52;
        const dashOffset = circumference - (slaEfficiency / 100) * circumference;

        const kpiExplanations: Record<string, string> = {
          'Pendientes': 'Solicitudes y flujos de trabajo que están esperando revisión o aprobación en este momento.',
          'SLA Vencidos': 'Operaciones que han superado el tiempo máximo de resolución definido en los Acuerdos de Nivel de Servicio (SLA).',
          'Aprobados Hoy': 'Flujos y solicitudes que han sido completados y cerrados satisfactoriamente en las últimas 24 horas.',
          'Escalados': 'Casos que han sido derivados a comités de gobierno o roles de nivel superior debido a su complejidad o urgencia.',
          'Incidentes': 'Alertas operacionales activas de calidad de datos, seguridad o infraestructura reportadas por Nexus AI.',
          'Eficiencia SLA': 'Porcentaje de solicitudes procesadas dentro de los tiempos de SLA establecidos, representando la salud operativa del gobierno.'
        };

        return (
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
                    {slaEfficiency}%
                  </text>
                  <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                    EFICIENCIA
                  </text>
                </svg>
              </div>
              <div className={styles.globalInfo}>
                <div className={styles.globalLevel} style={{ color: levelColor }}>
                  <Award size={20} /> {levelText}
                </div>
                <h2 className={styles.globalTitle}>Índice de Eficiencia Operativa (SLA)</h2>
                <p className={styles.globalSub}>
                  Porcentaje de solicitudes de gobierno y operaciones resueltas a tiempo según el acuerdo SLA corporativo.
                </p>
              </div>
            </div>

            {/* Mini dimension pills */}
            <div className={styles.globalRight}>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Pendientes', value: pendingRequests.toString(), explanation: kpiExplanations['Pendientes'], color: '#f59e0b' })}>
                <Clock size={14} color="#f59e0b" />
                <span>Pendientes</span>
                <strong style={{ color: '#f59e0b' }}>{pendingRequests}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'SLA Vencidos', value: overdueRequests.toString(), explanation: kpiExplanations['SLA Vencidos'], color: '#ef4444' })}>
                <AlertTriangle size={14} color="#ef4444" />
                <span>SLA Vencidos</span>
                <strong style={{ color: overdueRequests > 0 ? '#ef4444' : '#64748b' }}>{overdueRequests}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Aprobados Hoy', value: approvedToday.toString(), explanation: kpiExplanations['Aprobados Hoy'], color: '#10b981' })}>
                <CheckCircle size={14} color="#10b981" />
                <span>Aprobados Hoy</span>
                <strong style={{ color: '#10b981' }}>{approvedToday}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Escalados', value: escalatedRequests.toString(), explanation: kpiExplanations['Escalados'], color: '#8b5cf6' })}>
                <ShieldAlert size={14} color="#8b5cf6" />
                <span>Escalados</span>
                <strong style={{ color: '#8b5cf6' }}>{escalatedRequests}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Incidentes', value: incidentsCount.toString(), explanation: kpiExplanations['Incidentes'], color: '#3b82f6' })}>
                <Activity size={14} color="#3b82f6" />
                <span>Incidentes</span>
                <strong style={{ color: '#3b82f6' }}>{incidentsCount}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Eficiencia SLA', value: `${slaEfficiency}%`, explanation: kpiExplanations['Eficiencia SLA'], color: '#06b6d4' })}>
                <Award size={14} color="#06b6d4" />
                <span>Cumplimiento SLA</span>
                <strong style={{ color: '#06b6d4' }}>{slaEfficiency}%</strong>
              </div>
            </div>
          </motion.div>
        );
      })()}

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
           <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>Bandejas</h4>
              <button className={`${styles.sideTab} ${activeTab === 'pendientes' && !activeDomain ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('pendientes'); setActiveDomain(null); }}>
                 <Clock size={16} /> Pendientes <span className={styles.count}>{requests.filter(r => r.status === 'Pendiente' || r.status === 'En Revisión').length}</span>
              </button>
              <button className={`${styles.sideTab} ${activeTab === 'mis' ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('mis'); setActiveDomain(null); }}>
                 <User size={16} /> Mis Solicitudes <span className={styles.count}>{requests.filter(r => r.requester === 'Usuario Actual').length}</span>
              </button>
              <button className={`${styles.sideTab} ${activeTab === 'historial' ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('historial'); setActiveDomain(null); }}>
                 <History size={16} /> Historial
              </button>
           </div>

           <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>Dominios</h4>
              {domains.map(domain => (
                <button 
                  key={domain.id}
                  className={`${styles.sideTab} ${activeDomain === domain.name ? styles.activeSideTab : ''}`} 
                  onClick={() => setActiveDomain(domain.name)}
                >
                   <Layers size={16} /> {domain.name}
                </button>
              ))}
           </div>
        </div>

        <div className={styles.registryArea}>
           <div className={styles.registryHeader}>
              <div className={styles.searchBar}>
                 <Search size={18} />
                 <input type="text" placeholder="Buscar solicitud, ID o usuario..." />
              </div>
              <button className={styles.filterBtn}><Filter size={16} /> Filtros Avanzados</button>
           </div>

           <div className={styles.tableContainer}>
              <table className={styles.table}>
                 <thead>
                    <tr>
                       <th>Solicitud</th>
                       <th>Fecha</th>
                       <th>Tipo / Dominio</th>
                       <th>Estado</th>
                       <th>SLA / Prioridad</th>
                       <th>Acciones</th>
                    </tr>
                 </thead>
                 <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className={styles.tableRow} onClick={() => setSelectedReq(req)}>
                         <td>
                            <div className={styles.reqInfo}>
                               <span className={styles.reqId}>{req.id}</span>
                               <div className={styles.reqTitle}>{req.title}</div>
                               <div className={styles.reqUser}>Solicitante: {req.requester}</div>
                            </div>
                         </td>
                         <td>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{req.date}</div>
                         </td>
                         <td>
                            <div className={styles.typeTag}>
                               <span className={styles.categoryDot} style={{ background: '#6366f1' }} />
                               {req.type}
                            </div>
                         </td>
                         <td>
                            <span className={`${styles.statusBadge} ${styles[(req.status || 'Pendiente').toLowerCase().replace(' ', '')]}`}>
                               {req.status || 'Pendiente'}
                            </span>
                         </td>
                         <td>
                            <div className={styles.slaInfo}>
                               <div style={{ color: getSlaColor(req.slaStatus), fontWeight: 700 }}>{req.sla}</div>
                               <div style={{ color: getPriorityColor(req.priority), fontSize: '0.75rem' }}>Prioridad {req.priority}</div>
                            </div>
                         </td>
                         <td>
                            <div className={styles.tableActions}>
                               <button className={styles.actionIcon}><ExternalLink size={16} /></button>
                               <button className={styles.actionIcon}><MoreHorizontal size={16} /></button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Detail Drawer (Modal) */}
      <AnimatePresence>
        {selectedReq && (
          <div className={styles.modalOverlay} onClick={() => { setSelectedReq(null); setModalTab('general'); }}>
             <motion.div 
               className={styles.modalContent}
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               onClick={e => e.stopPropagation()}
             >
                <div className={styles.modalHeader}>
                   <div className={styles.modalTitleArea}>
                      <span className={styles.reqId}>{selectedReq.id}</span>
                      <h2>{selectedReq.title}</h2>
                      <div className={styles.modalBadges}>
                         <span className={`${styles.statusBadge} ${styles[(selectedReq.status || 'Pendiente').toLowerCase().replace(' ', '')]}`}>{selectedReq.status || 'Pendiente'}</span>
                         <span style={{ color: getPriorityColor(selectedReq.priority), fontWeight: 700 }}>• Prioridad {selectedReq.priority}</span>
                      </div>
                   </div>
                   <button className={styles.closeBtn} onClick={() => { setSelectedReq(null); setModalTab('general'); }}><XCircle size={24} /></button>
                </div>

                <div className={styles.modalTabs}>
                   {[
                     { id: 'general', label: 'General', icon: <FileText size={14} /> },
                     { id: 'flujo', label: 'Flujo', icon: <GitBranch size={14} /> },
                     { id: 'evidencias', label: 'Evidencias', icon: <Paperclip size={14} /> },
                     { id: 'comentarios', label: 'Comentarios', icon: <MessageSquare size={14} /> },
                     { id: 'auditoria', label: 'Auditoría', icon: <Shield size={14} /> }
                   ].map(t => (
                     <button 
                       key={t.id} 
                       className={`${styles.modalTab} ${modalTab === t.id ? styles.activeModalTab : ''}`}
                       onClick={() => setModalTab(t.id)}
                     >
                        {t.icon} {t.label}
                     </button>
                   ))}
                </div>

                <div className={styles.modalBody}>
                   {modalTab === 'general' && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.detailSection}>
                        <p className={styles.description}>{selectedReq.description}</p>
                        <div className={styles.infoGrid}>
                           <div className={styles.infoItem}>
                              <label>Solicitante</label>
                              <div>{selectedReq.requester}</div>
                           </div>
                           <div className={styles.infoItem}>
                              <label>Fecha Creación</label>
                              <div>2024-05-15 08:30</div>
                           </div>
                           <div className={styles.infoItem}>
                              <label>Dominio</label>
                              <select 
                                className={styles.modalInput}
                                style={{ padding: '4px 8px' }}
                                value={selectedReq.category}
                                onChange={(e) => setSelectedReq({...selectedReq, category: e.target.value})}
                              >
                                {domains.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                              </select>
                           </div>
                           <div className={styles.infoItem}>
                              <label>Asignar Regla SLA</label>
                              <select 
                                className={styles.formInput} 
                                value={(selectedReq.sla || '').replace('h', '')}
                                onChange={(e) => setSelectedReq({...selectedReq, sla: `${e.target.value}h`, slaStatus: 'Ok'})}
                              >
                                 <option value={(selectedReq.sla || '').replace('h', '')}>Actual ({selectedReq.sla || 'N/A'})</option>
                                 {slaRules.map(rule => (
                                   <option key={rule.id} value={rule.hours}>{rule.name} ({rule.hours}h)</option>
                                 ))}
                              </select>
                           </div>
                        </div>
                     </motion.div>
                   )}

                   {modalTab === 'flujo' && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.detailSection}>
                        <div className={styles.timeline}>
                           {selectedReq.timeline.map((item, i) => (
                             <div key={i} className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${item.status === 'done' ? styles.dotDone : styles.dotPending}`}>
                                   {item.status === 'done' ? <CheckCircle size={12} /> : i + 1}
                                </div>
                                <div className={styles.timelineContent}>
                                   <div className={styles.timelineStep}>{item.step}</div>
                                   <div className={styles.timelineUser}>{item.user} • {item.date}</div>
                                </div>
                                {i < selectedReq.timeline.length - 1 && <div className={styles.timelineLine} />}
                             </div>
                           ))}
                        </div>
                     </motion.div>
                   )}

                   {modalTab === 'evidencias' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.detailSection}>
                         <div className={styles.emptyState}>
                            <Paperclip size={32} />
                            <p>No hay documentos adjuntos aún.</p>
                            <button className={styles.secondaryBtn}>Adjuntar Evidencia</button>
                         </div>
                      </motion.div>
                   )}

                   {modalTab === 'comentarios' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.detailSection}>
                         <div className={styles.commentBox}>
                            <textarea placeholder="Escribe un comentario o aclaración..." />
                            <button className={styles.primaryBtn}>Enviar</button>
                         </div>
                      </motion.div>
                   )}

                   {modalTab === 'auditoria' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.detailSection}>
                         <div className={styles.auditLog}>
                            <div className={styles.auditItem}>
                               <div className={styles.auditTime}>2024-05-15 08:31</div>
                               <div className={styles.auditAction}><strong>Nexus AI</strong> realizó validación automática de PII. <span className={styles.auditOk}>OK</span></div>
                            </div>
                            <div className={styles.auditItem}>
                               <div className={styles.auditTime}>2024-05-15 08:30</div>
                               <div className={styles.auditAction}><strong>{selectedReq.requester}</strong> creó la solicitud desde IP 192.168.1.45.</div>
                            </div>
                         </div>
                      </motion.div>
                   )}
                </div>

                <div className={styles.modalFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px', background: '#f8fafc', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Estado:</label>
                       <select 
                         className={styles.modalInput} 
                         style={{ padding: '6px 12px', minWidth: '150px' }}
                         value={selectedReq.status}
                         onChange={(e) => setSelectedReq({...selectedReq, status: e.target.value as any})}
                       >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Revisión">En Revisión</option>
                          <option value="Aprobado">Aprobado</option>
                          <option value="Rechazado">Rechazado</option>
                          <option value="Escalado">Escalado</option>
                          <option value="Cerrado">Cerrado</option>
                       </select>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Asignado a:</label>
                       <select 
                         className={styles.modalInput}
                         style={{ padding: '6px 12px', minWidth: '180px' }}
                         value={selectedReq.assignee || ''}
                         onChange={(e) => setSelectedReq({...selectedReq, assignee: e.target.value})}
                       >
                          <option value="">-- Sin asignar --</option>
                          {teamMembers.map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))}
                       </select>
                    </div>
                    <button 
                      className={styles.primaryBtn} 
                      style={{ background: '#10b981' }}
                      onClick={handleSaveChanges}
                    >
                      Guardar Cambios
                    </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Request Modal */}
      <AnimatePresence>
        {isNewRequestModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsNewRequestModalOpen(false)}>
             <motion.div 
               className={styles.newReqModal}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               onClick={e => e.stopPropagation()}
             >
                <div className={styles.modalHeader}>
                   <h2>Nueva Solicitud de Gobierno</h2>
                   <button onClick={() => setIsNewRequestModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}><XCircle size={20} /></button>
                </div>
                <div style={{ padding: '24px' }}>
                   <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Título de la Solicitud</label>
                      <input 
                        type="text" 
                        className={styles.modalInput} 
                        placeholder="Ej: Acceso a Tablas de Marketing"
                        value={newReq.title}
                        onChange={e => setNewReq({...newReq, title: e.target.value})}
                      />
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Dominio</label>
                         <select 
                           className={styles.modalInput}
                           value={newReq.category}
                           onChange={e => setNewReq({...newReq, category: e.target.value})}
                         >
                            <option value="">Seleccionar...</option>
                            {domains.map(d => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                         </select>
                      </div>
                      <div>
                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Prioridad</label>
                         <select 
                           className={styles.modalInput}
                           value={newReq.priority}
                           onChange={e => setNewReq({...newReq, priority: e.target.value as any})}
                         >
                            <option>Baja</option>
                            <option>Media</option>
                            <option>Alta</option>
                            <option>Crítica</option>
                         </select>
                      </div>
                   </div>
                   <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Justificación / Detalles</label>
                      <textarea 
                        className={styles.modalInput} 
                        style={{ minHeight: '100px' }}
                        value={newReq.description}
                        onChange={e => setNewReq({...newReq, description: e.target.value})}
                      />
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button className={styles.secondaryBtn} onClick={() => setIsNewRequestModalOpen(false)}>Cancelar</button>
                      <button className={styles.primaryBtn} onClick={handleAddRequest}>Crear Solicitud</button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Audit Modal */}
      <AnimatePresence>
        {isAuditModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsAuditModalOpen(false)}>
             <motion.div 
               className={styles.auditModal}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               onClick={e => e.stopPropagation()}
             >
                <div className={styles.modalHeader}>
                   <h2>Log de Auditoría Operacional</h2>
                   <button onClick={() => setIsAuditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}><XCircle size={20} /></button>
                </div>
                <div style={{ padding: '24px' }}>
                   <div className={styles.auditTableContainer}>
                      <table className={styles.table}>
                         <thead>
                            <tr>
                               <th>Fecha / Hora</th>
                               <th>Acción</th>
                               <th>Usuario</th>
                               <th>Detalle</th>
                            </tr>
                         </thead>
                         <tbody>
                            {auditEvents.map(event => (
                              <tr key={event.id}>
                                 <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{event.date}</td>
                                 <td><span className={styles.auditActionBadge}>{event.action}</span></td>
                                 <td><strong>{event.user}</strong></td>
                                 <td style={{ fontSize: '0.85rem' }}>{event.detail}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SLA Configuration Modal */}
      <AnimatePresence>
        {isSlaModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsSlaModalOpen(false)}>
             <motion.div 
               className={styles.newReqModal}
               style={{ maxWidth: '700px' }}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               onClick={e => e.stopPropagation()}
             >
                <div className={styles.modalHeader}>
                   <h2>Configuración de Acuerdos de Nivel de Servicio (SLA)</h2>
                   <button onClick={() => setIsSlaModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}><XCircle size={20} /></button>
                </div>
                <div style={{ padding: '24px' }}>
                   <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Crear Nueva Regla SLA</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                         <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Nombre de la Regla</label>
                            <input 
                              type="text" 
                              className={styles.modalInput} 
                              placeholder="Ej: Resolución Crítica"
                              value={newSlaRule.name}
                              onChange={e => setNewSlaRule({...newSlaRule, name: e.target.value})}
                            />
                         </div>
                         <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Tiempo Límite (Horas)</label>
                            <input 
                              type="number" 
                              className={styles.modalInput} 
                              placeholder="Ej: 24"
                              value={newSlaRule.hours}
                              onChange={e => setNewSlaRule({...newSlaRule, hours: Number(e.target.value)})}
                            />
                         </div>
                         <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Aplica a Prioridad</label>
                            <select 
                              className={styles.modalInput}
                              value={newSlaRule.priority}
                              onChange={e => setNewSlaRule({...newSlaRule, priority: e.target.value})}
                            >
                               <option>Cualquiera</option>
                               <option>Baja</option>
                               <option>Media</option>
                               <option>Alta</option>
                               <option>Crítica</option>
                            </select>
                         </div>
                         <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Aplica a Dominio</label>
                            <select 
                              className={styles.modalInput}
                              value={newSlaRule.domain}
                              onChange={e => setNewSlaRule({...newSlaRule, domain: e.target.value})}
                            >
                               <option value="General">Todos (General)</option>
                               {domains.map(d => (
                                 <option key={d.id} value={d.name}>{d.name}</option>
                               ))}
                            </select>
                         </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                         <button className={styles.primaryBtn} onClick={handleAddSlaRule}><Plus size={16} /> Añadir Regla</button>
                      </div>
                   </div>

                   <hr style={{ borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

                   <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Reglas Activas</h3>
                   <div className={styles.tableContainer} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table className={styles.table}>
                         <thead>
                            <tr>
                               <th>Nombre</th>
                               <th>Prioridad</th>
                               <th>Dominio</th>
                               <th>Tiempo</th>
                               <th>Acción</th>
                            </tr>
                         </thead>
                         <tbody>
                            {slaRules.length === 0 && (
                              <tr>
                                 <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No hay reglas SLA definidas.</td>
                              </tr>
                            )}
                            {slaRules.map(rule => (
                              <tr key={rule.id}>
                                 <td><strong>{rule.name}</strong></td>
                                 <td>{rule.priority}</td>
                                 <td>{rule.domain}</td>
                                 <td><span className={styles.statusBadge} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>{rule.hours}h</span></td>
                                 <td>
                                    <button 
                                      className={styles.actionIcon} 
                                      onClick={() => handleDeleteSlaRule(rule.id)}
                                      style={{ color: '#ef4444' }}
                                    >
                                       <XCircle size={16} />
                                    </button>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KPI Explainer Modal */}
      <AnimatePresence>
        {selectedKPI && (
          <div className={styles.modalOverlay} onClick={() => setSelectedKPI(null)}>
            <motion.div 
              className={styles.modalContent}
              style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '24px 32px', background: selectedKPI.color, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex' }}>
                     <Award size={24} />
                   </div>
                   <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>{selectedKPI.label}</h3>
                </div>
                <button onClick={() => setSelectedKPI(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                   <X size={20} />
                </button>
              </div>
              <div style={{ padding: '32px' }}>
                 <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>
                   {selectedKPI.explanation}
                 </p>
                 <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={20} color="#6366f1" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                      Este indicador refleja el desempeño del flujo de gobierno en la organización y es actualizado por el orquestador Nexus.
                    </p>
                 </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 24px 24px' }}>
                 <button className={styles.primaryBtn} onClick={() => setSelectedKPI(null)}>
                   Entendido
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Plus({ size, style }: { size: number, style?: any }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style}
    >
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}
