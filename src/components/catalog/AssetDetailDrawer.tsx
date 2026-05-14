'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Info, 
  User, 
  Table as TableIcon, 
  Activity, 
  AlertTriangle, 
  GitBranch, 
  FileText, 
  Link as LinkIcon,
  ChevronRight,
  Database,
  Calendar,
  Clock,
  Shield,
  Search
} from 'lucide-react';
import styles from './AssetDetailDrawer.module.css';

interface AssetDetailDrawerProps {
  asset: any;
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'general', label: 'General', icon: Info },
  { id: 'propiedad', label: 'Propiedad', icon: User },
  { id: 'campos', label: 'Campos', icon: TableIcon },
  { id: 'calidad', label: 'Calidad', icon: Activity },
  { id: 'riesgos', label: 'Riesgos', icon: AlertTriangle },
  { id: 'uso', label: 'Uso Empresarial', icon: LinkIcon },
  { id: 'linaje', label: 'Linaje', icon: GitBranch },
  { id: 'documentos', label: 'Documentos', icon: FileText },
];

export default function AssetDetailDrawer({ asset, isOpen, onClose }: AssetDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('general');

  if (!asset) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={onClose}
          />
          <motion.div 
            initial={{ translateX: '100%' }}
            animate={{ translateX: 0 }}
            exit={{ translateX: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={styles.drawer}
          >
            <header className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.iconBox}>
                  <Database size={24} />
                </div>
                <div>
                  <h2>{asset.name}</h2>
                  <span className={styles.code}>{asset.code_id || 'AST-XXXX'}</span>
                </div>
              </div>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </header>

            <nav className={styles.tabs}>
              {TABS.map(tab => (
                <button 
                  key={tab.id}
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className={styles.content}>
              {activeTab === 'general' && (
                <div className={styles.tabPane}>
                  <div className={styles.grid}>
                    <div className={styles.infoGroup}>
                      <label>Nombre de Negocio</label>
                      <p>{asset.name}</p>
                    </div>
                    <div className={styles.infoGroup}>
                      <label>Fuente Origen</label>
                      <p>{asset.source}</p>
                    </div>
                    <div className={styles.infoGroup}>
                      <label>Tipo de Activo</label>
                      <p>{asset.type}</p>
                    </div>
                    <div className={styles.infoGroup}>
                      <label>Frecuencia de Actualización</label>
                      <p>Diaria</p>
                    </div>
                  </div>
                  <div className={styles.description}>
                    <label>Descripción</label>
                    <p>Este activo contiene la información maestra de todos los clientes corporativos, incluyendo segmentación, datos de contacto y scoring de crédito consolidado desde SAP ERP.</p>
                  </div>
                </div>
              )}

              {activeTab === 'propiedad' && (
                <div className={styles.tabPane}>
                  <div className={styles.ownerCard}>
                    <div className={styles.avatar}>JP</div>
                    <div className={styles.ownerInfo}>
                      <h4>{asset.data_owner || 'Juan Perez'}</h4>
                      <span>Data Owner</span>
                    </div>
                  </div>
                  <div className={styles.grid}>
                    <div className={styles.infoGroup}>
                      <label>Área Dueña</label>
                      <p>{asset.owner}</p>
                    </div>
                    <div className={styles.infoGroup}>
                      <label>Data Steward</label>
                      <p>Maria Garcia</p>
                    </div>
                    <div className={styles.infoGroup}>
                      <label>TI Custodian</label>
                      <p>Soporte SAP</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'campos' && (
                <div className={styles.tabPane}>
                  <div className={styles.innerSearch}>
                    <Search size={16} />
                    <input placeholder="Buscar campos..." />
                  </div>
                  <table className={styles.innerTable}>
                    <thead>
                      <tr>
                        <th>Nombre Campo</th>
                        <th>Tipo</th>
                        <th>Sensible</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>customer_id</td>
                        <td>VARCHAR(20)</td>
                        <td>No</td>
                      </tr>
                      <tr>
                        <td>email_personal</td>
                        <td>VARCHAR(100)</td>
                        <td>Sí</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'calidad' && (
                <div className={styles.tabPane}>
                  <div className={styles.kpiGrid}>
                    <div className={styles.kpiCard}>
                      <span>Completitud</span>
                      <h3>98%</h3>
                    </div>
                    <div className={styles.kpiCard}>
                      <span>Exactitud</span>
                      <h3>94%</h3>
                    </div>
                    <div className={styles.kpiCard}>
                      <span>Unicidad</span>
                      <h3>100%</h3>
                    </div>
                  </div>
                  <div className={styles.chartPlaceholder}>
                    [ Gráfica de Tendencia Histórica ]
                  </div>
                </div>
              )}

              {activeTab === 'linaje' && (
                <div className={styles.tabPane}>
                  <div className={styles.lineageFlow}>
                    <div className={styles.flowNode}>SAP ERP</div>
                    <ChevronRight className={styles.flowArrow} />
                    <div className={`${styles.flowNode} ${styles.activeNode}`}>Data Warehouse</div>
                    <ChevronRight className={styles.flowArrow} />
                    <div className={styles.flowNode}>Power BI</div>
                  </div>
                </div>
              )}
            </div>

            <footer className={styles.footer}>
              <button className={styles.editBtn}>Editar Metadatos</button>
              <button className={styles.requestBtn}>Solicitar Acceso</button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
