'use client';
import { supabase } from '@/lib/supabase';
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
  const [fields, setFields] = useState<any[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);

  React.useEffect(() => {
    if (isOpen && asset?.id) {
      fetchFields();
    }
  }, [isOpen, asset?.id]);

  async function fetchFields() {
    try {
      setLoadingFields(true);
      const { data, error } = await supabase
        .from('asset_fields')
        .select('*')
        .eq('asset_id', asset.id);
      
      if (error) throw error;
      setFields(data || []);
    } catch (err) {
      console.error("Error fetching fields:", err);
    } finally {
      setLoadingFields(false);
    }
  }

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
                      <p>{asset.update_frequency || 'Diaria'}</p>
                    </div>
                  </div>
                  <div className={styles.description}>
                    <label>Descripción</label>
                    <p>{asset.description || 'Sin descripción disponible.'}</p>
                  </div>
                  {asset.tags && asset.tags.length > 0 && (
                    <div className={styles.tagsContainer}>
                      <label style={{ display: 'block', marginBottom: '12px' }}>Etiquetas</label>
                      <div className={styles.tagsList} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {asset.tags.map((tag: string, i: number) => (
                          <span key={i} className={styles.tag} style={{ 
                            padding: '4px 12px', 
                            backgroundColor: '#f1f5f9', 
                            borderRadius: '100px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            color: '#475569'
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <div className={styles.tableWrapper}>
                    {loadingFields ? (
                      <div className={styles.loadingInner}>Cargando diccionario de datos...</div>
                    ) : fields.length === 0 ? (
                      <div className={styles.emptyFields}>
                        <TableIcon size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p>No se han registrado campos para este activo.</p>
                      </div>
                    ) : (
                      <table className={styles.innerTable}>
                        <thead>
                          <tr>
                            <th>Nombre Campo</th>
                            <th>Tipo</th>
                            <th>Sensible</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map((field) => (
                            <tr key={field.id}>
                              <td><strong>{field.field_name}</strong></td>
                              <td><code className={styles.dataType}>{field.data_type}</code></td>
                              <td>{field.is_sensitive ? 'Sí' : 'No'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'calidad' && (
                <div className={styles.tabPane}>
                  <div className={styles.kpiGrid}>
                    <div className={styles.kpiCard}>
                      <span>Completitud</span>
                      <h3>{asset.quality_score || 98}%</h3>
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

              {activeTab === 'riesgos' && (
                <div className={styles.tabPane}>
                   <div className={styles.grid}>
                    <div className={styles.infoGroup}>
                      <label>Nivel de Riesgo</label>
                      <p className={`${styles.riskBadge} ${styles[asset.risk_level?.toLowerCase()] || styles.bajo}`} style={{ fontWeight: 800 }}>
                        {asset.risk_level || 'Bajo'}
                      </p>
                    </div>
                    <div className={styles.infoGroup}>
                      <label>Clasificación de Sensibilidad</label>
                      <p>{asset.sensitivity || 'Interno'}</p>
                    </div>
                    <div className={styles.infoGroup}>
                      <label>Criticidad</label>
                      <p>{asset.criticality || 'Media'}</p>
                    </div>
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
