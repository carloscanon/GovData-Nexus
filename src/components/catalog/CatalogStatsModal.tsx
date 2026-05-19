'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Database, 
  FileText, 
  User, 
  Activity, 
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Search,
  CheckCircle2,
  Table as TableIcon
} from 'lucide-react';
import styles from './CatalogStatsModal.module.css';

interface DataAsset {
  id: string;
  name: string;
  type: string;
  source: string;
  owner: string;
  data_owner?: string;
  sensitivity: string;
  quality_score: number;
  status: string;
  risk_level?: string;
  description?: string;
}

interface CatalogStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'total' | 'documented' | 'owner' | 'quality' | 'critical';
  assets: DataAsset[];
}

export default function CatalogStatsModal({ isOpen, onClose, type, assets }: CatalogStatsModalProps) {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'total': return 'Desglose de Activos';
      case 'documented': return 'Detalle de Documentación';
      case 'owner': return 'Gestión de Responsabilidades';
      case 'quality': return 'Análisis de Calidad de Datos';
      case 'critical': return 'Activos Críticos de Información';
      default: return 'Detalle de Consolidado';
    }
  };

  const getIcon = () => {
    const size = 28;
    switch (type) {
      case 'total': return <Database size={size} className={styles.totalIcon} />;
      case 'documented': return <FileText size={size} className={styles.docIcon} />;
      case 'owner': return <User size={size} className={styles.ownerIcon} />;
      case 'quality': return <Activity size={size} className={styles.qualityIcon} />;
      case 'critical': return <ShieldAlert size={size} className={styles.criticalIcon} />;
    }
  };

  const getFilteredAssets = () => {
    switch (type) {
      case 'documented': 
        return assets.filter(a => !a.description); // Simulación de falta de documentación
      case 'owner':
        return assets.filter(a => !a.data_owner && !a.owner);
      case 'quality':
        return [...assets].sort((a, b) => a.quality_score - b.quality_score);
      case 'critical':
        return assets.filter(a => a.risk_level === 'Alto' || a.risk_level === 'Crítico');
      default:
        return assets;
    }
  };

  const filtered = getFilteredAssets();

  // Estadísticas internas
  const stats = {
    byType: assets.reduce((acc: any, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {}),
    bySource: assets.reduce((acc: any, curr) => {
      acc[curr.source] = (acc[curr.source] || 0) + 1;
      return acc;
    }, {}),
    avgQuality: assets.length > 0 ? (assets.reduce((acc, curr) => acc + curr.quality_score, 0) / assets.length).toFixed(1) : 0
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={styles.modal}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className={styles.statIcon}>
                {getIcon()}
              </div>
              <h2>{getTitle()}</h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.summaryArea}>
              <div className={styles.summaryText}>
                <h3>{type === 'total' ? 'Total Registrados' : 'Métrica Actual'}</h3>
                <div className={styles.value}>
                  {type === 'total' ? assets.length : 
                   type === 'documented' ? '84%' :
                   type === 'owner' ? '92%' :
                   type === 'quality' ? `${stats.avgQuality}%` :
                   filtered.length}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div className={styles.badge} style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-brand)', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                  Actualizado hoy
                </div>
              </div>
            </div>

            {type === 'total' && (
              <div className={styles.detailGrid}>
                {Object.entries(stats.byType).map(([type, count]: any) => (
                  <div key={type} className={styles.detailCard}>
                    <span className={styles.label}>{type}</span>
                    <span className={styles.count}>{count}</span>
                  </div>
                ))}
              </div>
            )}

            {type === 'quality' && (
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <span className={styles.label}>Top Calidad</span>
                  <span className={styles.count} style={{ color: '#10b981' }}>
                    {assets.filter(a => a.quality_score > 90).length} Activos
                  </span>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.label}>En Alerta</span>
                  <span className={styles.count} style={{ color: '#ef4444' }}>
                    {assets.filter(a => a.quality_score < 75).length} Activos
                  </span>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.label}>Promedio General</span>
                  <span className={styles.count}>{stats.avgQuality}%</span>
                </div>
              </div>
            )}

            <div className={styles.assetList}>
              <h4>{type === 'quality' ? 'Ranking de Calidad (Menor a Mayor)' : 'Activos Relacionados'}</h4>
              <div className={styles.tableContainer}>
                {filtered.length > 0 ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Activo</th>
                        <th>Tipo</th>
                        <th>{type === 'quality' ? 'Calidad %' : 'Fuente'}</th>
                        <th>Responsable</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(asset => (
                        <tr key={asset.id}>
                          <td>
                            <span className={styles.assetName}>{asset.name}</span>
                            <span className={styles.assetSource}>{asset.source}</span>
                          </td>
                          <td>{asset.type}</td>
                          <td>
                            {type === 'quality' ? (
                              <span style={{ 
                                fontWeight: 600, 
                                color: asset.quality_score > 90 ? '#10b981' : asset.quality_score > 80 ? '#f59e0b' : '#ef4444' 
                              }}>
                                {asset.quality_score}%
                              </span>
                            ) : asset.source}
                          </td>
                          <td>{asset.data_owner || asset.owner || 'No asignado'}</td>
                          <td>
                            <span className={`${styles.badge} ${asset.status === 'Vigente' ? styles.badgeHigh : styles.badgeMed}`}>
                              {asset.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.empty}>
                    <CheckCircle2 size={40} />
                    <p>No se encontraron activos que requieran atención en esta categoría.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
