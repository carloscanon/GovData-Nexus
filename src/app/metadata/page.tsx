'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Database, Search, ShieldAlert, Network, BookOpen, 
  Plus, RefreshCw, ChevronDown, ArrowDown, Activity, Key, EyeOff, Save, X, Edit2, Trash2
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
  const [semanticDict, setSemanticDict] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Glosario
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '', domain: '' });
  const [domains, setDomains] = useState<any[]>([]);
  const [selectedLineageAsset, setSelectedLineageAsset] = useState<any>(null);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);

  // States para Búsqueda Inteligente y Semántica
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterSensitivity, setFilterSensitivity] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterMinQuality, setFilterMinQuality] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchMetadata();
  }, [currentTenant?.id]);

  const fetchMetadata = async () => {
    if (!currentTenant?.id) return;
    setLoading(true);

    const loadDemoData = () => {
      const demoAssets = [
        { id: '1', name: 'Maestro de Clientes', source: 'SAP ERP', data_owner: 'Carlos Ruiz', records_count: '12450', status: 'Sincronizado', created_at: new Date().toISOString() },
        { id: '2', name: 'Transacciones Q2', source: 'Oracle DB', data_owner: 'Maria Silva', records_count: '15200', status: 'Sincronizado', created_at: new Date().toISOString() },
        { id: '3', name: 'Leads Marketing', source: 'Salesforce', data_owner: 'Juan Perez', records_count: '8500', status: 'Sincronizado', created_at: new Date().toISOString() },
        { id: '4', name: 'Reporte Consolidado', source: 'Data Lake', data_owner: 'Andres Gomez', records_count: '5000', status: 'Sincronizado', created_at: new Date().toISOString() }
      ];
      setAssets(demoAssets);
      setSelectedLineageAsset(demoAssets[0]);

      const demoFields = [
        { id: 'f1', asset_id: '1', field_name: 'id', data_type: 'INTEGER', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Unicidad', asset: { name: 'Maestro de Clientes' } },
        { id: 'f2', asset_id: '1', field_name: 'nombre', data_type: 'VARCHAR', is_sensitive: false, sensitivity: 'Público', quality_rule: 'No Nulo', asset: { name: 'Maestro de Clientes' } },
        { id: 'f3', asset_id: '1', field_name: 'email', data_type: 'VARCHAR', is_sensitive: true, sensitivity: 'Confidencial', quality_rule: 'Formato Correo', asset: { name: 'Maestro de Clientes' } },
        { id: 'f4', asset_id: '1', field_name: 'telefono', data_type: 'VARCHAR', is_sensitive: true, sensitivity: 'Confidencial', quality_rule: 'Formato Celular', asset: { name: 'Maestro de Clientes' } },
        { id: 'f5', asset_id: '1', field_name: 'rut', data_type: 'VARCHAR', is_sensitive: true, sensitivity: 'Restringido', quality_rule: 'Algoritmo Rut', asset: { name: 'Maestro de Clientes' } },
        { id: 'f6', asset_id: '2', field_name: 'id_transaccion', data_type: 'INTEGER', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Unicidad', asset: { name: 'Transacciones Q2' } },
        { id: 'f7', asset_id: '2', field_name: 'cliente_id', data_type: 'INTEGER', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Clave Foránea', asset: { name: 'Transacciones Q2' } },
        { id: 'f8', asset_id: '2', field_name: 'monto', data_type: 'NUMERIC', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Rango Positivo', asset: { name: 'Transacciones Q2' } },
        { id: 'f9', asset_id: '2', field_name: 'estado', data_type: 'VARCHAR', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Valores Permitidos', asset: { name: 'Transacciones Q2' } }
      ];
      setFields(demoFields);

      const demoGlossary = [
        { id: 'g1', term: 'Cliente', definition: 'Persona natural o jurídica que adquiere productos o servicios de la compañía.', domain: 'Ventas', status: 'Publicado' },
        { id: 'g2', term: 'Transacción', definition: 'Registro de una operación financiera o comercial realizada por un cliente.', domain: 'Finanzas', status: 'Publicado' },
        { id: 'g3', term: 'Leads', definition: 'Contacto comercial potencial registrado a través de campañas de marketing.', domain: 'Marketing', status: 'Publicado' },
        { id: 'g4', term: 'DQI', definition: 'Data Quality Index, métrica unificada de la calidad de un activo de datos.', domain: 'Gobernanza', status: 'Publicado' }
      ];
      setGlossary(demoGlossary);

      const demoSemantic = [
        { id: 's1', term: 'id', synonyms: ['id_cliente', 'client_id', 'cliente_id'] },
        { id: 's2', term: 'nombre', synonyms: ['nombre_cliente', 'name', 'full_name'] },
        { id: 's3', term: 'email', synonyms: ['correo', 'mail', 'email_contacto'] },
        { id: 's4', term: 'telefono', synonyms: ['phone', 'celular', 'tel'] }
      ];
      setSemanticDict(demoSemantic);

      setDomains([
        { id: 'DOM-01', name: 'Finanzas' },
        { id: 'DOM-02', name: 'Ventas' },
        { id: 'DOM-03', name: 'Recursos Humanos' },
        { id: 'DOM-04', name: 'Logística' }
      ]);
    };

    if (mode === 'DEMO') {
      loadDemoData();
      setLoading(false);
      return;
    }
    
    try {
      // Fetch Assets (Scanner)
      const { data: assetsData, error: assetsError } = await supabase
        .from('data_assets')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });
      
      if (assetsError) throw assetsError;
      setAssets(assetsData || []);
      if (assetsData && assetsData.length > 0) {
        setSelectedLineageAsset((prev: any) => prev || assetsData[0]);
      }

      // Fetch Fields for Classification
      if (assetsData && assetsData.length > 0) {
        const assetIds = assetsData.map(a => a.id);
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('asset_fields')
          .select('*')
          .in('asset_id', assetIds);
        if (fieldsError) throw fieldsError;
        
        const enrichedFields = (fieldsData || []).map(f => {
          const associatedAsset = assetsData.find(a => a.id === f.asset_id);
          return {
            ...f,
            asset: associatedAsset ? { name: associatedAsset.name } : null
          };
        });
        setFields(enrichedFields);
      } else {
        setFields([]);
      }

      // Fetch Glossary
      const { data: glossaryData, error: glossaryError } = await supabase
        .from('glossary_terms')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('term', { ascending: true });
      
      if (glossaryError) throw glossaryError;
      setGlossary(glossaryData || []);

      // Fetch Semantic Dictionary
      const { data: dictData, error: dictError } = await supabase
        .from('semantic_dictionary')
        .select('*')
        .eq('tenant_id', currentTenant.id);
      if (dictError) throw dictError;
      setSemanticDict(dictData || []);

      // Fetch Domains
      const { data: domainsData, error: domainsError } = await supabase
        .from('team_domains')
        .select('id, name')
        .eq('tenant_id', currentTenant.id);
      if (domainsError) throw domainsError;
      if (domainsData && domainsData.length > 0) {
        setDomains(domainsData);
      } else {
        setDomains([
          { id: 'DOM-01', name: 'Finanzas' },
          { id: 'DOM-02', name: 'Ventas' },
          { id: 'DOM-03', name: 'Recursos Humanos' },
          { id: 'DOM-04', name: 'Logística' }
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching metadata (Tables might not exist in Supabase):', err);
      // Fallback a demo si falla la conexión o las tablas
      loadDemoData();
      if (err.code === '42P01') {
        alert("Las tablas de metadata no existen en la base de datos Supabase. Se cargaron los datos de muestra.");
      }
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
    
    try {
      if (editingTermId) {
        const { error } = await supabase.from('glossary_terms').update({
          term: newTerm.term,
          definition: newTerm.definition,
          domain: newTerm.domain || 'General'
        }).eq('id', editingTermId);

        if (error) throw error;

        setGlossary(prev => prev.map(t => t.id === editingTermId ? {
          ...t,
          term: newTerm.term,
          definition: newTerm.definition,
          domain: newTerm.domain || 'General'
        } : t));
        setShowGlossaryModal(false);
        setEditingTermId(null);
        setNewTerm({ term: '', definition: '', domain: '' });
      } else {
        const { data, error } = await supabase.from('glossary_terms').insert([{
          tenant_id: currentTenant.id,
          term: newTerm.term,
          definition: newTerm.definition,
          domain: newTerm.domain || 'General',
          status: 'Publicado'
        }]).select();

        if (error) throw error;

        if (data && data.length > 0) {
          setGlossary([...glossary, data[0]]);
          setShowGlossaryModal(false);
          setNewTerm({ term: '', definition: '', domain: '' });
        }
      }
    } catch (err: any) {
      console.error('Error saving glossary term to database:', err);
      alert('Error guardando en la base de datos. ' + (err.message || ''));
    }
  };

  const handleDeleteGlossaryTerm = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este término de negocio?')) return;
    try {
      const { error } = await supabase.from('glossary_terms').delete().eq('id', id);
      if (error) throw error;
      setGlossary(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting glossary term:', err);
      alert('Error al eliminar de la base de datos: ' + err.message);
    }
  };
  // Reset all metadata for current tenant directly in DB
  const handleResetMetadata = async () => {
    if (!currentTenant?.id) return;
    
    try {
      await supabase.from('glossary_terms').delete().eq('tenant_id', currentTenant.id);
      await supabase.from('asset_fields').delete().eq('tenant_id', currentTenant.id);
      await supabase.from('data_assets').delete().eq('tenant_id', currentTenant.id);
      // Refresh UI
      fetchMetadata();
    } catch (err) {
      console.error('Error resetting metadata in database:', err);
    }
  };

  const matchesSearch = (asset: any, query: string) => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase().trim();
    
    // Obtener sinónimos si el término existe en el diccionario semántico de la BD
    let termsToSearch = [lowerQuery];
    semanticDict.forEach(entry => {
      const key = entry.term.toLowerCase();
      const synonyms = entry.synonyms || [];
      if (lowerQuery.includes(key) || synonyms.some((syn: string) => lowerQuery.includes(syn.toLowerCase()))) {
        termsToSearch = Array.from(new Set([...termsToSearch, key, ...synonyms.map((s: string) => s.toLowerCase())]));
      }
    });

    const name = (asset.name || '').toLowerCase();
    const description = (asset.description || '').toLowerCase();
    const source = (asset.source || '').toLowerCase();
    const owner = (asset.data_owner || asset.owner || '').toLowerCase();
    const sensitivity = (asset.sensitivity || '').toLowerCase();
    const type = (asset.type || '').toLowerCase();
    
    // Buscar en columnas
    const assetFields = fields.filter(f => f.asset_id === asset.id);
    const fieldsText = assetFields.map(f => (f.field_name || '').toLowerCase()).join(' ');

    // Buscar en términos de glosario relacionados
    const associatedGlossary = glossary.filter(t => 
      name.includes(t.term.toLowerCase()) || 
      t.term.toLowerCase().includes(name)
    );
    const glossaryText = associatedGlossary.map(t => (t.term || '').toLowerCase() + ' ' + (t.definition || '').toLowerCase()).join(' ');

    return termsToSearch.some(term => {
      return name.includes(term) ||
             description.includes(term) ||
             source.includes(term) ||
             owner.includes(term) ||
             sensitivity.includes(term) ||
             type.includes(term) ||
             fieldsText.includes(term) ||
             glossaryText.includes(term);
    });
  };

  const filteredAssets = assets.filter(asset => {
    // 1. Búsqueda principal (con lógica semántica)
    if (!matchesSearch(asset, searchQuery)) return false;

    // 2. Filtro por término de negocio
    if (filterTerm) {
      const lowerTerm = filterTerm.toLowerCase();
      const assetFields = fields.filter(f => f.asset_id === asset.id);
      const fieldsText = assetFields.map(f => (f.field_name || '').toLowerCase()).join(' ');
      const name = (asset.name || '').toLowerCase();
      const description = (asset.description || '').toLowerCase();
      if (!name.includes(lowerTerm) && !description.includes(lowerTerm) && !fieldsText.includes(lowerTerm)) {
        return false;
      }
    }

    // 3. Filtro por columna
    if (filterColumn) {
      const lowerCol = filterColumn.toLowerCase();
      const assetFields = fields.filter(f => f.asset_id === asset.id);
      const hasMatchingColumn = assetFields.some(f => (f.field_name || '').toLowerCase().includes(lowerCol));
      if (!hasMatchingColumn) return false;
    }

    // 4. Filtro por Owner/Propietario
    if (filterOwner) {
      const lowerOwner = filterOwner.toLowerCase();
      const currentOwner = (asset.data_owner || asset.owner || '').toLowerCase();
      if (!currentOwner.includes(lowerOwner)) return false;
    }

    // 5. Filtro por sensibilidad
    if (filterSensitivity) {
      const lowerSens = filterSensitivity.toLowerCase();
      const currentSens = (asset.sensitivity || '').toLowerCase();
      if (currentSens !== lowerSens) return false;
    }

    // 6. Filtro por dominio
    if (filterDomain) {
      const lowerDomain = filterDomain.toLowerCase();
      const currentOwner = (asset.owner || '').toLowerCase();
      const currentDomain = (asset.domain || '').toLowerCase();
      if (!currentOwner.includes(lowerDomain) && !currentDomain.includes(lowerDomain)) return false;
    }

    // 7. Filtro por calidad mínima
    if (filterMinQuality) {
      const minQ = parseInt(filterMinQuality, 10);
      const currentQ = asset.quality_score != null ? asset.quality_score : 85;
      if (currentQ < minQ) return false;
    }

    // 8. Filtro por fuente
    if (filterSource) {
      const lowerSrc = filterSource.toLowerCase();
      const currentSrc = (asset.source || '').toLowerCase();
      if (!currentSrc.includes(lowerSrc)) return false;
    }

    return true;
  });

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
                    <button className={styles.secondaryBtn} onClick={handleResetMetadata} disabled={loading} style={{ marginLeft: '8px' }}>
            Resetear Metadatos
          </button>
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
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader} style={{ marginBottom: '16px' }}>
                <h3>Activos Importados del Catálogo de Datos</h3>
              </div>

              {/* Buscador Inteligente y Filtros Avanzados */}
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input
                      type="text"
                      placeholder="Búsqueda Inteligente Semántica (ej. 'cliente' buscará tablas y campos asociados)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 42px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s',
                        fontWeight: 500
                      }}
                    />
                    {searchQuery && (
                      <span style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.75rem',
                        backgroundColor: '#eff6ff',
                        color: '#3b82f6',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        Búsqueda Semántica Activa
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className={styles.secondaryBtn}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
                  >
                    Filtros Avanzados
                    <ChevronDown size={16} style={{ transform: showAdvancedSearch ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>

                {showAdvancedSearch && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    {/* 1. Término de Negocio */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Término de negocio</label>
                      <select 
                        value={filterTerm} 
                        onChange={(e) => setFilterTerm(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                      >
                        <option value="">Todos los términos</option>
                        {glossary.map(g => (
                          <option key={g.id} value={g.term}>{g.term}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Columna */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Columna</label>
                      <input 
                        type="text"
                        placeholder="Nombre de columna..."
                        value={filterColumn}
                        onChange={(e) => setFilterColumn(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                      />
                    </div>

                    {/* 3. Owner */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Owner</label>
                      <select
                        value={filterOwner}
                        onChange={(e) => setFilterOwner(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                      >
                        <option value="">Todos los Owners</option>
                        {Array.from(new Set(assets.map(a => a.data_owner || a.owner).filter(Boolean))).map(owner => (
                          <option key={owner as string} value={owner as string}>{owner as string}</option>
                        ))}
                      </select>
                    </div>

                    {/* 4. Etiqueta de sensibilidad */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Sensibilidad</label>
                      <select
                        value={filterSensitivity}
                        onChange={(e) => setFilterSensitivity(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                      >
                        <option value="">Todas las sensibilidades</option>
                        <option value="Público">Público</option>
                        <option value="Interno">Interno</option>
                        <option value="Restringido">Restringido</option>
                        <option value="Confidencial">Confidencial</option>
                        <option value="Altamente Sensible">Altamente Sensible</option>
                      </select>
                    </div>

                    {/* 5. Dominio */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Dominio</label>
                      <select
                        value={filterDomain}
                        onChange={(e) => setFilterDomain(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                      >
                        <option value="">Todos los dominios</option>
                        {domains.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                        <option value="General">General</option>
                      </select>
                    </div>

                    {/* 6. Calidad Mínima */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Calidad Mínima</label>
                      <select
                        value={filterMinQuality}
                        onChange={(e) => setFilterMinQuality(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                      >
                        <option value="">Cualquier calidad</option>
                        <option value="90">&gt;= 90%</option>
                        <option value="80">&gt;= 80%</option>
                        <option value="70">&gt;= 70%</option>
                        <option value="50">&gt;= 50%</option>
                      </select>
                    </div>

                    {/* 7. Fuente */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Fuente / Origen</label>
                      <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                      >
                        <option value="">Todas las fuentes</option>
                        {Array.from(new Set(assets.map(a => a.source).filter(Boolean))).map(src => (
                          <option key={src as string} value={src as string}>{src as string}</option>
                        ))}
                      </select>
                    </div>

                    {/* Limpiar Filtros button */}
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterTerm('');
                          setFilterColumn('');
                          setFilterOwner('');
                          setFilterSensitivity('');
                          setFilterDomain('');
                          setFilterMinQuality('');
                          setFilterSource('');
                        }}
                        className={styles.secondaryBtn}
                        style={{ width: '100%', justifyContent: 'center', height: '38px', padding: '0', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}
                      >
                        Limpiar Filtros
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando activos...</div>
              ) : filteredAssets.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  No se encontraron activos que coincidan con los criterios de búsqueda.
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Activo (Tabla/Vista)</th>
                      <th>Fuente (Origen)</th>
                      <th>Propietario / Área</th>
                      <th>Sensibilidad</th>
                      <th>Calidad</th>
                      <th>Registros</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(asset => (
                      <tr key={asset.id}>
                        <td><strong>{asset.name}</strong></td>
                        <td>{asset.source || 'Base de Datos'}</td>
                        <td>{asset.data_owner || asset.owner || 'No asignado'}</td>
                        <td>
                          <span className={`${styles.badge} ${
                            asset.sensitivity === 'Confidencial' || asset.sensitivity === 'Restringido' || asset.sensitivity === 'Altamente Sensible'
                              ? styles.pii
                              : styles.standard
                          }`}>
                            {asset.sensitivity || 'Interno'}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontWeight: 700, 
                            color: (asset.quality_score != null ? asset.quality_score : 85) >= 80 ? '#10b981' : '#f59e0b' 
                          }}>
                            {asset.quality_score != null ? `${asset.quality_score}%` : '85%'}
                          </span>
                        </td>
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
                  <select 
                    className={styles.secondaryBtn} 
                    style={{ padding: '8px', minWidth: '220px', borderRadius: '10px', fontSize: '0.88rem' }}
                    value={selectedLineageAsset?.id || ''}
                    onChange={(e) => {
                      const found = assets.find(a => a.id === e.target.value);
                      if (found) setSelectedLineageAsset(found);
                    }}
                  >
                    {assets.length === 0 && <option value="">Sin activos...</option>}
                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              
              {selectedLineageAsset ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '20px' }}>
                  {/* Flow Wrapper */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', background: '#f8fafc', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    
                    {/* Node 1: Origin */}
                    <div style={{ flex: 1, minWidth: '220px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Origen de Datos</span>
                        <Database size={18} color="#3b82f6" />
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedLineageAsset.source || 'Base de Datos'}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Tipo: Conexión Activa</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Registros: <strong>{selectedLineageAsset.records_count || 'Desconocido'}</strong></p>
                    </div>

                    {/* Arrow 1 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-90deg)' }}>
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                      </svg>
                    </div>

                    {/* Node 2: Processing/ETL & Quality */}
                    <div style={{ flex: 1, minWidth: '220px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Procesamiento & Calidad</span>
                        <RefreshCw size={18} color="#8b5cf6" />
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Calidad de Datos</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Estado: {selectedLineageAsset.status || 'Sincronizado'}</p>
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Score de Calidad:</span>
                        <strong style={{ color: (selectedLineageAsset.quality_score || 85) >= 80 ? '#10b981' : '#f59e0b', fontSize: '0.9rem' }}>
                          {selectedLineageAsset.quality_score != null ? `${selectedLineageAsset.quality_score}%` : '85%'}
                        </strong>
                      </div>
                    </div>

                    {/* Arrow 2 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-90deg)' }}>
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                      </svg>
                    </div>

                    {/* Node 3: Catalog/Exposition */}
                    <div style={{ flex: 1, minWidth: '220px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catálogo Exposición</span>
                        <Activity size={18} color="#10b981" />
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedLineageAsset.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Confidencialidad: <strong>Interno</strong></p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Columnas: <strong>{fields.filter(f => f.asset_id === selectedLineageAsset.id).length} campos</strong></p>
                    </div>

                  </div>

                  {/* Schema Summary Panel */}
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Detalle de Campos del Flujo</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {fields.filter(f => f.asset_id === selectedLineageAsset.id).map(field => (
                        <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{field.field_name}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{field.data_type || 'VARCHAR'}</span>
                          </div>
                          <span className={`${styles.badge} ${field.is_sensitive || field.sensitivity === 'Confidencial' ? styles.pii : styles.standard}`} style={{ fontSize: '0.7rem' }}>
                            {field.is_sensitive || field.sensitivity === 'Confidencial' ? 'Sensible' : 'Estándar'}
                          </span>
                        </div>
                      ))}
                      {fields.filter(f => f.asset_id === selectedLineageAsset.id).length === 0 && (
                        <p style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: '1 / -1', margin: 0 }}>No hay campos o columnas registrados para este activo.</p>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando trazabilidad...</div>
              )}
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
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glossary.map(term => (
                      <tr key={term.id}>
                        <td><strong>{term.term}</strong></td>
                        <td>{term.definition}</td>
                        <td>{term.domain || 'General'}</td>
                        <td><span className={`${styles.badge} ${styles.active}`}>{term.status || 'Publicado'}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => {
                                setEditingTermId(term.id);
                                setNewTerm({ term: term.term, definition: term.definition, domain: term.domain || 'General' });
                                setShowGlossaryModal(true);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6366f1' }}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteGlossaryTerm(term.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}
                              title="Eliminar"
                            >
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
                <h2>{editingTermId ? 'Editar Término del Glosario' : 'Agregar Término al Glosario'}</h2>
                <button className={styles.closeBtn} onClick={() => { setShowGlossaryModal(false); setEditingTermId(null); setNewTerm({ term: '', definition: '', domain: '' }); }}>
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
                <button className={styles.secondaryBtn} onClick={() => { setShowGlossaryModal(false); setEditingTermId(null); setNewTerm({ term: '', definition: '', domain: '' }); }}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleSaveGlossaryTerm}>
                  <Save size={18} /> {editingTermId ? 'Actualizar Término' : 'Guardar Término'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
