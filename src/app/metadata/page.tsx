'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Database, Search, ShieldAlert, Network, BookOpen, 
  Plus, RefreshCw, ChevronDown, ArrowDown, Activity, Key, EyeOff, Save, X
} from 'lucide-react';
import styles from './page.module.css';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';

export default function MetadataPage() {
  const { currentTenant, mode } = usePlatform();
  const [activeTab, setActiveTab] = useState('scanner');
  const [isScanning, setIsScanning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // States para datos reales
  const [assets, setAssets] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [glossary, setGlossary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Glosario
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '', domain: '' });
  const [domains, setDomains] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    fetchMetadata();
    
    if (currentTenant?.id) {
      const domainsKey = `govdata_team_domains_${currentTenant.id}`;
      const savedDomains = localStorage.getItem(domainsKey);
      if (savedDomains) {
        try {
          setDomains(JSON.parse(savedDomains));
        } catch (e) {
          setDomains([]);
        }
      } else {
        setDomains([
          { id: 'DOM-01', name: 'Finanzas' },
          { id: 'DOM-02', name: 'Ventas' },
          { id: 'DOM-03', name: 'Recursos Humanos' },
          { id: 'DOM-04', name: 'Logística' }
        ]);
      }
    }
  }, [currentTenant?.id]);

  const fetchMetadata = async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(currentTenant.id);
    if (!isUUID) {
      // Mock data for DEMO mode
      setAssets([
        { id: '1', name: 'CLIENTES_MASTER', source: 'Oracle ERP', data_owner: 'Carlos Director', records_count: '1.2M' },
        { id: '2', name: 'VENTAS_2024', source: 'Salesforce', data_owner: 'Ana García', records_count: '450K' }
      ]);
      setFields([
        { id: '1', field_name: 'EMAIL', data_type: 'VARCHAR', is_sensitive: true, sensitivity: 'PII', quality_rule: 'Formato Email', asset: { name: 'CLIENTES_MASTER' } },
        { id: '2', field_name: 'TOTAL_AMOUNT', data_type: 'DECIMAL', is_sensitive: false, sensitivity: 'Confidencial', quality_rule: '> 0', asset: { name: 'VENTAS_2024' } }
      ]);
      setGlossary([
        { id: '1', term: 'Cliente Activo', definition: 'Usuario con compra en últimos 6 meses', domain: 'Comercial', status: 'Publicado' }
      ]);
      setLoading(false);
      return;
    }

    try {
      // Fetch Assets (Scanner)
      const { data: assetsData } = await supabase
        .from('data_assets')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });
      
      setAssets(assetsData || []);

      // Fetch Fields for Classification
      if (assetsData && assetsData.length > 0) {
        const assetIds = assetsData.map(a => a.id);
        const { data: fieldsData } = await supabase
          .from('asset_fields')
          .select('*, asset:data_assets(name)')
          .in('asset_id', assetIds);
        setFields(fieldsData || []);
      } else {
        setFields([]);
      }

      // Fetch Glossary
      const { data: glossaryData } = await supabase
        .from('glossary_terms')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('term', { ascending: true });
      
      setGlossary(glossaryData || []);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const piiFieldsCount = fields.filter(f => f.is_sensitive === true || f.sensitivity === 'Confidencial').length;
  
  const kpis = [
    { label: 'Activos Descubiertos', value: assets.length.toString(), icon: Database, color: 'blue' },
    { label: 'Columnas Analizadas', value: fields.length.toString(), icon: Brain, color: 'purple' },
    { label: 'Campos Sensibles', value: piiFieldsCount.toString(), icon: ShieldAlert, color: 'red' },
    { label: 'Términos de Negocio', value: glossary.length.toString(), icon: BookOpen, color: 'green' },
  ];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      fetchMetadata();
      setIsScanning(false);
    }, 2000);
  };

  const handleSaveGlossaryTerm = async () => {
    if (!newTerm.term || !newTerm.definition) return;
    if (!currentTenant?.id) return;
    
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(currentTenant.id);
    
    if (!isUUID) {
      const newLocalTerm = {
        id: Math.random().toString(),
        term: newTerm.term,
        definition: newTerm.definition,
        domain: newTerm.domain || 'General',
        status: 'Publicado'
      };
      setGlossary([...glossary, newLocalTerm]);
      setShowGlossaryModal(false);
      setNewTerm({ term: '', definition: '', domain: '' });
      return;
    }

    try {
      const { data, error } = await supabase.from('glossary_terms').insert([{
        tenant_id: currentTenant.id,
        term: newTerm.term,
        definition: newTerm.definition,
        domain: newTerm.domain || 'General',
        status: 'Publicado'
      }]).select();

      if (error) throw error;
      if (data) {
        setGlossary([...glossary, data[0]]);
        setShowGlossaryModal(false);
        setNewTerm({ term: '', definition: '', domain: '' });
      }
    } catch (err) {
      console.error('Error saving glossary term:', err);
      // Fallback a local state si la tabla no existe en Supabase
      const newLocalTerm = {
        id: Math.random().toString(),
        term: newTerm.term,
        definition: newTerm.definition,
        domain: newTerm.domain || 'General',
        status: 'Publicado'
      };
      setGlossary([...glossary, newLocalTerm]);
      setShowGlossaryModal(false);
      setNewTerm({ term: '', definition: '', domain: '' });
    }
  };

  if (!isMounted) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconCircle}>
            <Brain size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: '8px' }}>Metadata Intelligence</h1>
            <p style={{ margin: 0 }}>Descubre, clasifica y conecta toda la información de {currentTenant?.name || 'tu organización'} de forma automática.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={handleScan} disabled={isScanning || loading}>
            <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Sincronizando...' : 'Sincronizar Catálogo'}
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={styles.kpiCard}>
              <div className={`${styles.kpiIcon} ${styles[kpi.color]}`}>
                <Icon size={28} />
              </div>
              <div className={styles.kpiInfo}>
                <h3>{kpi.label}</h3>
                <div className={styles.kpiValue}>{loading ? '...' : kpi.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'scanner' ? styles.active : ''}`} onClick={() => setActiveTab('scanner')}>
          <Search size={18} /> Fuentes Conectadas
        </button>
        <button className={`${styles.tab} ${activeTab === 'classification' ? styles.active : ''}`} onClick={() => setActiveTab('classification')}>
          <ShieldAlert size={18} /> Clasificación de Campos
        </button>
        <button className={`${styles.tab} ${activeTab === 'lineage' ? styles.active : ''}`} onClick={() => setActiveTab('lineage')}>
          <Network size={18} /> Trazabilidad Lógica
        </button>
        <button className={`${styles.tab} ${activeTab === 'glossary' ? styles.active : ''}`} onClick={() => setActiveTab('glossary')}>
          <BookOpen size={18} /> Glosario Corporativo
        </button>
      </div>

      {/* Tab Content */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'scanner' && (
          <div className={styles.contentGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Activos Importados del Catálogo de Datos</h3>
              </div>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando activos...</div>
              ) : assets.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay activos registrados en tu catálogo.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Activo (Tabla/Vista)</th>
                      <th>Fuente (Origen)</th>
                      <th>Propietario</th>
                      <th>Registros</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(asset => (
                      <tr key={asset.id}>
                        <td><strong>{asset.name}</strong></td>
                        <td>{asset.source || 'Base de Datos'}</td>
                        <td>{asset.data_owner || asset.owner || 'No asignado'}</td>
                        <td>{asset.records_count || 'N/A'}</td>
                        <td><span className={`${styles.badge} ${styles.active}`}>Sincronizado</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Scanner Logs (Tiempo Real)</h3>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                <p><strong>{new Date().toLocaleTimeString()}</strong> - Scanner inicializado. Conectado a tenant {currentTenant?.name}.</p>
                {assets.slice(0, 5).map((a, i) => (
                  <p key={a.id}><strong>{new Date(new Date().getTime() - (i * 60000)).toLocaleTimeString()}</strong> - [Catálogo] Activo sincronizado: {a.name} ({a.source}).</p>
                ))}
                {assets.length === 0 && <p>Esperando la creación de activos en el catálogo de datos...</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classification' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Clasificación de Sensibilidad de Columnas</h3>
                <button className={styles.secondaryBtn} onClick={fetchMetadata}>Refrescar</button>
              </div>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando campos...</div>
              ) : fields.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay columnas o campos registrados.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Columna</th>
                      <th>Activo Relacionado</th>
                      <th>Tipo Dato</th>
                      <th>Sensibilidad</th>
                      <th>Regla de Calidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(field => (
                      <tr key={field.id}>
                        <td><strong>{field.field_name}</strong></td>
                        <td>{field.asset?.name || 'Desconocido'}</td>
                        <td>{field.data_type || 'VARCHAR'}</td>
                        <td>
                          {field.is_sensitive || field.sensitivity === 'Confidencial' || field.sensitivity === 'Restringido' ? (
                            <span className={`${styles.badge} ${styles.pii}`}><EyeOff size={12} style={{display:'inline', marginRight:'4px'}}/> Sensible ({field.sensitivity || 'PII'})</span>
                          ) : (
                            <span className={`${styles.badge} ${styles.standard}`}>Estándar ({field.sensitivity || 'Público'})</span>
                          )}
                        </td>
                        <td>{field.quality_rule || 'Sin reglas'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lineage' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Data Lineage (Trazabilidad)</h3>
                <div className={styles.headerActions}>
                  <select className={styles.secondaryBtn} style={{ padding: '8px' }}>
                    <option>Buscar activo...</option>
                    {assets.map(a => <option key={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
                <div className={styles.lineageFlow} style={{ width: '400px' }}>
                  <div className={styles.lineageNode}>
                    <div>
                      <h4>Fuente de Origen</h4>
                      <p>Sistemas Conectados</p>
                    </div>
                    <Database size={20} color="#3b82f6" />
                  </div>
                  <div className={styles.arrowDown}><ArrowDown size={20} /></div>
                  <div className={styles.lineageNode}>
                    <div>
                      <h4>Data Lake / DWH (Procesamiento)</h4>
                      <p>Transformaciones de Calidad</p>
                    </div>
                    <RefreshCw size={20} color="#8b5cf6" />
                  </div>
                  <div className={styles.arrowDown}><ArrowDown size={20} /></div>
                  <div className={styles.lineageNode}>
                    <div>
                      <h4>Catálogo de Datos</h4>
                      <p>Exposición a Usuarios</p>
                    </div>
                    <Activity size={20} color="#10b981" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className={styles.contentGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Diccionario de Términos</h3>
                <button className={styles.primaryBtn} style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setShowGlossaryModal(true)}>
                  <Plus size={16} /> Nuevo Término
                </button>
              </div>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando glosario...</div>
              ) : glossary.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>El glosario está vacío. Agrega tu primer término de negocio.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Término</th>
                      <th>Definición Negocio</th>
                      <th>Dominio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glossary.map(term => (
                      <tr key={term.id}>
                        <td><strong>{term.term}</strong></td>
                        <td>{term.definition}</td>
                        <td>{term.domain || 'General'}</td>
                        <td><span className={`${styles.badge} ${styles.active}`}>{term.status || 'Publicado'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </motion.div>

      {/* MODAL: Nuevo Término de Glosario */}
      <AnimatePresence>
        {showGlossaryModal && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className={styles.modalHeader}>
                <h2>Agregar Término al Glosario</h2>
                <button className={styles.closeBtn} onClick={() => setShowGlossaryModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Término de Negocio</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Ej. Cliente Activo"
                    value={newTerm.term}
                    onChange={(e) => setNewTerm({...newTerm, term: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Definición</label>
                  <textarea 
                    className={styles.input} 
                    rows={3} 
                    placeholder="Describe claramente el concepto..."
                    value={newTerm.definition}
                    onChange={(e) => setNewTerm({...newTerm, definition: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Dominio</label>
                  <select 
                    className={styles.input}
                    value={newTerm.domain}
                    onChange={(e) => setNewTerm({...newTerm, domain: e.target.value})}
                  >
                    <option value="">Seleccionar Dominio...</option>
                    {domains.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setShowGlossaryModal(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleSaveGlossaryTerm}>
                  <Save size={18} /> Guardar Término
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
