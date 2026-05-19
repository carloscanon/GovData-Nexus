'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Activity, ShieldCheck, AlertCircle, Info, ChevronRight, BarChart } from 'lucide-react';
import styles from './SourceDetailModal.module.css';

interface SourceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: any;
  assets: any[];
  mode: 'DEMO' | 'ENTERPRISE';
}

export default function SourceDetailModal({ isOpen, onClose, source, assets, mode }: SourceDetailModalProps) {
  if (!source) return null;

  const filteredAssets = assets.filter(
    a => a.source === source.name || (!a.source && source.name === 'Sin Fuente')
  );

  // Mock demo assets for visual completeness
  const demoAssets = mode === 'DEMO' && source.name === 'SAP ERP' ? [
    { id: 'd1', name: 'Maestro Clientes Central', table_name: 'sap_kna1', quality_score: 92 },
    { id: 'd2', name: 'Facturación Ventas 2024', table_name: 'sap_vbak', quality_score: 96 },
    { id: 'd3', name: 'Inventarios Global', table_name: 'sap_marc', quality_score: 94 }
  ] : [];

  const displayAssets = [...filteredAssets, ...demoAssets];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.headerMain}>
                <div className={styles.titleGroup}>
                  <h2>{source.name}</h2>
                  <p>Consolidado de Calidad y Gobierno</p>
                </div>
                <button className={styles.closeBtn} onClick={onClose}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{source.score}%</span>
                  <span className={styles.statLabel}>Score Calidad</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{source.assets}</span>
                  <span className={styles.statLabel}>Activos</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue} style={{ color: source.alerts > 0 ? '#ef4444' : '#10b981' }}>
                    {source.alerts}
                  </span>
                  <span className={styles.statLabel}>Incidentes</span>
                </div>
              </div>

              <div className={styles.sectionTitle}>
                <BarChart size={20} color="#6366f1" />
                <span>Desglose por Activo de Información</span>
              </div>

              <div className={styles.assetList}>
                {displayAssets.map((asset, idx) => (
                  <motion.div 
                    key={asset.id || idx}
                    className={styles.assetCard}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className={styles.assetInfo}>
                      <h4>{asset.name}</h4>
                      <code>{asset.table_name || 'physical_table_mapped'}</code>
                    </div>
                    <div className={styles.scoreWrapper}>
                      <div className={styles.progressBar}>
                        <motion.div 
                          className={styles.progressFill}
                          initial={{ width: 0 }}
                          animate={{ width: `${asset.quality_score || 0}%` }}
                          style={{ 
                            background: (asset.quality_score || 0) > 90 ? '#10b981' : (asset.quality_score || 0) > 75 ? '#f59e0b' : '#ef4444' 
                          }}
                        />
                      </div>
                      <span className={styles.scoreText}>{asset.quality_score || 0}%</span>
                    </div>
                  </motion.div>
                ))}

                {displayAssets.length === 0 && (
                  <div className={styles.emptyState}>
                    <Info size={32} color="#cbd5e1" />
                    <p>No hay activos registrados para este sistema.</p>
                  </div>
                )}
              </div>

              <div className={styles.methodology}>
                <div className={styles.methodIcon}>
                  <Activity size={20} />
                </div>
                <div className={styles.methodText}>
                  <h5>Algoritmo de Consolidación Nexus AI</h5>
                  <p>
                    El score de {source.name} es un promedio ponderado basado en la integridad de los metadatos y los resultados de las {source.assets} reglas de calidad ejecutadas sobre los activos físicos.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.primaryBtn} onClick={onClose}>
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
