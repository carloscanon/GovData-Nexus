'use client';

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
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AddAssetModal from '@/components/catalog/AddAssetModal';
import AssetDetailDrawer from '@/components/catalog/AssetDetailDrawer';
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
  tags?: string[];
  updated_at?: string;
}

const demoAssets: DataAsset[] = [
  { id: '1', code_id: 'AST-001', name: 'Maestro de Clientes', type: 'Tabla SQL', source: 'SAP ERP', owner: 'Ventas', data_owner: 'Juan Perez', sensitivity: 'Confidencial', quality_score: 94, status: 'Vigente', risk_level: 'Bajo', tags: ['Maestro', 'IA Ready'], updated_at: '2024-05-10' },
  { id: '2', code_id: 'AST-002', name: 'Transacciones Q2', type: 'Vista', source: 'Oracle DB', owner: 'Finanzas', data_owner: 'Maria Silva', sensitivity: 'Restringido', quality_score: 88, status: 'Vigente', risk_level: 'Medio', tags: ['Financiero'], updated_at: '2024-05-12' },
  { id: '3', code_id: 'AST-003', name: 'Leads Marketing', type: 'API', source: 'Salesforce', owner: 'Marketing', data_owner: 'Carlos Ruiz', sensitivity: 'Público', quality_score: 72, status: 'En Revisión', risk_level: 'Bajo', tags: ['Marketing'], updated_at: '2024-05-08' },
  { id: '4', code_id: 'AST-004', name: 'Reporte Consolidado', type: 'Power BI', source: 'Data Lake', owner: 'Estrategia', data_owner: 'Ana Belen', sensitivity: 'Confidencial', quality_score: 99, status: 'Vigente', risk_level: 'Bajo', tags: ['Crítico'], updated_at: '2024-05-13' },
];

export default function Catalog() {
  const { mode } = usePlatform();
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<DataAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<DataAsset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null);

  useEffect(() => {
    if (mode === 'ENTERPRISE') {
      fetchAssets();
    } else {
      setAssets(demoAssets);
      setLoading(false);
    }
  }, [mode]);

  async function fetchAssets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('data_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (mode === 'DEMO') {
      alert('En modo DEMO no se pueden eliminar registros reales.');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este activo? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('data_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAssets();
    } catch (error) {
      alert('Error al eliminar el activo.');
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

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Catálogo de Datos</h1>
          <p>Inventario centralizado de activos de información corporativa.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} onClick={openCreateModal}>
            <Plus size={18} />
            Registrar Activo
          </button>
          <button className={styles.secondaryBtn}>
            <Upload size={18} />
            Importar Excel
          </button>
          <button className={styles.secondaryBtn}>
            <Scan size={18} />
            Escaneo Automático
          </button>
          <button className={styles.secondaryBtn}>
            <Download size={18} />
            Exportar
          </button>
        </div>
      </header>

      <div className={styles.moduleStats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Activos</span>
          <span className={styles.statValue}>{assets.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>% Documentados</span>
          <span className={styles.statValue}>84%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>% con Owner</span>
          <span className={styles.statValue}>92%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Calidad Promedio</span>
          <span className={styles.statValue}>88.4%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Activos Críticos</span>
          <span className={styles.statValue}>12</span>
        </div>
      </div>

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
          <button className={styles.filterBtn}>
            <Filter size={18} />
            Filtros Avanzados
          </button>
          <button onClick={fetchAssets} className={styles.filterBtn} disabled={loading}>
            {loading ? <Loader2 size={18} className={styles.spin} /> : <History size={18} />}
          </button>
        </div>
      </div>

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
                      {asset.type.includes('Tabla') ? <TableIcon size={16} /> : 
                       asset.type.includes('API') ? <FileJson size={16} /> : 
                       <Database size={16} />}
                    </div>
                    <div>
                      <span className={styles.assetName}>{asset.name}</span>
                      <span className={styles.assetSub}>{asset.code_id || 'AST-00' + asset.id.slice(0,2)}</span>
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
                    <span className={`${styles.badge} ${styles[asset.sensitivity.toLowerCase().replace(/\s/g, '')] || styles.interno}`}>
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

      <AddAssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAssets}
        assetToEdit={assetToEdit}
      />

      <AssetDetailDrawer 
        asset={selectedAsset}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
