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
  BookOpen
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
  category: 'Catalogo' | 'Calidad' | 'Seguridad' | 'Politicas' | 'Riesgos';
  status: 'Pendiente' | 'En Revisión' | 'Aprobado' | 'Rechazado' | 'Escalado' | 'Cerrado';
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  date: string;
  sla: string;
  slaStatus: 'Ok' | 'Warning' | 'Overdue';
  description?: string;
  currentStep: string;
  timeline: { step: string; user: string; date: string; status: string }[];
}

const demoRequests: WorkflowReq[] = [
  { 
    id: 'REQ-001', 
    title: 'Acceso a CLIENTES_MASTER_PROD', 
    requester: 'Ana G. (Ventas)', 
    type: 'Solicitud Acceso', 
    category: 'Seguridad',
    status: 'Pendiente', 
    priority: 'Alta', 
    date: 'Hace 30 min',
    sla: '4h restantes',
    slaStatus: 'Warning',
    description: 'Requiero acceso de lectura para conciliación de cierre mensual.',
    currentStep: 'Aprobación Owner',
    timeline: [
      { step: 'Solicitud Creada', user: 'Ana G.', date: '2024-05-15 08:30', status: 'done' },
      { step: 'Validación Automática PII', user: 'Nexus AI', date: '2024-05-15 08:31', status: 'done' },
      { step: 'Aprobación Owner', user: 'Luis M. (Data Owner)', date: '-', status: 'pending' }
    ]
  },
  { 
    id: 'REQ-002', 
    title: 'Incidente: Emails Nulos en CRM', 
    requester: 'Sistema Monitoreo', 
    type: 'Incidente Calidad', 
    category: 'Calidad',
    status: 'En Revisión', 
    priority: 'Crítica', 
    date: 'Hace 2h',
    sla: 'Vencido (1h)',
    slaStatus: 'Overdue',
    description: 'Se detectó un 15% de emails nulos en la carga masiva de hoy.',
    currentStep: 'Asignación Steward',
    timeline: [
      { step: 'Incidente Detectado', user: 'DataQuality Bot', date: '2024-05-15 07:00', status: 'done' },
      { step: 'Alerta Generada', user: 'System', date: '2024-05-15 07:01', status: 'done' },
      { step: 'Asignación Steward', user: 'Por asignar', date: '-', status: 'pending' }
    ]
  },
  { 
    id: 'REQ-003', 
    title: 'Alta Activo: Dashboard Financiero v2', 
    requester: 'Sofia R. (Finanzas)', 
    type: 'Alta Activo', 
    category: 'Catalogo',
    status: 'Pendiente', 
    priority: 'Media', 
    date: 'Ayer',
    sla: '24h restantes',
    slaStatus: 'Ok',
    description: 'Nuevo tablero para el comité directivo.',
    currentStep: 'Certificación de Datos',
    timeline: [
      { step: 'Registro Activo', user: 'Sofia R.', date: '2024-05-14 15:00', status: 'done' },
      { step: 'Certificación de Datos', user: 'Elena R. (Steward)', date: '-', status: 'pending' }
    ]
  },
  { 
    id: 'REQ-004', 
    title: 'Aprobación Política de Ética IA', 
    requester: 'Carlos D. (CDO)', 
    type: 'Aprobación Política', 
    category: 'Politicas',
    status: 'Escalado', 
    priority: 'Alta', 
    date: 'Hace 3 días',
    sla: '2 días restantes',
    slaStatus: 'Ok',
    description: 'Marco normativo para el uso de modelos generativos.',
    currentStep: 'Revisión Legal',
    timeline: [
      { step: 'Borrador Creado', user: 'Carlos D.', date: '2024-05-12', status: 'done' },
      { step: 'Revisión Técnica', user: 'TI Security', date: '2024-05-13', status: 'done' },
      { step: 'Revisión Legal', user: 'Jurídica', date: '-', status: 'pending' }
    ]
  },
];

const kpis = [
  { label: 'Pendientes', value: '12', icon: <Clock size={20} />, color: '#f59e0b', bg: '#fffbeb' },
  { label: 'SLA Vencidos', value: '3', icon: <AlertTriangle size={20} />, color: '#ef4444', bg: '#fef2f2' },
  { label: 'Aprobaciones Hoy', value: '18', icon: <CheckCircle size={20} />, color: '#10b981', bg: '#f0fdf4' },
  { label: 'Riesgos Escalados', value: '2', icon: <ShieldAlert size={20} />, color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'Incidentes', value: '7', icon: <Activity size={20} />, color: '#3b82f6', bg: '#eff6ff' },
];

export default function Workflows() {
  const { mode } = usePlatform();
  const [requests, setRequests] = useState<WorkflowReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<WorkflowReq | null>(null);
  const [modalTab, setModalTab] = useState('general');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [newReq, setNewReq] = useState({
    title: '',
    category: 'Seguridad' as any,
    priority: 'Media' as any,
    description: ''
  });

  const auditEvents = [
    { id: 1, action: 'Solicitud Creada', user: 'Ana G.', date: '2024-05-15 08:30', detail: 'Acceso a CLIENTES_MASTER_PROD' },
    { id: 2, action: 'Aprobación Técnica', user: 'Nexus AI', date: '2024-05-15 08:31', detail: 'Validación de PII completada sin riesgos' },
    { id: 3, action: 'Cambio de Estado', user: 'Luis M.', date: '2024-05-15 09:15', detail: 'REQ-002 pasó a En Revisión' },
    { id: 4, action: 'Escalamiento SLA', user: 'System', date: '2024-05-15 10:00', detail: 'REQ-002 excedió el tiempo de respuesta' },
  ];

  const handleCreateRequest = () => {
    const id = `REQ-00${requests.length + 1}`;
    const reqToAdd: WorkflowReq = {
      ...newReq,
      id,
      requester: 'Usuario Actual',
      type: 'Solicitud Manual',
      status: 'Pendiente',
      date: 'Ahora',
      sla: '48h',
      slaStatus: 'Ok',
      currentStep: 'Validación Inicial',
      timeline: [
        { step: 'Solicitud Creada', user: 'Usuario Actual', date: new Date().toISOString().split('T')[0], status: 'done' }
      ]
    } as any;
    setRequests([reqToAdd, ...requests]);
    setIsNewRequestModalOpen(false);
    setNewReq({ title: '', category: 'Seguridad', priority: 'Media', description: '' });
  };

  const handleUpdateStatus = (reqId: string, newStatus: WorkflowReq['status']) => {
    setRequests(requests.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
    setSelectedReq(prev => prev ? { ...prev, status: newStatus } : null);
  };

  useEffect(() => {
    setRequests(demoRequests);
    setLoading(false);
  }, []);

  const filteredRequests = requests.filter(req => {
    if (activeDomain && req.category !== activeDomain) return false;
    if (activeTab === 'pendientes') return req.status === 'Pendiente' || req.status === 'En Revisión';
    if (activeTab === 'mis') return req.requester.includes('Ana'); // Simulación
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
        <div className={styles.titleArea}>
          <h1>🎯 Centro de Operaciones de Gobierno</h1>
          <p>Gestión integral de flujos, aprobaciones y cumplimiento normativo.</p>
        </div>
        <div className={styles.headerActions}>
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

      {/* KPI Dashboard */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i} 
            className={styles.kpiCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={styles.kpiIcon} style={{ background: kpi.bg, color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={styles.kpiLabel}>{kpi.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
           <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>Bandejas</h4>
              <button className={`${styles.sideTab} ${activeTab === 'pendientes' && !activeDomain ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('pendientes'); setActiveDomain(null); }}>
                 <Clock size={16} /> Pendientes <span className={styles.count}>12</span>
              </button>
              <button className={`${styles.sideTab} ${activeTab === 'mis' ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('mis'); setActiveDomain(null); }}>
                 <User size={16} /> Mis Solicitudes <span className={styles.count}>4</span>
              </button>
              <button className={`${styles.sideTab} ${activeTab === 'historial' ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('historial'); setActiveDomain(null); }}>
                 <History size={16} /> Historial
              </button>
           </div>

           <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>Dominios</h4>
              {[
                { id: 'Catalogo', label: 'Catálogo', icon: <Layers size={16} /> },
                { id: 'Calidad', label: 'Calidad', icon: <Activity size={16} /> },
                { id: 'Seguridad', label: 'Seguridad', icon: <Shield size={16} /> },
                { id: 'Politicas', label: 'Políticas', icon: <BookOpen size={16} /> },
                { id: 'Riesgos', label: 'Riesgos', icon: <ShieldAlert size={16} /> },
              ].map(domain => (
                <button 
                  key={domain.id}
                  className={`${styles.sideTab} ${activeDomain === domain.id ? styles.activeSideTab : ''}`} 
                  onClick={() => setActiveDomain(domain.id)}
                >
                   {domain.icon} {domain.label}
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
                            <div className={styles.typeTag}>
                               <span className={styles.categoryDot} style={{ background: req.category === 'Seguridad' ? '#8b5cf6' : req.category === 'Calidad' ? '#3b82f6' : req.category === 'Catalogo' ? '#6366f1' : req.category === 'Politicas' ? '#10b981' : '#ef4444' }} />
                               {req.type}
                            </div>
                         </td>
                         <td>
                            <span className={`${styles.statusBadge} ${styles[req.status.toLowerCase().replace(' ', '')]}`}>
                               {req.status}
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
                         <span className={`${styles.statusBadge} ${styles[selectedReq.status.toLowerCase().replace(' ', '')]}`}>{selectedReq.status}</span>
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
                              <div>{selectedReq.category}</div>
                           </div>
                           <div className={styles.infoItem}>
                              <label>SLA Acordado</label>
                              <div style={{ color: getSlaColor(selectedReq.slaStatus) }}>{selectedReq.sla}</div>
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

                <div className={styles.modalFooter}>
                   <button 
                     className={styles.secondaryBtn} 
                     style={{ color: '#ef4444', borderColor: '#fecaca' }}
                     onClick={() => handleUpdateStatus(selectedReq.id, 'Rechazado')}
                   >
                     Rechazar
                   </button>
                   <button 
                     className={styles.secondaryBtn} 
                     style={{ color: '#f59e0b', borderColor: '#fde68a' }}
                     onClick={() => handleUpdateStatus(selectedReq.id, 'En Revisión')}
                   >
                     Solicitar Cambios
                   </button>
                   <button 
                     className={styles.primaryBtn} 
                     style={{ background: '#10b981' }}
                     onClick={() => handleUpdateStatus(selectedReq.id, 'Aprobado')}
                   >
                     Aprobar Solicitud
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
                           onChange={e => setNewReq({...newReq, category: e.target.value as any})}
                         >
                            <option>Seguridad</option>
                            <option>Calidad</option>
                            <option>Catalogo</option>
                            <option>Politicas</option>
                            <option>Riesgos</option>
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
                      <button className={styles.primaryBtn} onClick={handleCreateRequest}>Crear Solicitud</button>
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
