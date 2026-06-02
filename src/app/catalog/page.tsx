'use client';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Database, 
  Table as TableIcon, 
  FileJson, 
  Shield,
  Loader2,
  Edit2,
  Trash2,
  Download,
  Upload,
  Scan,
  History,
  Share2,
  Archive,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldCheck,
  AlertOctagon,
  Award,
  Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AddAssetModal from '@/components/catalog/AddAssetModal';
import AssetDetailDrawer from '@/components/catalog/AssetDetailDrawer';
import AutoScanModal from '@/components/catalog/AutoScanModal';
import ImportExcelModal from '@/components/catalog/ImportExcelModal';
import CatalogStatsModal from '@/components/catalog/CatalogStatsModal';
import { usePlatform } from '@/contexts/PlatformContext';

import styles from './catalog.module.css';

interface DataAsset {
  id: string;
  code_id: string;
  name: string;
  type: string;
  source: string;
  owner: string;
  data_owner?: string;
  data_steward?: string;
  sensitivity: string;
  quality_score: number;
  status: string;
  risk_level?: string;
  records_count?: number;
  tenant_id?: string;
  tags?: string[];
  updated_at?: string;
}

const demoAssets: DataAsset[] = [
  { id: '1', code_id: 'AST-001', name: 'Maestro de Clientes', type: 'Tabla SQL', source: 'SAP ERP', owner: 'Ventas', data_owner: 'Juan Perez', sensitivity: 'Confidencial', quality_score: 94, status: 'Vigente', risk_level: 'Bajo', records_count: 12450, tenant_id: '1', tags: ['Maestro', 'IA Ready'], updated_at: '2024-05-10' },
  { id: '2', code_id: 'AST-002', name: 'Transacciones Q2', type: 'Vista', source: 'Oracle DB', owner: 'Finanzas', data_owner: 'Maria Silva', sensitivity: 'Restringido', quality_score: 88, status: 'Vigente', risk_level: 'Medio', records_count: 852000, tenant_id: '2', tags: ['Financiero'], updated_at: '2024-05-12' },
  { id: '3', code_id: 'AST-003', name: 'Leads Marketing', type: 'API', source: 'Salesforce', owner: 'Marketing', data_owner: 'Carlos Ruiz', sensitivity: 'Público', quality_score: 72, status: 'En Revisión', risk_level: 'Bajo', records_count: 5310, tenant_id: '1', tags: ['Marketing'], updated_at: '2024-05-08' },
  { id: '4', code_id: 'AST-004', name: 'Reporte Consolidado', type: 'Power BI', source: 'Data Lake', owner: 'Estrategia', data_owner: 'Ana Belen', sensitivity: 'Confidencial', quality_score: 99, status: 'Vigente', risk_level: 'Bajo', records_count: 1200, tenant_id: '3', tags: ['Crítico'], updated_at: '2024-05-13' },
];

export default function Catalog() {
  const { mode, currentTenant } = usePlatform();
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<DataAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<DataAsset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsModalType, setStatsModalType] = useState<'total' | 'documented' | 'owner' | 'quality' | 'critical'>('total');
  
  // Filtros Avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    sensitivity: '',
    status: '',
    criticality: ''
  });

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('govdata_role') : null;

  useEffect(() => {
    fetchAssets();
  }, [mode, currentTenant?.id]);

  async function fetchAssets() {
    setLoading(true);

    // ── MODO DEMO: En memoria ──
    if (mode === 'DEMO' || !currentTenant?.id) {
      const filteredDemo = demoAssets.filter(a => !currentTenant?.id || a.tenant_id === currentTenant.id);
      setAssets(filteredDemo);
      setLoading(false);
      return;
    }

    // ── MODO ENTERPRISE: Supabase directo con aislamiento por tenant_id ──
    try {
      const { data, error } = await supabase
        .from('data_assets')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error: any) {
      console.error('Error al cargar activos desde Supabase:', error);
      if (error.code === '42P01') {
        alert("Las tablas de catálogo no existen en la base de datos Supabase. Ejecuta el script SQL de creación (supabase_full_schema.sql).");
      }
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }

  const handleAddEditSuccess = (updatedAsset?: DataAsset | DataAsset[]) => {
    // 1. Actualizar el estado en memoria de forma inmediata e incondicional si se provee el activo
    if (updatedAsset) {
      if (Array.isArray(updatedAsset)) {
        // Importación masiva de Excel
        setAssets(prev => {
          const newIds = new Set(updatedAsset.map(a => a.id));
          return [...updatedAsset, ...prev.filter(a => !newIds.has(a.id))];
        });
      } else {
        // Agregar/Editar manual o importación de AutoScan
        setAssets(prev => {
          if (assetToEdit) {
            // Edición
            return prev.map(a => a.id === assetToEdit.id ? { ...a, ...updatedAsset } : a);
          } else {
            // Creación / Importación individual
            // Evitar duplicados por ID o por nombre + sistema de origen
            if (prev.some(a => a.id === updatedAsset.id || (a.name === updatedAsset.name && a.source === updatedAsset.source))) {
              return prev.map(a => (a.id === updatedAsset.id || (a.name === updatedAsset.name && a.source === updatedAsset.source)) ? { ...a, ...updatedAsset } : a);
            }
            return [updatedAsset, ...prev];
          }
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este activo? Esta acción no se puede deshacer.')) return;

    if (mode === 'DEMO') {
      setAssets(prev => prev.filter(a => a.id !== id));
      alert('Activo eliminado exitosamente (Modo DEMO).');
      return;
    }

    try {
      const { error } = await supabase
        .from('data_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAssets();
      alert('Activo eliminado exitosamente de la base de datos empresarial.');
    } catch (error) {
      console.warn('Error al eliminar de base de datos. Aplicando fallback en memoria:', error);
      setAssets(prev => prev.filter(a => a.id !== id));
      alert('Activo eliminado exitosamente (Modo local - Base de datos desconectada).');
    }
  };

  const openEditModal = (asset: DataAsset) => {
    setAssetToEdit(asset);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setAssetToEdit(null);
    setIsModalOpen(true);
  };

  const openDetail = (asset: DataAsset) => {
    setSelectedAsset(asset);
    setIsDetailOpen(true);
  };

  const openStatsModal = (type: 'total' | 'documented' | 'owner' | 'quality' | 'critical') => {
    setStatsModalType(type);
    setIsStatsModalOpen(true);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      (asset.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (asset.source?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (asset.owner?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = !filters.type || asset.type === filters.type;
    const matchesSensitivity = !filters.sensitivity || asset.sensitivity === filters.sensitivity;
    const matchesStatus = !filters.status || asset.status === filters.status;
    const matchesCriticality = !filters.criticality || asset.risk_level === filters.criticality;

    // Aislamiento Multi-tenant: solo mostrar los activos pertenecientes a la empresa actual
    const matchesTenant = !currentTenant?.id || !asset.tenant_id || asset.tenant_id === currentTenant.id;

    return matchesSearch && matchesType && matchesSensitivity && matchesStatus && matchesCriticality && matchesTenant;
  });

  const clearFilters = () => {
    setFilters({ type: '', sensitivity: '', status: '', criticality: '' });
    setSearchTerm('');
  };

  // ── Consolidated Global Score Banner calculations ──
  const totalAssets = assets.length;
  
  const assetsWithOwner = assets.filter(a => a.data_owner || a.owner).length;
  const ownerPercent = totalAssets > 0 ? Math.round((assetsWithOwner / totalAssets) * 100) : 92;

  const assetsWithDocs = assets.filter(a => a.tags && a.tags.length > 0).length;
  const docPercent = totalAssets > 0 ? Math.round((assetsWithDocs / totalAssets) * 100) : 84;

  const assetsWithSensitivity = assets.filter(a => a.sensitivity && a.sensitivity !== 'Público').length;
  const sensitivityPercent = totalAssets > 0 ? Math.round((assetsWithSensitivity / totalAssets) * 100) : 75;

  const assetsWithQuality = assets.filter(a => a.quality_score && a.quality_score >= 80).length;
  const qualityPercent = totalAssets > 0 ? Math.round((assetsWithQuality / totalAssets) * 100) : 88;

  // Let's compute global score as the average of the key percentages
  const globalScore = Math.round((ownerPercent + docPercent + qualityPercent) / 3);

  // Level
  let levelText = 'INICIAL';
  let levelColor = '#ef4444';
  if (globalScore >= 85) {
    levelText = 'OPTIMIZADO';
    levelColor = '#10b981';
  } else if (globalScore >= 70) {
    levelText = 'GESTIONADO';
    levelColor = '#6366f1'; // Indigo
  } else {
    levelText = 'INICIAL';
    levelColor = '#f59e0b'; // Amber
  }

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (globalScore / 100) * circumference;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <Database size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Catálogo de Datos</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Inventario centralizado de activos de información corporativa.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} onClick={openCreateModal}>
            <Plus size={18} />
            Registrar Activo
          </button>
          <a 
            href="/GovDataNexus_Plantilla_Catalogo_Datos.xlsx" 
            download 
            className={styles.secondaryBtn}
            title="Descargar plantilla Excel profesional"
          >
            <Download size={18} />
            Plantilla Excel
          </a>
          <button className={styles.secondaryBtn} onClick={() => setIsImportOpen(true)}>
            <Upload size={18} />
            Importar Excel
          </button>
          <button className={styles.secondaryBtn} onClick={() => setIsScanOpen(true)}>
            <Scan size={18} />
            Escaneo Automático
          </button>
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
                strokeDashoffset={loading ? circumference : dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
              <text x="60" y="55" textAnchor="middle" fill={levelColor} fontSize="22" fontWeight="900">
                {loading ? '…' : `${globalScore}%`}
              </text>
              <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                COMPLETITUD
              </text>
            </svg>
          </div>
          <div className={styles.globalInfo}>
            <div className={styles.globalLevel} style={{ color: levelColor }}>
              <Award size={20} /> {levelText}
            </div>
            <h2 className={styles.globalTitle}>Integridad del Catálogo de Datos</h2>
            <p className={styles.globalSub}>
              Calculado sobre {totalAssets} activos en inventario · Responsabilidad y calidad en tiempo real.
            </p>
          </div>
        </div>

        {/* Mini dimension pills */}
        <div className={styles.globalRight}>
          <div className={styles.miniPill} onClick={() => openStatsModal('total')}>
            <Database size={14} />
            <span>Total Activos</span>
            <strong>{totalAssets}</strong>
          </div>
          <div className={styles.miniPill} onClick={() => openStatsModal('documented')}>
            <FileJson size={14} />
            <span>Documentación</span>
            <strong style={{ color: docPercent >= 70 ? '#10b981' : '#f59e0b' }}>{docPercent}%</strong>
          </div>
          <div className={styles.miniPill} onClick={() => openStatsModal('owner')}>
            <ShieldCheck size={14} />
            <span>Responsabilidad</span>
            <strong style={{ color: ownerPercent >= 70 ? '#10b981' : '#f59e0b' }}>{ownerPercent}%</strong>
          </div>
          <div className={styles.miniPill} onClick={() => openStatsModal('quality')}>
            <Zap size={14} />
            <span>Calidad Promedio</span>
            <strong style={{ color: qualityPercent >= 70 ? '#10b981' : '#f59e0b' }}>{qualityPercent}%</strong>
          </div>
          <div className={styles.miniPill}>
            <Shield size={14} />
            <span>Sensibilidad</span>
            <strong style={{ color: '#10b981' }}>{sensitivityPercent}%</strong>
          </div>
          <div className={styles.miniPill} onClick={() => openStatsModal('critical')}>
            <AlertOctagon size={14} />
            <span>Activos Críticos</span>
            <strong style={{ color: '#ef4444' }}>{assets.filter(a => a.risk_level === 'Alto').length}</strong>
          </div>
        </div>
      </motion.div>

      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, código, responsable o etiquetas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${showFilters ? styles.activeFilter : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filtros Avanzados
          </button>
          <button onClick={fetchAssets} className={styles.filterBtn} disabled={loading}>
            {loading ? <Loader2 size={18} className={styles.spin} /> : <History size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.advancedFilterPanel}
          >
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label>Tipo de Activo</label>
                <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                  <option value="">Todos los tipos</option>
                  <option value="Tabla SQL">Tabla SQL</option>
                  <option value="Vista">Vista</option>
                  <option value="API">API</option>
                  <option value="Data Lake">Data Lake</option>
                  <option value="Reporte">Reporte</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Sensibilidad</label>
                <select value={filters.sensitivity} onChange={e => setFilters({...filters, sensitivity: e.target.value})}>
                  <option value="">Cualquier sensibilidad</option>
                  <option value="Público">Público</option>
                  <option value="Uso Interno">Uso Interno</option>
                  <option value="Confidencial">Confidencial</option>
                  <option value="Secreto">Secreto</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Estado</label>
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                  <option value="">Cualquier estado</option>
                  <option value="Vigente">Vigente</option>
                  <option value="En Revisión">En Revisión</option>
                  <option value="Obsoleto">Obsoleto</option>
                  <option value="Borrador">Borrador</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Riesgo / Criticalidad</label>
                <select value={filters.criticality} onChange={e => setFilters({...filters, criticality: e.target.value})}>
                  <option value="">Cualquier riesgo</option>
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>
            </div>
            <div className={styles.filterFooter}>
              <p>{filteredAssets.length} activos encontrados</p>
              <button className={styles.clearBtn} onClick={clearFilters}>Limpiar Filtros</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 Banner de Integración Metadata Engine */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px', backgroundColor: '#eef2ff', border: '1px solid #e0e7ff', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px' }}
      >
        <div style={{ background: '#6366f1', color: 'white', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
          <Brain size={20} />
        </div>
        <div>
          <h4 style={{ color: '#312e81', fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>Integrado con Metadata Intelligence</h4>
          <p style={{ color: '#4338ca', fontSize: '0.85rem', margin: 0 }}>
            Este catálogo ahora se sincroniza de forma automática con las fuentes de datos configuradas en el <strong>Metadata Engine</strong>. 
            Las nuevas columnas, tipos de datos y tags de clasificación (PII) fluirán directamente hacia aquí tras cada escaneo.
          </p>
        </div>
      </motion.div>

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.tableCard}>
            {loading ? (
              <div className={styles.loadingState}>
                <Loader2 size={40} className={styles.spin} />
                <p>Conectando con el catálogo empresarial...</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre Activo / ID</th>
                    <th>Tipo</th>
                    <th>Fuente</th>
                    <th>Responsable</th>
                    <th>Sensibilidad</th>
                    <th>Calidad %</th>
                    <th>Estado</th>
                    <th>Riesgo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} className={styles.row}>
                      <td className={styles.nameCell}>
                        <div className={styles.iconBox}>
                          {asset.type?.includes('Tabla') ? <TableIcon size={16} /> : 
                           asset.type?.includes('API') ? <FileJson size={16} /> : 
                           <Database size={16} />}
                        </div>
                        <div>
                          <span className={styles.assetName}>{asset.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span className={styles.assetSub}>{asset.code_id || 'AST-00' + asset.id.slice(0,2)}</span>
                            {asset.records_count !== undefined && (
                              <span className={styles.recordsCountBadgeTable}>
                                {Number(asset.records_count).toLocaleString('es-CL')} reg.
                              </span>
                            )}
                          </div>
                          {asset.tags && (
                            <div className={styles.tagWrapper}>
                              {asset.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{asset.type}</td>
                      <td>{asset.source}</td>
                      <td>
                        <div className={styles.responsible}>
                          <span className={styles.ownerName}>{asset.data_owner || asset.owner}</span>
                          <span className={styles.ownerArea}>{asset.owner}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[(asset.sensitivity || '').toLowerCase().replace(/\s/g, '')] || styles.interno}`}>
                          <Shield size={12} />
                          {asset.sensitivity}
                        </span>
                      </td>
                      <td>
                        <div className={styles.qualityCell}>
                          <div className={styles.qualityTrack}>
                            <div className={styles.qualityFill} style={{ 
                              width: `${asset.quality_score}%`,
                              backgroundColor: asset.quality_score > 90 ? '#10b981' : asset.quality_score > 80 ? '#f59e0b' : '#ef4444'
                            }}></div>
                          </div>
                          <span>{asset.quality_score}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.status} ${asset.status === 'Vigente' ? styles.active : styles.pending}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.riskBadge} ${asset.risk_level === 'Alto' ? styles.riskHigh : asset.risk_level === 'Medio' ? styles.riskMedium : styles.riskLow}`}>
                          {asset.risk_level || 'Bajo'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.iconBtn} onClick={() => openDetail(asset)} title="Ver Detalle">
                            <Eye size={16} />
                          </button>
                          <button className={styles.iconBtn} onClick={() => openEditModal(asset)} title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => handleDelete(asset.id)} title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.aiInsightsCard}>
            <div className={styles.aiGlow} />
            <div className={styles.aiHeader}>
              <div className={styles.aiIconContainer}>
                <Zap size={20} />
              </div>
              <h3 className={styles.aiTitle}>Nexus AI Insights</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
              <div className={styles.aiAlertItem}>
                <div className={styles.aiAlertBadge}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span className={styles.aiBadgeText}>RECOMENDACIÓN</span>
                </div>
                <p className={styles.aiAlertText}>
                  Se detectaron 4 tablas de <strong>Ventas</strong> sin descripción. Nexus AI puede autogenerar la documentación.
                </p>
                <button className={styles.aiActionBtn}>
                  Documentar Ahora
                </button>
              </div>

              <div className={styles.aiRiskItem}>
                <div className={styles.aiAlertBadge}>
                  <AlertOctagon size={14} color="#f59e0b" />
                  <span className={styles.aiRiskBadgeText}>RIESGO DETECTADO</span>
                </div>
                <p className={styles.aiAlertText}>
                  El contenedor <strong>"Sales_Archive_2023"</strong> tiene sensibilidad inconsistente con sus hijos.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.sideCard}>
             <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', fontWeight: 700 }}>Distribución por Fuente</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {[
                 { label: 'SAP ERP', val: 45, color: '#6366f1' },
                 { label: 'Salesforce', val: 30, color: '#10b981' },
                 { label: 'Oracle DB', val: 15, color: '#f59e0b' },
                 { label: 'S3 Buckets', val: 10, color: '#ec4899' }
               ].map((item, i) => (
                 <div key={i}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                     <span style={{ fontWeight: 600, color: '#64748b' }}>{item.label}</span>
                     <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.val}%</span>
                   </div>
                   <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                     <div style={{ width: `${item.val}%`, height: '100%', background: item.color }}></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      <AddAssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleAddEditSuccess}
        assetToEdit={assetToEdit}
      />

      <AssetDetailDrawer 
        asset={selectedAsset}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <AutoScanModal 
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onSuccess={handleAddEditSuccess}
      />

      <ImportExcelModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={handleAddEditSuccess}
      />

      <CatalogStatsModal 
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        type={statsModalType}
        assets={assets}
      />
    </div>
  );
}
