'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical,
  Briefcase,
  Globe,
  Activity,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  GitBranch,
  ShieldAlert,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  PieChart,
  Award,
  Info,
  X
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './team.module.css';

// --- Types ---
interface GovernanceMember {
  id: number;
  name: string;
  role: string;
  roleType: 'CDO' | 'Data Owner' | 'Data Steward' | 'Data Custodian' | 'Auditor' | 'CISO';
  area: string;
  status: 'Activo' | 'Inactivo' | 'Fuera';
  email: string;
  domain: string;
  country: string;
  stats: {
    assetsManaged: number;
    openIncidents: number;
    stewardScore: number;
    slaCompliance: number;
    qualityAvg: number;
  };
  assignments: {
    assets: string[];
    policies: string[];
    workflows: number;
  };
}

interface GovernanceDomain {
  id: string;
  name: string;
  description: string;
  owner: string;
  steward: string;
  custodian: string;
  coverage: number;
  status: 'Cubierto' | 'Parcial' | 'Huérfano';
}

// --- Mock Data ---
const governanceMembers: GovernanceMember[] = [
  { 
    id: 1, 
    name: 'Carlos Director', 
    role: 'CDO (Chief Data Officer)', 
    roleType: 'CDO',
    area: 'Estrategia', 
    status: 'Activo', 
    email: 'carlos@govdata.io',
    domain: 'Corporativo',
    country: 'México',
    stats: { assetsManaged: 120, openIncidents: 0, stewardScore: 100, slaCompliance: 100, qualityAvg: 95 },
    assignments: { assets: ['Enterprise Metadata', 'Data Strategy v2'], policies: ['Política Global de Ética IA'], workflows: 5 }
  },
  { 
    id: 2, 
    name: 'Ana García', 
    role: 'Senior Data Steward', 
    roleType: 'Data Steward',
    area: 'Ventas', 
    status: 'Activo', 
    email: 'ana.garcia@govdata.io',
    domain: 'Comercial',
    country: 'Colombia',
    stats: { assetsManaged: 42, openIncidents: 3, stewardScore: 91, slaCompliance: 88, qualityAvg: 91 },
    assignments: { assets: ['CLIENTES_MASTER', 'VENTAS_ANUAL_2024'], policies: ['Privacidad Clientes'], workflows: 12 }
  },
  { 
    id: 3, 
    name: 'Luis Martínez', 
    role: 'Data Owner Business', 
    roleType: 'Data Owner',
    area: 'Marketing', 
    status: 'Activo', 
    email: 'luis.m@govdata.io',
    domain: 'Comercial',
    country: 'Chile',
    stats: { assetsManaged: 15, openIncidents: 1, stewardScore: 95, slaCompliance: 100, qualityAvg: 88 },
    assignments: { assets: ['LEADS_GEN_SOCIAL'], policies: ['Uso Ético de Datos Mkt'], workflows: 4 }
  },
  { 
    id: 4, 
    name: 'Sofía Rodriguez', 
    role: 'Data Custodian Infra', 
    roleType: 'Data Custodian',
    area: 'TI', 
    status: 'Activo', 
    email: 'sofia.r@govdata.io',
    domain: 'Infraestructura',
    country: 'Perú',
    stats: { assetsManaged: 250, openIncidents: 7, stewardScore: 85, slaCompliance: 92, qualityAvg: 94 },
    assignments: { assets: ['DB_PRODUCTION_CLUSTER'], policies: ['Backup & Recovery'], workflows: 18 }
  },
  { 
    id: 5, 
    name: 'Elena Gómez', 
    role: 'Compliance Auditor', 
    roleType: 'Auditor',
    area: 'Riesgos', 
    status: 'Fuera', 
    email: 'elena.g@govdata.io',
    domain: 'Legal',
    country: 'España',
    stats: { assetsManaged: 0, openIncidents: 0, stewardScore: 0, slaCompliance: 0, qualityAvg: 0 },
    assignments: { assets: [], policies: ['Auditoría ISO 27001'], workflows: 2 }
  }
];

const governanceDomains: GovernanceDomain[] = [
  { id: 'DOM-01', name: 'Finanzas', description: 'Datos contables, tesorería y fiscal.', owner: 'Carlos D.', steward: 'Ana G.', custodian: 'Sofía R.', coverage: 95, status: 'Cubierto' },
  { id: 'DOM-02', name: 'Ventas', description: 'Transacciones y CRM.', owner: 'Luis M.', steward: 'Ana G.', custodian: 'Sofía R.', coverage: 82, status: 'Parcial' },
  { id: 'DOM-03', name: 'Recursos Humanos', description: 'Nómina y talento.', owner: 'Por definir', steward: 'Por definir', custodian: 'TI Central', coverage: 0, status: 'Huérfano' },
  { id: 'DOM-04', name: 'Logística', description: 'Inventarios y despacho.', owner: 'Carlos D.', steward: 'Ana G.', custodian: 'Sofía R.', coverage: 65, status: 'Parcial' },
];

const raciData = [
  { process: 'Definición de Glosario', owner: 'A', steward: 'R', custodian: 'C', analyst: 'C' },
  { process: 'Validación de Calidad', owner: 'A', steward: 'R', custodian: 'I', analyst: 'C' },
  { process: 'Aprobación de Acceso', owner: 'A', steward: 'C', custodian: 'R', analyst: 'I' },
  { process: 'Modelado de Datos', owner: 'C', steward: 'C', custodian: 'R', analyst: 'A' },
  { process: 'Gestión de Incidentes', owner: 'I', steward: 'R', custodian: 'A', analyst: 'C' },
];

export default function Team() {
  const { currentTenant } = usePlatform();
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'team' | 'domains' | 'raci' | 'coverage'>('team');
  const [selectedMember, setSelectedMember] = useState<GovernanceMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isOrgChartModalOpen, setIsOrgChartModalOpen] = useState(false);
  const [members, setMembers] = useState<GovernanceMember[]>(governanceMembers);

  const [newMember, setNewMember] = useState({
    name: '',
    roleType: 'Data Steward' as any,
    area: '',
    domain: 'Comercial',
    email: '',
    country: 'México'
  });

  useEffect(() => {
    if (!currentTenant) return;
    const key = `govdata_team_members_${currentTenant.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setMembers(JSON.parse(saved));
      } catch (e) {
        setMembers(governanceMembers);
      }
    } else {
      setMembers(governanceMembers);
    }
  }, [currentTenant?.id]);

  const handleAddMember = () => {
    const id = members.length + 1;
    const memberToAdd: GovernanceMember = {
      ...newMember,
      id,
      role: newMember.roleType,
      status: 'Activo',
      stats: { assetsManaged: 0, openIncidents: 0, stewardScore: 100, slaCompliance: 100, qualityAvg: 100 },
      assignments: { assets: [], policies: [], workflows: 0 }
    };
    const updated = [...members, memberToAdd];
    setMembers(updated);
    if (currentTenant) {
      localStorage.setItem(`govdata_team_members_${currentTenant.id}`, JSON.stringify(updated));
    }
    setIsAssignModalOpen(false);
    setNewMember({ name: '', roleType: 'Data Steward', area: '', domain: 'Comercial', email: '', country: 'México' });
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Header Enterprise */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.breadcrumb}>Gobierno &gt; Modelo Operativo</div>
          <h1>🚀 Centro Operativo de Gobierno de Datos</h1>
          <p>Gestión de roles, ownership, responsabilidades y capacidad operativa de la red de gobierno.</p>
        </div>
        <div className={styles.headerActions}>
           <button className={styles.secondaryBtn} onClick={() => setIsOrgChartModalOpen(true)}><Activity size={16} /> Ver Organigrama</button>
           <button className={styles.addBtn} onClick={() => setIsAssignModalOpen(true)}><UserPlus size={18} /> Asignar Responsable</button>
        </div>
      </header>

      {/* ── Consolidated Global Score Banner calculations ── */}
      {(() => {
        const ownersCount = members.filter(m => m.roleType === 'Data Owner').length;
        const stewardsCount = members.filter(m => m.roleType === 'Data Steward').length;
        const custodiansCount = members.filter(m => m.roleType === 'Data Custodian').length;
        
        const activeMembers = members.filter(m => m.status === 'Activo');
        const slaEfficiency = activeMembers.length > 0 
          ? Math.round(activeMembers.reduce((acc, m) => acc + (m.stats?.slaCompliance || 0), 0) / activeMembers.length)
          : 100;
        
        const coveredDomainsCount = governanceDomains.filter(d => d.status !== 'Huérfano').length;
        const coverageScore = 92; // baseline representing overall ownership coverage

        let levelText = 'HUÉRFANO';
        let levelColor = '#ef4444';
        if (coverageScore >= 90) {
          levelText = 'SÓLIDO';
          levelColor = '#10b981';
        } else if (coverageScore >= 75) {
          levelText = 'ESTRUCTURADO';
          levelColor = '#6366f1';
        }

        const circumference = 2 * Math.PI * 52;
        const dashOffset = circumference - (coverageScore / 100) * circumference;

        const kpiExplanations: Record<string, string> = {
          'Dueños Asignados': 'Líderes de negocio responsables de definir la criticidad, el valor comercial y la autorización de acceso a los activos de información.',
          'Stewards Activos': 'Especialistas técnicos responsables de velar por la calidad, definición y consistencia del catálogo de metadatos.',
          'Custodians': 'Administradores de sistemas y bases de datos que ejecutan controles físicos de almacenamiento, respaldo y accesos de seguridad.',
          'Cobertura': 'Porcentaje de activos de información críticos que cuentan con un Data Owner formalmente asignado en la organización.',
          'Dominios Asignados': 'Áreas de negocio o dominios lógicos de datos que cuentan con asignaciones activas de gobierno.',
          'Eficiencia SLA': 'Cumplimiento promedio en Acuerdos de Nivel de Servicio para la atención de solicitudes de acceso e incidentes de calidad.'
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
                    {coverageScore}%
                  </text>
                  <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                    COBERTURA
                  </text>
                </svg>
              </div>
              <div className={styles.globalInfo}>
                <div className={styles.globalLevel} style={{ color: levelColor }}>
                  <Award size={20} /> {levelText}
                </div>
                <h2 className={styles.globalTitle}>Índice de Ownership Coverage</h2>
                <p className={styles.globalSub}>
                  Porcentaje de dominios y activos de información con dueños de datos formalmente asignados.
                </p>
              </div>
            </div>

            {/* Mini dimension pills */}
            <div className={styles.globalRight}>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Dueños Asignados', value: ownersCount.toString(), explanation: kpiExplanations['Dueños Asignados'], color: '#10b981' })}>
                <Shield size={14} color="#10b981" />
                <span>Dueños</span>
                <strong style={{ color: '#10b981' }}>{ownersCount}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Stewards Activos', value: stewardsCount.toString(), explanation: kpiExplanations['Stewards Activos'], color: '#f59e0b' })}>
                <Briefcase size={14} color="#f59e0b" />
                <span>Stewards</span>
                <strong style={{ color: '#f59e0b' }}>{stewardsCount}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Custodians', value: custodiansCount.toString(), explanation: kpiExplanations['Custodians'], color: '#ef4444' })}>
                <Layers size={14} color="#ef4444" />
                <span>Custodians</span>
                <strong style={{ color: '#ef4444' }}>{custodiansCount}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Cobertura', value: `${coverageScore}%`, explanation: kpiExplanations['Cobertura'], color: '#6366f1' })}>
                <CheckCircle2 size={14} color="#6366f1" />
                <span>Cobertura</span>
                <strong style={{ color: '#6366f1' }}>{coverageScore}%</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Dominios Asignados', value: coveredDomainsCount.toString(), explanation: kpiExplanations['Dominios Asignados'], color: '#8b5cf6' })}>
                <LayoutGrid size={14} color="#8b5cf6" />
                <span>Dominios</span>
                <strong style={{ color: '#8b5cf6' }}>{coveredDomainsCount} / {governanceDomains.length}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Eficiencia SLA', value: `${slaEfficiency}%`, explanation: kpiExplanations['Eficiencia SLA'], color: '#06b6d4' })}>
                <Clock size={14} color="#06b6d4" />
                <span>Eficiencia</span>
                <strong style={{ color: '#06b6d4' }}>{slaEfficiency}%</strong>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Tabs de Navegación */}
      <div className={styles.tabContainer}>
        <button className={`${styles.tab} ${activeTab === 'team' ? styles.activeTab : ''}`} onClick={() => setActiveTab('team')}>
          <Users size={16} /> Red de Gobierno
        </button>
        <button className={`${styles.tab} ${activeTab === 'domains' ? styles.activeTab : ''}`} onClick={() => setActiveTab('domains')}>
          <LayoutGrid size={16} /> Ownership Dominios
        </button>
        <button className={`${styles.tab} ${activeTab === 'raci' ? styles.activeTab : ''}`} onClick={() => setActiveTab('raci')}>
          <TableIcon size={16} /> Matriz RACI
        </button>
        <button className={`${styles.tab} ${activeTab === 'coverage' ? styles.activeTab : ''}`} onClick={() => setActiveTab('coverage')}>
          <PieChart size={16} /> Capacidad y Madurez
        </button>
      </div>

      <div className={styles.mainContent}>
        {activeTab === 'team' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.filterArea}>
              <div className={styles.searchBar}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, rol o dominio..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className={styles.filterBtn}><Filter size={16} /> Filtros Avanzados</button>
            </div>

            <div className={styles.memberGrid}>
              {filteredMembers.map(member => (
                <motion.div 
                  key={member.id} 
                  className={styles.memberCard}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedMember(member)}
                >
                  <div className={styles.cardStatus} style={{ background: member.status === 'Activo' ? '#10b981' : '#f59e0b' }} />
                  <div className={styles.memberHeader}>
                    <div className={styles.avatarArea}>
                      <div className={styles.avatar}>{member.name.split(' ').map(n => n[0]).join('')}</div>
                      <div className={styles.scoreBadge} title="Steward Score">{member.stats.stewardScore}%</div>
                    </div>
                    <button className={styles.moreBtn} onClick={(e) => e.stopPropagation()}><MoreVertical size={18} /></button>
                  </div>
                  <div className={styles.memberBody}>
                    <h3>{member.name}</h3>
                    <span className={styles.roleTag} data-role={member.roleType}>{member.role}</span>
                    
                    <div className={styles.assignmentSummary}>
                      <div className={styles.assignItem}>
                        <Layers size={14} />
                        <span>{member.stats.assetsManaged} Activos</span>
                      </div>
                      <div className={styles.assignItem}>
                        <Activity size={14} />
                        <span>{member.stats.openIncidents} Incidentes</span>
                      </div>
                    </div>

                    <div className={styles.footerInfo}>
                      <div className={styles.domainInfo}>
                        <Globe size={14} />
                        <span>{member.domain} • {member.country}</span>
                      </div>
                      <div className={styles.slaBadge} style={{ color: member.stats.slaCompliance > 90 ? '#10b981' : '#f59e0b' }}>
                        SLA: {member.stats.slaCompliance}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'domains' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.domainView}>
            <div className={styles.domainTableContainer}>
              <table className={styles.domainTable}>
                <thead>
                  <tr>
                    <th>Dominio</th>
                    <th>Data Owner</th>
                    <th>Data Steward</th>
                    <th>Data Custodian</th>
                    <th>Cobertura</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {governanceDomains.map(domain => (
                    <tr key={domain.id}>
                      <td>
                        <div className={styles.domainCol}>
                          <span className={styles.domainName}>{domain.name}</span>
                          <span className={styles.domainDesc}>{domain.description}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.miniAvatar}>{domain.owner === 'Por definir' ? '?' : domain.owner[0]}</div>
                          <span className={domain.owner === 'Por definir' ? styles.unassigned : ''}>{domain.owner}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.miniAvatar}>{domain.steward === 'Por definir' ? '?' : domain.steward[0]}</div>
                          <span className={domain.steward === 'Por definir' ? styles.unassigned : ''}>{domain.steward}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.miniAvatar}>{domain.custodian === 'Por definir' ? '?' : domain.custodian[0]}</div>
                          <span className={domain.custodian === 'Por definir' ? styles.unassigned : ''}>{domain.custodian}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.coverageCell}>
                          <div className={styles.coverageBar}><div style={{ width: `${domain.coverage}%`, background: domain.coverage > 80 ? '#10b981' : domain.coverage > 40 ? '#f59e0b' : '#ef4444' }} /></div>
                          <span>{domain.coverage}%</span>
                        </div>
                      </td>
                      <td><span className={styles.statusBadge} data-status={domain.status.toLowerCase()}>{domain.status}</span></td>
                      <td><button className={styles.actionBtn}><ArrowUpRight size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'raci' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.raciView}>
             <div className={styles.raciInfo}>
                <h3>Matriz RACI: Gobierno Operativo</h3>
                <p>Definición de niveles de responsabilidad por proceso clave de gobierno.</p>
             </div>
             <div className={styles.raciLegend}>
                <div className={styles.legendItem}><span className={styles.raciA}>A</span> Accountable (Rinde cuentas)</div>
                <div className={styles.legendItem}><span className={styles.raciR}>R</span> Responsible (Ejecuta)</div>
                <div className={styles.legendItem}><span className={styles.raciC}>C</span> Consulted (Consultado)</div>
                <div className={styles.legendItem}><span className={styles.raciI}>I</span> Informed (Informado)</div>
             </div>
             <table className={styles.raciTable}>
                <thead>
                  <tr>
                    <th>Proceso / Actividad</th>
                    <th>Data Owner</th>
                    <th>Data Steward</th>
                    <th>Data Custodian</th>
                    <th>Data Analyst</th>
                  </tr>
                </thead>
                <tbody>
                  {raciData.map((row, i) => (
                    <tr key={i}>
                      <td className={styles.processName}>{row.process}</td>
                      <td><span className={styles.raciBadge} data-type={row.owner}>{row.owner}</span></td>
                      <td><span className={styles.raciBadge} data-type={row.steward}>{row.steward}</span></td>
                      <td><span className={styles.raciBadge} data-type={row.custodian}>{row.custodian}</span></td>
                      <td><span className={styles.raciBadge} data-type={row.analyst}>{row.analyst}</span></td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </motion.div>
        )}
      </div>

      {/* Modal de Perfil de Gobierno */}
      <AnimatePresence>
        {selectedMember && (
          <div className={styles.modalOverlay} onClick={() => setSelectedMember(null)}>
            <motion.div 
              className={styles.profileDrawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.profileHeader}>
                <button className={styles.closeBtn} onClick={() => setSelectedMember(null)}><XCircle size={24} /></button>
                <div className={styles.profileBasicInfo}>
                   <div className={styles.largeAvatar}>{selectedMember.name.split(' ').map(n => n[0]).join('')}</div>
                   <div>
                      <h2>{selectedMember.name}</h2>
                      <span className={styles.roleTag} data-role={selectedMember.roleType}>{selectedMember.role}</span>
                      <div className={styles.profileSub}>
                         <Globe size={14} /> {selectedMember.domain} • {selectedMember.country} • {selectedMember.area}
                      </div>
                   </div>
                </div>
              </div>

              <div className={styles.profileBody}>
                 <div className={styles.profileStatsGrid}>
                    <div className={styles.profileStatItem}>
                       <span className={styles.pStatLabel}>Steward Score</span>
                       <span className={styles.pStatValue} style={{ color: '#10b981' }}>{selectedMember.stats.stewardScore}%</span>
                    </div>
                    <div className={styles.profileStatItem}>
                       <span className={styles.pStatLabel}>SLA Compliance</span>
                       <span className={styles.pStatValue}>{selectedMember.stats.slaCompliance}%</span>
                    </div>
                    <div className={styles.profileStatItem}>
                       <span className={styles.pStatLabel}>Calidad Promedio</span>
                       <span className={styles.pStatValue}>{selectedMember.stats.qualityAvg}%</span>
                    </div>
                    <div className={styles.profileStatItem}>
                       <span className={styles.pStatLabel}>Tickets Hoy</span>
                       <span className={styles.pStatValue}>{selectedMember.assignments.workflows}</span>
                    </div>
                 </div>

                 <div className={styles.profileSection}>
                    <h4><Layers size={16} /> Activos Asignados ({selectedMember.stats.assetsManaged})</h4>
                    <div className={styles.assetList}>
                       {selectedMember.assignments.assets.map((asset, i) => (
                         <div key={i} className={styles.assetTag}>{asset}</div>
                       ))}
                       {selectedMember.stats.assetsManaged > 2 && <div className={styles.moreAssets}>+ {selectedMember.stats.assetsManaged - 2} más</div>}
                    </div>
                 </div>

                 <div className={styles.profileSection}>
                    <h4><BookOpen size={16} /> Políticas Bajo su Responsabilidad</h4>
                    <div className={styles.policyList}>
                       {selectedMember.assignments.policies.map((policy, i) => (
                         <div key={i} className={styles.policyItem}>
                            <div className={styles.policyIcon}><Shield size={14} /></div>
                            <span>{policy}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className={styles.profileSection}>
                    <h4><Activity size={16} /> Incidentes Recientes</h4>
                    <div className={styles.incidentList}>
                       <div className={styles.incidentItem} data-severity="alta">
                          <AlertTriangle size={14} /> <span>Anomalía en CLIENTES_MASTER (PII)</span>
                       </div>
                       <div className={styles.incidentItem} data-severity="media">
                          <Clock size={14} /> <span>SLA excedido en REQ-882</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className={styles.profileFooter}>
                 <button className={styles.secondaryBtn} style={{ width: '100%', justifyContent: 'center' }}><Mail size={16} /> Contactar Responsable</button>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button className={styles.secondaryBtn} style={{ justifyContent: 'center' }}>Reasignar</button>
                    <button className={styles.primaryBtn} style={{ justifyContent: 'center' }}>Editar Perfil</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
       </AnimatePresence>

       {/* Modal: Asignar Responsable */}
       <AnimatePresence>
         {isAssignModalOpen && (
           <div className={styles.modalOverlay} onClick={() => setIsAssignModalOpen(false)}>
              <motion.div 
                className={styles.assignModal}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={e => e.stopPropagation()}
              >
                 <div className={styles.modalHeader} style={{ background: 'var(--primary)', color: 'white', padding: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Asignar Nuevo Responsable de Gobierno</h2>
                    <button onClick={() => setIsAssignModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}><XCircle size={20} /></button>
                 </div>
                 <div style={{ padding: '32px' }}>
                    <div style={{ marginBottom: '16px' }}>
                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Nombre Completo</label>
                       <input 
                         type="text" 
                         className={styles.modalInput} 
                         value={newMember.name}
                         onChange={e => setNewMember({...newMember, name: e.target.value})}
                         placeholder="Ej: Roberto Sánchez"
                       />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                       <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Rol de Gobierno</label>
                          <select 
                            className={styles.modalInput}
                            value={newMember.roleType}
                            onChange={e => setNewMember({...newMember, roleType: e.target.value as any})}
                          >
                             <option>Data Owner</option>
                             <option>Data Steward</option>
                             <option>Data Custodian</option>
                             <option>Auditor</option>
                             <option>CISO</option>
                          </select>
                       </div>
                       <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Área / Departamento</label>
                          <input 
                            type="text" 
                            className={styles.modalInput}
                            value={newMember.area}
                            onChange={e => setNewMember({...newMember, area: e.target.value})}
                            placeholder="Ej: Operaciones"
                          />
                       </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Correo Electrónico</label>
                       <input 
                         type="email" 
                         className={styles.modalInput}
                         value={newMember.email}
                         onChange={e => setNewMember({...newMember, email: e.target.value})}
                         placeholder="roberto@empresa.com"
                       />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                       <button className={styles.secondaryBtn} onClick={() => setIsAssignModalOpen(false)}>Cancelar</button>
                       <button className={styles.primaryBtn} onClick={handleAddMember}>Confirmar Asignación</button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* Modal: Organigrama */}
       <AnimatePresence>
         {isOrgChartModalOpen && (
           <div className={styles.modalOverlay} onClick={() => setIsOrgChartModalOpen(false)}>
              <motion.div 
                className={styles.orgChartModal}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                 <div className={styles.modalHeader} style={{ background: '#1e293b', color: 'white', padding: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Jerarquía del Modelo Operativo</h2>
                    <button onClick={() => setIsOrgChartModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}><XCircle size={20} /></button>
                 </div>
                 <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                    {/* CDO */}
                    <div className={styles.orgNode} data-role="CDO">
                       <strong>CDO</strong>
                       <span>Carlos Director</span>
                    </div>
                    
                    <div className={styles.orgLine} />

                    {/* Owners */}
                    <div style={{ display: 'flex', gap: '40px' }}>
                       <div className={styles.orgNode} data-role="Data Owner">
                          <strong>Data Owner</strong>
                          <span>Luis Martínez</span>
                       </div>
                       <div className={styles.orgNode} data-role="Data Owner">
                          <strong>Data Owner</strong>
                          <span>Marketing</span>
                       </div>
                    </div>

                    <div className={styles.orgLine} />

                    {/* Stewards */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                       <div className={styles.orgNode} data-role="Data Steward">
                          <strong>Steward</strong>
                          <span>Ana García</span>
                       </div>
                       <div className={styles.orgNode} data-role="Data Steward">
                          <strong>Steward</strong>
                          <span>Elena Gómez</span>
                       </div>
                       <div className={styles.orgNode} data-role="Data Custodian">
                          <strong>Custodian</strong>
                          <span>Sofía R.</span>
                       </div>
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
                      Este indicador refleja el estado del modelo operativo de gobierno y es calculado en base a las asignaciones de red activas.
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
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}
