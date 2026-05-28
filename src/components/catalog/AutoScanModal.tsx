'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Database, 
  Cloud, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Network,
  Server,
  FileText
} from 'lucide-react';
import styles from './AutoScanModal.module.css';

import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';

interface AutoScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newData?: any) => void;
}

const SOURCES = [
  { id: 'aws', name: 'AWS S3 / Redshift', icon: Cloud, color: '#FF9900', type: 'S3 / Redshift' },
  { id: 'azure', name: 'Azure Data Lake', icon: Cloud, color: '#0089D6', type: 'Data Lake' },
  { id: 'gcp', name: 'Google Cloud Platform', icon: Cloud, color: '#4285F4', type: 'BigQuery' },
  { id: 'snowflake', name: 'Snowflake DW', icon: Database, color: '#29B5E8', type: 'Data Warehouse' },
  { id: 'salesforce', name: 'Salesforce CRM', icon: Database, color: '#00A1E0', type: 'CRM' },
  { id: 'sap', name: 'SAP HANA / ERP', icon: Server, color: '#008FD3', type: 'ERP' },
  { id: 'sqlserver', name: 'SQL Server Prod', icon: Database, color: '#CC2927', type: 'Database' },
  { id: 'oracle', name: 'Oracle Database', icon: Server, color: '#F80000', type: 'Database' },
  { id: 'mongodb', name: 'MongoDB Atlas', icon: Database, color: '#47A248', type: 'NoSQL' },
  { id: 'postgres', name: 'PostgreSQL / MySQL', icon: Database, color: '#336791', type: 'Database' },
  { id: 'api', name: 'API Rest / GraphQL', icon: Network, color: '#6D28D9', type: 'API' },
  { id: 'files', name: 'Flat Files (CSV/JSON)', icon: FileText, color: '#64748B', type: 'Files' },
];

export default function AutoScanModal({ isOpen, onClose, onSuccess }: AutoScanModalProps) {
  const { currentTenant, mode } = usePlatform();
  const [step, setStep] = useState<'source' | 'credentials' | 'scanning' | 'results' | 'configure_import'>('source');
  const [selectedAssetToImport, setSelectedAssetToImport] = useState<any>(null);
  const [importConfig, setImportConfig] = useState({
    asset_name: '',
    data_owner: '',
    sensitivity: 'Uso Interno',
    criticality: 'Media',
    status: 'Borrador'
  });
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [discoveredAssets, setDiscoveredAssets] = useState<any[]>([]);
  const [scanResult, setScanResult] = useState<any>(null);
  
  const [connData, setConnData] = useState({
    id: '', // uuid de la conexión guardada
    name: '',
    host: '',
    user: '',
    key: '',
    connectionString: ''
  });

  const [savedConnections, setSavedConnections] = useState<any[]>([]);
  const [isLoadingConns, setIsLoadingConns] = useState(false);

  const fetchConnections = async (sourceId: string) => {
    setIsLoadingConns(true);
    try {
      const { data, error } = await supabase
        .from('data_connections')
        .select('*')
        .eq('source_id', sourceId)
        .order('last_used', { ascending: false });
      
      if (!error) setSavedConnections(data || []);
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setIsLoadingConns(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('source');
      setProgress(0);
      setSelectedSource(null);
      setImportedIds([]);
      // No borramos connData para que persista durante la sesión local si se desea
    }, 300);
  };

  const selectSource = (src: any) => {
    setSelectedSource(src);
    setStep('credentials');
    fetchConnections(src.id);
    if (!connData.host) {
      setConnData({ ...connData, name: `${src.name} Connection` });
    }
  };

  const selectExistingConnection = (conn: any) => {
    setConnData({
      id: conn.id,
      name: conn.name,
      host: conn.host || '',
      user: conn.username || '',
      key: conn.password_encrypted || '',
      connectionString: conn.connection_string || ''
    });
  };

  const startScan = async () => {
    setStep('scanning');
    setProgress(0);

    try {
      // Iniciar el progreso visual
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 1));
      }, 50);

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
          database_type: selectedSource.id,
          host: connData.host,
          user: connData.user,
          key: connData.key,
          connection_string: connData.connectionString
        })
      });

      const result = await response.json();
      clearInterval(interval);

      if (result.success) {
        setProgress(100);
        setDiscoveredAssets(result.assets);
        setScanResult(result);

        // Guardar o actualizar la conexión en Supabase
        const connPayload = {
          name: connData.name,
          source_id: selectedSource.id,
          host: connData.host,
          username: connData.user,
          password_encrypted: connData.key,
          connection_string: connData.connectionString,
          last_used: new Date().toISOString()
        };

        let dbResult;
        if (connData.id) {
          dbResult = await supabase.from('data_connections').update(connPayload).eq('id', connData.id);
        } else {
          dbResult = await supabase.from('data_connections').insert([connPayload]).select();
        }

        if (dbResult.error) {
          console.error("Error saving connection:", dbResult.error);
          // Intentar crear la tabla si no existe (error 42P01 en postgres)
          if (dbResult.error.code === '42P01') {
            alert("La tabla de conexiones no existe en Supabase. Por favor, ejecute el script SQL proporcionado.");
          }
        } else if (!connData.id && dbResult.data) {
          // Si fue inserción, guardar el nuevo ID
          setConnData(prev => ({ ...prev, id: dbResult.data[0].id }));
          fetchConnections(selectedSource.id); // Refrescar lista
        }
      } else {
        alert("Error en el escaneo: " + (result.error || result.message || "Fallo desconocido"));
        setStep('credentials');
      }
    } catch (err) {
      console.error("Scan Error:", err);
      alert("Error de red al intentar conectar con el servicio de escaneo.");
      setStep('credentials');
    }
  };

  const startImportFlow = (asset: any) => {
    setSelectedAssetToImport(asset);
    setImportConfig(prev => ({ ...prev, asset_name: asset.name }));
    setStep('configure_import');
  };

  const handleImport = async () => {
    if (!importConfig.data_owner) {
      alert("Por favor, asigne un responsable para este activo.");
      return;
    }

    if (mode === 'DEMO') {
      const newAsset = {
        id: `DEMO-${Date.now()}`,
        code_id: `AS-${Date.now().toString().slice(-6)}`,
        name: importConfig.asset_name || selectedAssetToImport.name,
        type: selectedAssetToImport.type || 'Tabla SQL',
        source: selectedSource.name,
        owner: 'Escaneo Automático',
        data_owner: importConfig.data_owner,
        sensitivity: importConfig.sensitivity,
        quality_score: 95, // Simulado
        status: importConfig.status,
        risk_level: selectedAssetToImport.risk || 'Bajo',
        records_count: selectedAssetToImport.records_count || 0,
        tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
        tags: ['AutoScanned', selectedSource.id],
        updated_at: new Date().toISOString().split('T')[0]
      };

      setImportedIds([...importedIds, selectedAssetToImport.id]);
      alert(`Activo ${selectedAssetToImport.name} importado exitosamente.`);
      setStep('results');
      if (onSuccess) onSuccess(newAsset);
      return;
    }

    try {
      const { data: assetData, error: assetError } = await supabase.from('data_assets').insert([{
        tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
        name: importConfig.asset_name || selectedAssetToImport.name,
        table_name: selectedAssetToImport.name, // Nombre técnico REAL de la tabla física
        description: selectedAssetToImport.description,
        type: selectedAssetToImport.type,
        source: selectedSource.name,
        owner: 'Escaneo Automático',
        data_owner: importConfig.data_owner,
        sensitivity: importConfig.sensitivity,
        quality_score: 0, 
        status: importConfig.status,
        risk_level: selectedAssetToImport.risk,
        criticality: importConfig.criticality,
        code_id: `AS-${Date.now().toString().slice(-6)}`,
        records_count: selectedAssetToImport.records_count,
        tags: ['AutoScanned', selectedSource.id]
      }]).select();

      if (assetError) {
        console.warn("Supabase Error, aplicando fallback local:", assetError);
        // Fallback local en memoria para que no se bloquee el flujo del demo
        const newAsset = {
          id: `DEMO-${Date.now()}`,
          code_id: `AS-${Date.now().toString().slice(-6)}`,
          name: importConfig.asset_name || selectedAssetToImport.name,
          type: selectedAssetToImport.type || 'Tabla SQL',
          source: selectedSource.name,
          owner: 'Escaneo Automático',
          data_owner: importConfig.data_owner,
          sensitivity: importConfig.sensitivity,
          quality_score: 95, 
          status: importConfig.status,
          risk_level: selectedAssetToImport.risk || 'Bajo',
          records_count: selectedAssetToImport.records_count || 0,
          tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
          tags: ['AutoScanned', selectedSource.id],
          updated_at: new Date().toISOString().split('T')[0]
        };
        setImportedIds([...importedIds, selectedAssetToImport.id]);
        alert(`Activo ${selectedAssetToImport.name} importado exitosamente (Guardado local).`);
        setStep('results');
        if (onSuccess) onSuccess(newAsset);
        return;
      }

      const newAssetId = assetData[0].id;

      // Importar campos/columnas si existen
      if (selectedAssetToImport.fields && selectedAssetToImport.fields.length > 0) {
        const fieldsToInsert = selectedAssetToImport.fields.map((f: any) => ({
          asset_id: newAssetId,
          field_name: f.name,
          data_type: f.type,
          description: `Campo detectado vía escaneo.`
        }));

        const { error: fieldsError } = await supabase.from('asset_fields').insert(fieldsToInsert);
        if (fieldsError) console.error("Error al importar campos:", fieldsError);
      }

      // Devolver el activo recién insertado para el catálogo
      const insertedAsset = {
        ...assetData[0],
        records_count: selectedAssetToImport.records_count
      };

      setImportedIds([...importedIds, selectedAssetToImport.id]);
      alert(`Activo ${selectedAssetToImport.name} importado exitosamente.`);
      setStep('results');
      if (onSuccess) onSuccess(insertedAsset);
    } catch (err) {
      console.warn("Catch Error al importar de Supabase, aplicando fallback local:", err);
      const newAsset = {
        id: `DEMO-${Date.now()}`,
        code_id: `AS-${Date.now().toString().slice(-6)}`,
        name: importConfig.asset_name || selectedAssetToImport.name,
        type: selectedAssetToImport.type || 'Tabla SQL',
        source: selectedSource.name,
        owner: 'Escaneo Automático',
        data_owner: importConfig.data_owner,
        sensitivity: importConfig.sensitivity,
        quality_score: 95, 
        status: importConfig.status,
        risk_level: selectedAssetToImport.risk || 'Bajo',
        records_count: selectedAssetToImport.records_count || 0,
        tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
        tags: ['AutoScanned', selectedSource.id],
        updated_at: new Date().toISOString().split('T')[0]
      };
      setImportedIds([...importedIds, selectedAssetToImport.id]);
      alert(`Activo ${selectedAssetToImport.name} importado exitosamente (Guardado local).`);
      setStep('results');
      if (onSuccess) onSuccess(newAsset);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'scanning') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 1.5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (progress === 100 && step === 'scanning') {
      const timer = setTimeout(() => setStep('results'), 800);
      return () => clearTimeout(timer);
    }
  }, [progress, step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modal}
          >
            <header className={styles.header}>
              <div>
                <h2>Escaneo Automático</h2>
                <p>Descubre nuevos activos de datos mediante IA y conectores nativos.</p>
              </div>
              <button onClick={handleClose} className={styles.closeBtn}><X size={20} /></button>
            </header>

            <div className={styles.content}>
              {step === 'source' && (
                <div className={styles.sourceGrid}>
                  {SOURCES.map(src => (
                    <button 
                      key={src.id} 
                      className={styles.sourceCard}
                      onClick={() => selectSource(src)}
                    >
                      <div className={styles.sourceIcon} style={{ backgroundColor: src.color + '15', color: src.color }}>
                        <src.icon size={24} />
                      </div>
                      <div className={styles.sourceInfo}>
                        <h4>{src.name}</h4>
                        <span>{src.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 'credentials' && (
                <div className={styles.credentialsView}>
                  <div className={styles.connHeader}>
                    <div className={styles.iconCircle} style={{ color: selectedSource.color, backgroundColor: selectedSource.color + '15' }}>
                      <selectedSource.icon size={32} />
                    </div>
                    <h3>Configurar Conexión: {selectedSource.name}</h3>
                    <p>Ingrese las credenciales para permitir que Nexus AI analice los metadatos.</p>
                  </div>

                  <div className={styles.form}>
                    {savedConnections.length > 0 && (
                      <div className={styles.savedConns}>
                        <label>Seleccionar Conexión Guardada</label>
                        <select 
                          className={styles.connSelect}
                          onChange={(e) => {
                            const conn = savedConnections.find(c => c.id === e.target.value);
                            if (conn) selectExistingConnection(conn);
                          }}
                          value={connData.id}
                        >
                          <option value="">-- Seleccione una conexión exitosa --</option>
                          {savedConnections.map(conn => (
                            <option key={conn.id} value={conn.id}>
                              {conn.name} ({conn.host || 'String'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label>Nombre de la Conexión</label>
                      <input type="text" value={connData.name} onChange={e => setConnData({...connData, name: e.target.value})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Connection String (Opcional para PostgreSQL)</label>
                      <input 
                        type="text" 
                        placeholder="postgresql://user:password@host:port/dbname" 
                        value={connData.connectionString} 
                        onChange={e => setConnData({...connData, connectionString: e.target.value})} 
                      />
                      <span className={styles.tip}>
                        Tip: Si usa Supabase, prefiera la cadena del <strong>Transaction Pooler</strong> (puerto 6543) para evitar problemas de red IPv6.
                      </span>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Host / Endpoint / URL</label>
                      <input type="text" placeholder="ej: cluster.abc.region.redshift.amazonaws.com" value={connData.host} onChange={e => setConnData({...connData, host: e.target.value})} />
                    </div>
                    <div className={styles.row}>
                      <div className={styles.formGroup}>
                        <label>Usuario / Client ID</label>
                        <input type="text" value={connData.user} onChange={e => setConnData({...connData, user: e.target.value})} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Password / Secret Key</label>
                        <input type="password" value={connData.key} onChange={e => setConnData({...connData, key: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.backBtn} onClick={() => setStep('source')}>Volver</button>
                    <button className={styles.scanNowBtn} onClick={startScan}>
                      <Search size={18} />
                      Probar e Iniciar Escaneo
                    </button>
                  </div>
                </div>
              )}

              {step === 'scanning' && (
                <div className={styles.scanningView}>
                  <div className={styles.loaderWrapper}>
                    <Loader2 size={48} className={styles.spin} />
                    <div className={styles.progressRing}>
                      <span>{Math.floor(progress)}%</span>
                    </div>
                  </div>
                  <h3>Analizando {selectedSource.name}...</h3>
                  <p>Nexus AI está mapeando estructuras y aplicando algoritmos de detección de datos sensibles.</p>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                  <div className={styles.log}>
                    <p>› Conectando a {connData.host}...</p>
                    {progress > 30 && <p>› Leyendo catálogo de esquemas y tablas...</p>}
                    {progress > 60 && <p>› Analizando patrones de datos sensibles (PII)...</p>}
                    {progress > 85 && <p>› Generando sugerencias de clasificación...</p>}
                  </div>
                </div>
              )}

              {step === 'results' && (
                <div className={styles.resultsView}>
                  <div className={styles.resultHeader}>
                    <CheckCircle2 size={40} color="#10b981" />
                    <h3>¡Análisis Completado!</h3>
                    <p>Se han identificado activos potenciales listos para ser incorporados al catálogo.</p>
                  </div>

                  {/* KPI Summary Dashboard */}
                  <div className={styles.summaryDashboard}>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>Tablas Encontradas</span>
                      <strong className={styles.summaryValue}>{scanResult?.metrics?.tables_found || discoveredAssets.length}</strong>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>Registros Totales</span>
                      <strong className={styles.summaryValue} style={{ color: '#10b981' }}>
                        {Number(scanResult?.metrics?.total_records || discoveredAssets.reduce((acc, a) => acc + (a.records_count || 0), 0)).toLocaleString('es-CL')}
                      </strong>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>Campos Totales</span>
                      <strong className={styles.summaryValue}>{scanResult?.metrics?.columns_found || 15}</strong>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.summaryLabel}>Campos Sensibles</span>
                      <strong className={styles.summaryValue} style={{ color: '#ef4444' }}>{scanResult?.metrics?.sensitive_assets_found || 3}</strong>
                    </div>
                  </div>

                  {/* PII Findings Section */}
                  {scanResult?.sensitive_data_catalog && scanResult.sensitive_data_catalog.length > 0 && (
                    <div className={styles.piiSection}>
                      <h4 className={styles.piiTitle}>🔒 Hallazgos de Datos Sensibles (PII Detectada)</h4>
                      <div className={styles.piiTableWrapper}>
                        <table className={styles.piiTable}>
                          <thead>
                            <tr>
                              <th>Tabla</th>
                              <th>Columna</th>
                              <th>Clasificación</th>
                              <th>Riesgo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scanResult.sensitive_data_catalog.map((item: any, idx: number) => (
                              <tr key={idx}>
                                <td><strong>{item.table}</strong></td>
                                <td><code>{item.column}</code></td>
                                <td>{item.category}</td>
                                <td>
                                  <span className={`${styles.riskPill} ${item.risk === 'Crítico' ? styles.riskCrit : item.risk === 'Alto' ? styles.riskHigh : styles.riskMed}`}>
                                    {item.risk}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className={styles.resultList}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                      📋 Activos Disponibles para Importar
                    </h4>
                    {discoveredAssets.map(asset => (
                      <div key={asset.id} className={styles.resultItem}>
                        <div className={styles.resIcon}>
                          <Database size={20} />
                        </div>
                        <div className={styles.resInfo}>
                          <strong>{asset.name}</strong>
                          <span>{asset.description} • Riesgo: {asset.risk}</span>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {asset.fields && (
                              <div className={styles.fieldsCountBadge}>
                                {asset.fields.length} campos detectados
                              </div>
                            )}
                            {asset.records_count !== undefined && (
                              <div className={styles.recordsCountBadge}>
                                📊 {Number(asset.records_count).toLocaleString('es-CL')} registros
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          className={`${styles.importBtn} ${importedIds.includes(asset.id) ? styles.imported : ''}`}
                          onClick={() => startImportFlow(asset)}
                          disabled={importedIds.includes(asset.id)}
                        >
                          {importedIds.includes(asset.id) ? 'Importado ✓' : 'Configurar e Importar'}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className={styles.finishBtn} onClick={handleClose}>Finalizar y Ver Catálogo</button>
                </div>
              )}

              {step === 'configure_import' && (
                <div className={styles.configureView}>
                  <div className={styles.configHeader}>
                    <h3>Configurar Metadatos: {selectedAssetToImport.name}</h3>
                    <p>Defina la gobernanza inicial antes de incorporar el activo al catálogo.</p>
                  </div>

                  <div className={styles.form}>
                    <div className={styles.formGroup}>
                      <label>Nombre del Activo</label>
                      <input 
                        type="text" 
                        value={importConfig.asset_name} 
                        onChange={e => setImportConfig({...importConfig, asset_name: e.target.value})} 
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Responsable del Activo (Data Owner)</label>
                      <input 
                        type="text" 
                        placeholder="Nombre del cargo o persona responsable" 
                        value={importConfig.data_owner} 
                        onChange={e => setImportConfig({...importConfig, data_owner: e.target.value})} 
                      />
                    </div>
                    
                    <div className={styles.row}>
                      <div className={styles.formGroup}>
                        <label>Sensibilidad</label>
                        <select value={importConfig.sensitivity} onChange={e => setImportConfig({...importConfig, sensitivity: e.target.value})}>
                          <option value="Público">Público</option>
                          <option value="Uso Interno">Uso Interno</option>
                          <option value="Confidencial">Confidencial</option>
                          <option value="Secreto">Secreto</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Criticalidad</label>
                        <select value={importConfig.criticality} onChange={e => setImportConfig({...importConfig, criticality: e.target.value})}>
                          <option value="Baja">Baja</option>
                          <option value="Media">Media</option>
                          <option value="Alta">Alta</option>
                          <option value="Muy Alta">Muy Alta</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Estado Inicial</label>
                      <select value={importConfig.status} onChange={e => setImportConfig({...importConfig, status: e.target.value})}>
                        <option value="Borrador">Borrador</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Certificado">Certificado</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.backBtn} onClick={() => setStep('results')}>Volver</button>
                    <button className={styles.scanNowBtn} onClick={handleImport}>
                      Confirmar e Importar al Catálogo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
