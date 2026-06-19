'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Database, Search, ShieldAlert, Network, BookOpen, 
  Plus, RefreshCw, ChevronDown, ArrowDown, Activity, Key, EyeOff, Save, X, Edit2, Trash2,
  GitCommit, Folder, Shield, BarChart3, HelpCircle, Send, Award, Play, AlertCircle
} from 'lucide-react';
import styles from './page.module.css';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';

export default function MetadataPage() {
  const { currentTenant, mode } = usePlatform();
  const [activeTab, setActiveTab] = useState('scanner');
  const [isScanning, setIsScanning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [assets, setAssets] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [glossary, setGlossary] = useState<any[]>([]);
  const [semanticDict, setSemanticDict] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // V2 Added states
  const [auditVersions, setAuditVersions] = useState<any[]>([]);
  const [taxonomies, setTaxonomies] = useState<any[]>([]);
  const [glossaryRelations, setGlossaryRelations] = useState<any[]>([]);
  const [dataProducts, setDataProducts] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([
    { id: 'DOM-01', name: 'Comercial' },
    { id: 'DOM-02', name: 'Financiero' },
    { id: 'DOM-03', name: 'Operaciones' },
    { id: 'DOM-04', name: 'Talento Humano' },
    { id: 'DOM-05', name: 'Jurídico' },
    { id: 'DOM-06', name: 'Tecnología' }
  ]);

  // Selected sub-states for detail modals/actions
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedLineageAsset, setSelectedLineageAsset] = useState<any>(null);
  
  // Modals & form edits
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '', acronym: '', synonyms: '', domain: '', owner: '' });
  const [editingTermId, setEditingTermId] = useState<string | null>(null);

  const [showFieldEditModal, setShowFieldEditModal] = useState(false);
  const [selectedFieldForEdit, setSelectedFieldForEdit] = useState<any>(null);

  const [showTaxonomyModal, setShowTaxonomyModal] = useState(false);
  const [newTaxonomy, setNewTaxonomy] = useState({ name: '', parent_id: '', description: '' });

  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', sources: '', consumers: '' });

  // Semantic Search & NLP states
  const [searchQuery, setSearchQuery] = useState('');
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpResult, setNlpResult] = useState<string | null>(null);
  const [nlpLoading, setNlpLoading] = useState(false);

  // Copilot states
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotChat, setCopilotChat] = useState<any[]>([
    { role: 'assistant', content: '¡Hola! Soy tu Metadata Copilot IA. Puedes consultarme definiciones de negocio, owners, o dónde se almacena información sensible en tus bases de datos.' }
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // KPI/Stats filters
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('Comercial');

  // Automatic Definition suggest helper simulator (RF-MD-001)
  const getAiSuggestedDefinition = (fieldName: string) => {
    const fnLower = fieldName.toLowerCase().trim();
    if (fnLower.includes('email') || fnLower.includes('correo')) return 'Dirección electrónica utilizada para contactar al cliente.';
    if (fnLower.includes('telefono') || fnLower.includes('phone') || fnLower.includes('celular')) return 'Número telefónico de contacto registrado del usuario.';
    if (fnLower.includes('rut') || fnLower.includes('nit') || fnLower.includes('identidad') || fnLower.includes('documento')) return 'Documento de identidad o identificación tributaria nacional.';
    if (fnLower.includes('nombre')) return 'Nombre completo o razón social asociada a la entidad.';
    if (fnLower.includes('monto') || fnLower.includes('total') || fnLower.includes('precio')) return 'Valor numérico acumulado que representa la métrica monetaria de la transacción.';
    if (fnLower.includes('direccion') || fnLower.includes('calle')) return 'Ubicación física o domicilio fiscal de la persona.';
    if (fnLower.includes('tarjeta') || fnLower.includes('credito')) return 'Información del medio de pago financiero o tarjeta de crédito.';
    return `Definición automatizada sugerida por IA para el campo técnico '${fieldName}'.`;
  };

  useEffect(() => {
    setIsMounted(true);
    fetchMetadata();
  }, [currentTenant?.id, mode]);

  const fetchMetadata = async () => {
    if (!currentTenant?.id) return;
    setLoading(true);

    const loadDemoData = () => {
      const demoAssets = [
        { id: '1', name: 'Maestro de Clientes', source: 'SAP ERP', data_owner: 'Carlos Ruiz', records_count: '12450', status: 'Sincronizado', quality_score: 92, created_at: new Date().toISOString() },
        { id: '2', name: 'Transacciones Q2', source: 'Oracle DB', data_owner: 'Maria Silva', records_count: '15200', status: 'Sincronizado', quality_score: 87, created_at: new Date().toISOString() },
        { id: '3', name: 'Leads Marketing', source: 'Salesforce', data_owner: 'Juan Perez', records_count: '8500', status: 'Sincronizado', quality_score: 74, created_at: new Date().toISOString() },
        { id: '4', name: 'Reporte Consolidado', source: 'Data Lake', data_owner: 'Andres Gomez', records_count: '5000', status: 'Sincronizado', quality_score: 95, created_at: new Date().toISOString() }
      ];
      setAssets(demoAssets);
      setSelectedLineageAsset(demoAssets[0]);

      const demoFields = [
        { id: 'f1', asset_id: '1', field_name: 'id', data_type: 'INTEGER', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Unicidad', business_name: 'ID Único Cliente', business_domain: 'Comercial', owner: 'Carlos Ruiz', steward: 'Alejandra Montes', status: 'Aprobado', asset: { name: 'Maestro de Clientes' } },
        { id: 'f2', asset_id: '1', field_name: 'nombre', data_type: 'VARCHAR', is_sensitive: false, sensitivity: 'Público', quality_rule: 'No Nulo', business_name: 'Nombre Completo', business_domain: 'Comercial', owner: 'Carlos Ruiz', steward: 'Alejandra Montes', status: 'Aprobado', asset: { name: 'Maestro de Clientes' } },
        { id: 'f3', asset_id: '1', field_name: 'email', data_type: 'VARCHAR', is_sensitive: true, sensitivity: 'Confidencial', quality_rule: 'Formato Correo', business_name: 'Correo Electrónico', business_domain: 'Comercial', owner: 'Carlos Ruiz', steward: 'Alejandra Montes', status: 'Aprobado', asset: { name: 'Maestro de Clientes' } },
        { id: 'f4', asset_id: '1', field_name: 'telefono', data_type: 'VARCHAR', is_sensitive: true, sensitivity: 'Confidencial', quality_rule: 'Formato Celular', business_name: 'Teléfono Móvil', business_domain: 'Comercial', owner: 'Carlos Ruiz', steward: 'Alejandra Montes', status: 'En revisión', asset: { name: 'Maestro de Clientes' } },
        { id: 'f5', asset_id: '1', field_name: 'rut', data_type: 'VARCHAR', is_sensitive: true, sensitivity: 'Restringido', quality_rule: 'Algoritmo Rut', business_name: 'Rut Persona Natural', business_domain: 'Comercial', owner: 'Carlos Ruiz', steward: 'Alejandra Montes', status: 'Borrador', asset: { name: 'Maestro de Clientes' } },
        { id: 'f6', asset_id: '2', field_name: 'id_transaccion', data_type: 'INTEGER', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Unicidad', business_name: 'ID de Transacción', business_domain: 'Financiero', owner: 'Maria Silva', steward: 'Roberto Díaz', status: 'Aprobado', asset: { name: 'Transacciones Q2' } },
        { id: 'f7', asset_id: '2', field_name: 'cliente_id', data_type: 'INTEGER', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Clave Foránea', business_name: 'ID Cliente Asociado', business_domain: 'Financiero', owner: 'Maria Silva', steward: 'Roberto Díaz', status: 'Aprobado', asset: { name: 'Transacciones Q2' } },
        { id: 'f8', asset_id: '2', field_name: 'monto', data_type: 'NUMERIC', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Rango Positivo', business_name: 'Monto de Transacción', business_domain: 'Financiero', owner: 'Maria Silva', steward: 'Roberto Díaz', status: 'Aprobado', asset: { name: 'Transacciones Q2' } },
        { id: 'f9', asset_id: '2', field_name: 'estado', data_type: 'VARCHAR', is_sensitive: false, sensitivity: 'Público', quality_rule: 'Valores Permitidos', business_name: 'Estado de la Compra', business_domain: 'Financiero', owner: 'Maria Silva', steward: 'Roberto Díaz', status: 'Aprobado', asset: { name: 'Transacciones Q2' } }
      ];
      setFields(demoFields);

      const demoGlossary = [
        { id: 'g1', term: 'Cliente', definition: 'Persona natural o jurídica que adquiere productos o servicios de la compañía.', domain: 'Comercial', status: 'Publicado', acronym: 'CLI', synonyms: ['comprador', 'cuenta', 'socio'], owner: 'Carlos Ruiz' },
        { id: 'g2', term: 'Transacción', definition: 'Registro de una operation financiera o comercial realizada por un cliente.', domain: 'Financiero', status: 'Publicado', acronym: 'TX', synonyms: ['venta', 'pago', 'recaudo'], owner: 'Maria Silva' },
        { id: 'g3', term: 'Leads', definition: 'Contacto comercial potencial registrado a través de campañas de marketing.', domain: 'Comercial', status: 'Publicado', acronym: 'LD', synonyms: ['prospecto', 'contacto'], owner: 'Juan Perez' },
        { id: 'g4', term: 'DQI', definition: 'Data Quality Index, métrica unificada de la calidad de un activo de datos.', domain: 'Tecnología', status: 'Publicado', acronym: 'DQI', synonyms: ['calidad', 'score'], owner: 'Andres Gomez' }
      ];
      setGlossary(demoGlossary);

      setSemanticDict([
        { id: 's1', term: 'id', synonyms: ['id_cliente', 'client_id', 'cliente_id'] },
        { id: 's2', term: 'nombre', synonyms: ['nombre_cliente', 'name', 'full_name'] },
        { id: 's3', term: 'email', synonyms: ['correo', 'mail', 'email_contacto'] },
        { id: 's4', term: 'telefono', synonyms: ['phone', 'celular', 'tel'] }
      ]);

      setAuditVersions([
        { id: 'av1', field_name: 'email', user_name: 'Carlos Ruiz', modified_at: new Date(Date.now() - 3600000).toISOString(), old_value: 'Borrador', new_value: 'Aprobado' },
        { id: 'av2', field_name: 'monto', user_name: 'Maria Silva', modified_at: new Date(Date.now() - 7200000).toISOString(), old_value: 'En revisión', new_value: 'Aprobado' }
      ]);

      setTaxonomies([
        { id: 't1', name: 'Cliente', parent_id: null, description: 'Concepto raíz de clientes' },
        { id: 't2', name: 'Persona Natural', parent_id: 't1', description: 'Cliente individual' },
        { id: 't3', name: 'Persona Jurídica', parent_id: 't1', description: 'Cliente corporativo' },
        { id: 't4', name: 'Prospecto', parent_id: 't1', description: 'Lead comercial no calificado' }
      ]);

      setGlossaryRelations([
        { id: 'r1', term_id: 'g1', related_term_id: 'g3', relation_type: 'term_term' },
        { id: 'r2', term_id: 'g1', related_asset_id: '1', relation_type: 'term_asset' }
      ]);

      setDataProducts([
        { id: 'dp1', name: 'Clientes 360', description: 'Vista consolidada omnicanal de los clientes.', sources: ['Maestro de Clientes', 'Leads Marketing'], consumers: ['Marketing', 'Ventas'] },
        { id: 'dp2', name: 'Ventas Diarias', description: 'Dashboard ejecutivo de facturación de transacciones.', sources: ['Transacciones Q2'], consumers: ['Finanzas', 'Analítica'] }
      ]);
    };

    const isValidUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (mode === 'DEMO' || !isValidUuid(currentTenant.id)) {
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

      // Fetch audit versions
      const { data: versionData, error: versionError } = await supabase
        .from('metadata_versions')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('modified_at', { ascending: false });
      if (!versionError && versionData) {
        setAuditVersions(versionData);
      }

      // Fetch taxonomies
      const { data: taxData, error: taxError } = await supabase
        .from('business_taxonomies')
        .select('*')
        .eq('tenant_id', currentTenant.id);
      if (!taxError && taxData) {
        setTaxonomies(taxData);
      }

      // Fetch glossary relations
      const { data: relData, error: relError } = await supabase
        .from('glossary_relations')
        .select('*')
        .eq('tenant_id', currentTenant.id);
      if (!relError && relData) {
        setGlossaryRelations(relData);
      }

      // Fetch data products
      const { data: prodData, error: prodError } = await supabase
        .from('data_products')
        .select('*')
        .eq('tenant_id', currentTenant.id);
      if (!prodError && prodData) {
        setDataProducts(prodData);
      }

    } catch (err: any) {
      console.error('Error fetching metadata (Tables might not exist in Supabase):', err?.message || err);
      console.error('Detailed metadata fetch error:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint
      });
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      fetchMetadata();
      setIsScanning(false);
    }, 2000);
  };

  // Glossary V2 Add/Edit/Delete Scoped by Tenant
  const handleSaveGlossaryTerm = async () => {
    if (!newTerm.term || !newTerm.definition) return;
    if (!currentTenant?.id) return;
    
    try {
      const synonymsArray = newTerm.synonyms ? newTerm.synonyms.split(',').map(s => s.trim()) : [];
      if (editingTermId) {
        if (mode === 'DEMO') {
          setGlossary(prev => prev.map(t => t.id === editingTermId ? {
            ...t,
            term: newTerm.term,
            definition: newTerm.definition,
            acronym: newTerm.acronym,
            synonyms: synonymsArray,
            domain: newTerm.domain || 'General',
            owner: newTerm.owner
          } : t));
        } else {
          const { error } = await supabase.from('glossary_terms').update({
            term: newTerm.term,
            definition: newTerm.definition,
            acronym: newTerm.acronym,
            synonyms: synonymsArray,
            domain: newTerm.domain || 'General',
            owner: newTerm.owner
          }).eq('id', editingTermId);
          if (error) throw error;
        }
        setShowGlossaryModal(false);
        setEditingTermId(null);
        setNewTerm({ term: '', definition: '', acronym: '', synonyms: '', domain: '', owner: '' });
      } else {
        if (mode === 'DEMO') {
          const mockId = Math.random().toString();
          setGlossary([...glossary, {
            id: mockId,
            term: newTerm.term,
            definition: newTerm.definition,
            acronym: newTerm.acronym,
            synonyms: synonymsArray,
            domain: newTerm.domain || 'General',
            status: 'Publicado',
            owner: newTerm.owner
          }]);
        } else {
          const { data, error } = await supabase.from('glossary_terms').insert([{
            tenant_id: currentTenant.id,
            term: newTerm.term,
            definition: newTerm.definition,
            acronym: newTerm.acronym,
            synonyms: synonymsArray,
            domain: newTerm.domain || 'General',
            status: 'Publicado',
            owner: newTerm.owner
          }]).select();
          if (error) throw error;
          if (data && data.length > 0) {
            setGlossary([...glossary, data[0]]);
          }
        }
        setShowGlossaryModal(false);
        setNewTerm({ term: '', definition: '', acronym: '', synonyms: '', domain: '', owner: '' });
      }
      fetchMetadata();
    } catch (err: any) {
      console.error('Error saving glossary term to database:', err?.message || err);
      alert('Error guardando en la base de datos. ' + (err.message || ''));
    }
  };

  const handleDeleteGlossaryTerm = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este término de negocio?')) return;
    try {
      if (mode === 'DEMO') {
        setGlossary(prev => prev.filter(t => t.id !== id));
      } else {
        const { error } = await supabase.from('glossary_terms').delete().eq('id', id);
        if (error) throw error;
        setGlossary(prev => prev.filter(t => t.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting glossary term:', err?.message || err);
      alert('Error al eliminar de la base de datos: ' + err.message);
    }
  };

  // Data Dictionary Field Editing & Versioning Audit Flow
  const handleEditField = (field: any) => {
    setSelectedFieldForEdit(field);
    setShowFieldEditModal(true);
  };

  const handleUpdateField = async (updatedFields: any) => {
    if (!selectedFieldForEdit || !currentTenant?.id) return;
    const oldStatus = selectedFieldForEdit.status || 'Borrador';
    const newStatus = updatedFields.status || 'Borrador';

    try {
      if (mode === 'DEMO') {
        setFields(prev => prev.map(f => f.id === selectedFieldForEdit.id ? { ...f, ...updatedFields } : f));
        setAuditVersions([
          {
            id: Math.random().toString(),
            field_name: selectedFieldForEdit.field_name,
            user_name: currentTenant.name || 'Usuario Demo',
            modified_at: new Date().toISOString(),
            old_value: oldStatus,
            new_value: newStatus
          },
          ...auditVersions
        ]);
      } else {
        const { error } = await supabase
          .from('asset_fields')
          .update({
            business_name: updatedFields.business_name,
            quality_rule: updatedFields.quality_rule,
            business_domain: updatedFields.business_domain,
            owner: updatedFields.owner,
            steward: updatedFields.steward,
            status: updatedFields.status
          })
          .eq('id', selectedFieldForEdit.id);
        if (error) throw error;

        // Log modification in audit tables
        await supabase.from('metadata_versions').insert([{
          tenant_id: currentTenant.id,
          field_id: selectedFieldForEdit.id,
          user_name: 'CDO Steward',
          old_value: `${selectedFieldForEdit.business_name || 'Sin nombre'} (${oldStatus})`,
          new_value: `${updatedFields.business_name || 'Sin nombre'} (${newStatus})`
        }]);
      }
      setShowFieldEditModal(false);
      setSelectedFieldForEdit(null);
      fetchMetadata();
    } catch (err: any) {
      console.error('Error updating field dictionary:', err?.message || err);
      alert('Error al actualizar el campo: ' + err.message);
    }
  };

  // Taxonomies tree hierarchy builder
  const handleSaveTaxonomy = async () => {
    if (!newTaxonomy.name || !currentTenant?.id) return;
    try {
      if (mode === 'DEMO') {
        setTaxonomies([...taxonomies, {
          id: Math.random().toString(),
          name: newTaxonomy.name,
          parent_id: newTaxonomy.parent_id || null,
          description: newTaxonomy.description
        }]);
      } else {
        const { error } = await supabase.from('business_taxonomies').insert([{
          tenant_id: currentTenant.id,
          name: newTaxonomy.name,
          parent_id: newTaxonomy.parent_id || null,
          description: newTaxonomy.description
        }]);
        if (error) throw error;
      }
      setShowTaxonomyModal(false);
      setNewTaxonomy({ name: '', parent_id: '', description: '' });
      fetchMetadata();
    } catch (err: any) {
      console.error('Error saving taxonomy node:', err?.message || err);
    }
  };

  // Data Product registry helper
  const handleSaveDataProduct = async () => {
    if (!newProduct.name || !currentTenant?.id) return;
    try {
      const srcArray = newProduct.sources ? newProduct.sources.split(',').map(s => s.trim()) : [];
      const consArray = newProduct.consumers ? newProduct.consumers.split(',').map(c => c.trim()) : [];

      if (mode === 'DEMO') {
        setDataProducts([...dataProducts, {
          id: Math.random().toString(),
          name: newProduct.name,
          description: newProduct.description,
          sources: srcArray,
          consumers: consArray
        }]);
      } else {
        const { error } = await supabase.from('data_products').insert([{
          tenant_id: currentTenant.id,
          name: newProduct.name,
          description: newProduct.description,
          sources: srcArray,
          consumers: consArray
        }]);
        if (error) throw error;
      }
      setShowProductModal(false);
      setNewProduct({ name: '', description: '', sources: '', consumers: '' });
      fetchMetadata();
    } catch (err: any) {
      console.error('Error saving data product:', err?.message || err);
    }
  };

  // NLP Semantic Search Simulator
  const handleNlpSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpQuery) return;
    setNlpLoading(true);
    setTimeout(() => {
      const q = nlpQuery.toLowerCase();
      if (q.includes('correo') || q.includes('email')) {
        setNlpResult('El correo de los clientes se almacena en la tabla "Maestro de Clientes" (SAP ERP), en el campo técnico "email". Confidencialidad: Confidencial.');
      } else if (q.includes('dueño') || q.includes('owner') || q.includes('maestro')) {
        setNlpResult('El owner del "Maestro de Clientes" es Carlos Ruiz, y el Steward a cargo del diccionario de datos es Alejandra Montes.');
      } else if (q.includes('sensible') || q.includes('pii')) {
        setNlpResult('Campos con información PII detectada: "email", "telefono" y "rut" en el "Maestro de Clientes". Todos están bajo políticas RLS.');
      } else {
        setNlpResult('Búsqueda sin coincidencia exacta en NLP. Sugerencia: use sinónimos registrados en el Glosario como "cliente", "transacción" o "leads".');
      }
      setNlpLoading(false);
    }, 1000);
  };

  // Copilot Assistant Simulator
  const handleCopilotSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery) return;

    const userMessage = { role: 'user', content: copilotQuery };
    setCopilotChat(prev => [...prev, userMessage]);
    const currentQ = copilotQuery;
    setCopilotQuery('');
    setCopilotLoading(true);

    setTimeout(() => {
      let reply = '';
      const q = currentQ.toLowerCase();
      if (q.includes('significa cliente') || q.includes('definicion de cliente')) {
        reply = 'Según el Glosario de Negocio, "Cliente" significa: Persona natural o jurídica que adquiere productos o servicios de la compañía. (Acrónimo: CLI, Dominio: Comercial).';
      } else if (q.includes('dueño') || q.includes('propietario')) {
        reply = 'El dueño de la tabla de Activos es Carlos Ruiz (SAP ERP / Maestro de Clientes) y Maria Silva (Oracle DB / Transacciones Q2).';
      } else if (q.includes('pii') || q.includes('sensible')) {
        reply = 'Los campos clasificados como sensibles (PII) detectados son "email", "telefono" y "rut".';
      } else if (q.includes('lineage') || q.includes('ventas') || q.includes('origen')) {
        reply = 'El indicador de ventas se genera desde la fuente "Oracle DB" (tabla Transacciones Q2) conteniendo un volumen de 15,200 registros. Luego fluye a través del control de calidad DQI (87% de score) y finalmente se expone en el catálogo consolidado de ventas diarias.';
      } else {
        reply = 'Como copiloto experto, te recomiendo actualizar la descripción del campo técnico y asociar un Owner probable. ¿Deseas que genere una definición automática con IA para este concepto?';
      }

      setCopilotChat(prev => [...prev, { role: 'assistant', content: reply }]);
      setCopilotLoading(false);
    }, 1200);
  };

  // Calculation of Metadata Completeness Score
  const calculateAssetCompleteness = (assetId: string) => {
    const assetFields = fields.filter(f => f.asset_id === assetId);
    if (assetFields.length === 0) return 60;
    
    let totalScore = 0;
    assetFields.forEach(f => {
      let fieldScore = 0;
      if (f.business_name) fieldScore += 15;
      if (f.business_domain) fieldScore += 15;
      if (f.owner) fieldScore += 10;
      if (f.steward) fieldScore += 10;
      if (f.sensitivity) fieldScore += 15;
      if (f.quality_rule) fieldScore += 15;
      fieldScore += 20;
      totalScore += fieldScore;
    });

    return Math.round(totalScore / assetFields.length);
  };

  const getGlobalCompletenessScore = () => {
    if (assets.length === 0) return 0;
    const scores = assets.map(a => calculateAssetCompleteness(a.id));
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average);
  };

  // KPIs
  const piiFieldsCount = fields.filter(f => f.is_sensitive === true || f.sensitivity === 'Confidencial' || f.sensitivity === 'Restringido').length;
  
  const kpis = [
    { label: 'Activos Descubiertos', value: assets.length.toString(), icon: Database, color: 'blue' },
    { label: 'Columnas Analizadas', value: fields.length.toString(), icon: Brain, color: 'purple' },
    { label: 'Campos Sensibles', value: piiFieldsCount.toString(), icon: ShieldAlert, color: 'red' },
    { label: 'Términos del Glosario', value: glossary.length.toString(), icon: BookOpen, color: 'green' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>
            <div className={styles.iconCircle}>
              <Brain size={24} />
            </div>
            Metadata Intelligence 2.0
          </h1>
          <p>Gestión automatizada de taxonomías, glosarios semánticos de negocio, trazabilidad de linaje y catálogo empresarial.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={handleScan} disabled={isScanning}>
            <RefreshCw className={isScanning ? styles.spin : ''} size={16} /> 
            {isScanning ? 'Escaneando Esquemas…' : 'Refrescar Catálogo'}
          </button>
        </div>
      </header>

      {/* KPI Section */}
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

      {/* Buscador Global Prominente */}
      <div 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '16px 24px', 
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#eff6ff', color: '#3b82f6', borderRadius: '10px', padding: '8px' }}>
            <Search size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Buscador Inteligente de Metadatos</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Encuentra campos, conceptos de negocio, dueños o reglas de calidad de manera inmediata.</p>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input 
            type="text" 
            className={styles.input} 
            style={{ width: '100%', paddingLeft: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', height: '42px' }}
            placeholder="Escribe el nombre de un campo, concepto o tabla... (ej: 'email', 'cliente_id', 'monto')"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'search') {
                setActiveTab('search');
              }
            }}
          />
        </div>
      </div>

      {/* Horizontal Tab Layout */}
      <div className={styles.tabs} style={{ display: 'flex', overflowX: 'auto', paddingBottom: '4px', gap: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        {[
          { id: 'scanner', label: 'Fuentes Conectadas', icon: <Database size={16} /> },
          { id: 'classification', label: 'Clasificación de Campos', icon: <ShieldAlert size={16} /> },
          { id: 'lineage', label: 'Trazabilidad Lógica', icon: <Network size={16} /> },
          { id: 'glossary', label: 'Glosario Corporativo', icon: <BookOpen size={16} /> },
          { id: 'dictionary', label: 'Diccionario de Datos', icon: <Edit2 size={16} /> },
          { id: 'domains', label: 'Dominios de Negocio', icon: <Folder size={16} /> },
          { id: 'taxonomy', label: 'Taxonomía Empresarial', icon: <GitCommit size={16} /> },
          { id: 'knowledge', label: 'Knowledge Graph', icon: <Activity size={16} /> },
          { id: 'search', label: 'Semantic Search', icon: <Search size={16} /> },
          { id: 'score', label: 'Metadata Score & Copilot', icon: <Award size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`} 
            onClick={() => setActiveTab(tab.id)}
            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        
        {/* TAB 1: Fuentes Conectadas */}
        {activeTab === 'scanner' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Activos Técnicos Importados del Catálogo</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Activo</th>
                      <th>Fuente de Origen</th>
                      <th>Registros</th>
                      <th>Estado</th>
                      <th>Fecha Importación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td>{a.source}</td>
                        <td>{a.records_count}</td>
                        <td><span className={`${styles.badge} ${styles.active}`}>{a.status}</span></td>
                        <td>{new Date(a.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Clasificación de Campos */}
        {activeTab === 'classification' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Clasificación de Privacidad & Reglas IA</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Tipo Técnico</th>
                      <th>Activo</th>
                      <th>Sensibilidad</th>
                      <th>Categoría Sugerida</th>
                      <th>Owner Sugerido por IA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(f => {
                      const isSensitive = f.is_sensitive || f.sensitivity === 'Confidencial' || f.sensitivity === 'Restringido';
                      let category = 'Estándar';
                      if (f.field_name.toLowerCase().includes('email')) category = 'Contacto / Persona';
                      if (f.field_name.toLowerCase().includes('telefono')) category = 'Contacto';
                      if (f.field_name.toLowerCase().includes('monto')) category = 'Financiero';
                      if (f.field_name.toLowerCase().includes('rut')) category = 'Ubicación / Persona';

                      return (
                        <tr key={f.id}>
                          <td><strong>{f.field_name}</strong></td>
                          <td><code>{f.data_type}</code></td>
                          <td>{f.asset?.name || 'Común'}</td>
                          <td>
                            <span className={`${styles.badge} ${isSensitive ? styles.pii : styles.standard}`}>
                              {isSensitive ? 'Confidencial (PII)' : 'Público'}
                            </span>
                          </td>
                          <td><span className={`${styles.badge} ${styles.financial}`}>{category}</span></td>
                          <td>{isSensitive ? 'DPO / Seguridad' : 'Data Owner'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Trazabilidad Lógica */}
        {activeTab === 'lineage' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Data Lineage (Trazabilidad)</h3>
                <select 
                  className={styles.input} 
                  style={{ minWidth: '220px', padding: '6px' }}
                  value={selectedLineageAsset?.id || ''}
                  onChange={(e) => {
                    const found = assets.find(a => a.id === e.target.value);
                    if (found) setSelectedLineageAsset(found);
                  }}
                >
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              {selectedLineageAsset ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6' }}>FUENTE</span>
                      <h4 style={{ margin: '8px 0 0' }}>{selectedLineageAsset.source}</h4>
                    </div>
                    <div style={{ padding: '0 20px', color: '#cbd5e1' }}><ArrowDown style={{ transform: 'rotate(-90deg)' }} /></div>
                    <div style={{ padding: '16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7' }}>DQI VALIDACIÓN</span>
                      <h4 style={{ margin: '8px 0 0' }}>Calidad: {selectedLineageAsset.quality_score}%</h4>
                    </div>
                    <div style={{ padding: '0 20px', color: '#cbd5e1' }}><ArrowDown style={{ transform: 'rotate(-90deg)' }} /></div>
                    <div style={{ padding: '16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>DESTINO</span>
                      <h4 style={{ margin: '8px 0 0' }}>{selectedLineageAsset.name}</h4>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Cargando lineage...</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Glosario Corporativo */}
        {activeTab === 'glossary' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Glosario Corporativo Avanzado</h3>
                <button className={styles.primaryBtn} onClick={() => { setEditingTermId(null); setShowGlossaryModal(true); }}>
                  <Plus size={16} /> Nuevo Término
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Término</th>
                      <th>Acrónimo</th>
                      <th>Definición</th>
                      <th>Sinónimos</th>
                      <th>Dominio</th>
                      <th>Owner</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glossary.map(g => (
                      <tr key={g.id}>
                        <td><strong>{g.term}</strong></td>
                        <td><code>{g.acronym || '-'}</code></td>
                        <td>{g.definition}</td>
                        <td>{g.synonyms ? g.synonyms.join(', ') : '-'}</td>
                        <td>{g.domain}</td>
                        <td>{g.owner || 'CDO'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }} onClick={() => {
                            setEditingTermId(g.id);
                            setNewTerm({
                              term: g.term,
                              definition: g.definition,
                              acronym: g.acronym || '',
                              synonyms: g.synonyms ? g.synonyms.join(', ') : '',
                              domain: g.domain,
                              owner: g.owner || ''
                            });
                            setShowGlossaryModal(true);
                          }}><Edit2 size={16} /></button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDeleteGlossaryTerm(g.id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Diccionario de Datos */}
        {activeTab === 'dictionary' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Diccionario Técnico de Campos</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Tabla</th>
                      <th>Negocio</th>
                      <th>Steward / Owner</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(f => (
                      <tr key={f.id}>
                        <td><code>{f.field_name}</code></td>
                        <td>{f.asset?.name || 'Catálogo'}</td>
                        <td><strong>{f.business_name || 'Sin asignar'}</strong></td>
                        <td><span style={{ fontSize: '0.8rem' }}>S: {f.steward || '-'}<br/>O: {f.owner || '-'}</span></td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: f.status === 'Aprobado' ? '#dcfce7' : f.status === 'En revisión' ? '#fef3c7' : '#f1f5f9',
                            color: f.status === 'Aprobado' ? '#156534' : f.status === 'En revisión' ? '#92400e' : '#475569'
                          }}>{f.status || 'Borrador'}</span>
                        </td>
                        <td>
                          <button className={styles.secondaryBtn} style={{ padding: '4px 8px', borderRadius: '6px' }} onClick={() => handleEditField(f)}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Historial de Cambios (Audit)</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditVersions.map(av => (
                  <div key={av.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                      <span>{av.user_name}</span>
                      <span>{new Date(av.modified_at).toLocaleDateString()}</span>
                    </div>
                    <strong>{av.field_name}</strong>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      <span style={{ color: '#ef4444' }}>{av.old_value}</span> &rarr; <span style={{ color: '#10b981' }}>{av.new_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Dominios de Negocio */}
        {activeTab === 'domains' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1.2fr 2fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Dominios</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {domains.map(d => {
                  const isActive = selectedDomainFilter === d.name;
                  return (
                    <button 
                      key={d.id} 
                      onClick={() => setSelectedDomainFilter(d.name)}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        backgroundColor: isActive ? '#eff6ff' : 'white',
                        borderColor: isActive ? '#3b82f6' : '#e2e8f0',
                        textAlign: 'left',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: isActive ? '#1e3a8a' : '#334155',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      {d.name}
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#cbd5e1', padding: '2px 8px', borderRadius: '100px', color: '#334155' }}>
                        {assets.filter(a => a.source.includes(d.name) || d.name === 'Comercial' ? 2 : 1).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Métricas de Dominio: {selectedDomainFilter}</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Calidad Promedio</span>
                  <h3 style={{ margin: '4px 0 0', color: '#10b981' }}>89.5%</h3>
                </div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Campos Documentados</span>
                  <h3 style={{ margin: '4px 0 0', color: '#3b82f6' }}>82%</h3>
                </div>
              </div>
              <h4>Activos Asociados</h4>
              <ul style={{ paddingLeft: '20px', color: '#334155', lineHeight: '1.8' }}>
                <li>Maestro Clientes &rarr; Origen SAP ERP</li>
                <li>Transacciones Q2 &rarr; Origen Oracle DB</li>
                <li>Servicio Ventas &rarr; Origen Data Lake</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 7: Taxonomía Empresarial */}
        {activeTab === 'taxonomy' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Estructura Taxonómica (Visual Árbol)</h3>
                <button className={styles.primaryBtn} style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setShowTaxonomyModal(true)}>
                  <Plus size={16} /> Crear Nodo
                </button>
              </div>
              <div style={{ padding: '10px 20px', borderLeft: '3px solid #6366f1', marginLeft: '10px' }}>
                {taxonomies.filter(t => !t.parent_id).map(parent => (
                  <div key={parent.id} style={{ marginBottom: '16px' }}>
                    <div style={{ padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Folder size={16} color="#6366f1" />
                      {parent.name} - <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#64748b' }}>{parent.description}</span>
                    </div>
                    {/* Subcategories */}
                    <div style={{ marginLeft: '24px', marginTop: '8px', borderLeft: '2px dashed #cbd5e1', paddingLeft: '16px' }}>
                      {taxonomies.filter(t => t.parent_id === parent.id).map(child => (
                        <div key={child.id} style={{ padding: '6px 0', fontSize: '0.9rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GitCommit size={14} color="#a855f7" />
                          {child.name} - <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{child.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <h3>Acerca de Taxonomías</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
                La taxonomía corporativa organiza las entidades de datos en base a relaciones jerárquicas estrictas. Esto permite heredar políticas de seguridad, clasificaciones de privacidad (PII) y reglas DQI automáticamente desde los conceptos padres a los hijos.
              </p>
              <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', marginTop: '20px' }}>
                <span style={{ fontWeight: 700, color: '#1e3a8a', display: 'block', marginBottom: '4px' }}>Ejemplo Práctico:</span>
                <span style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                  El concepto <strong>Cliente</strong> (Padre) engloba tanto a <strong>Persona Natural</strong> como a <strong>Persona Jurídica</strong>. Las políticas de encriptación aplicadas a Cliente se propagan a todas las subclases.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: Knowledge Graph */}
        {activeTab === 'knowledge' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Knowledge Graph de Metadatos (RF-MD-017, 18, 19)</h3>
              </div>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '16px', padding: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="100%" height="300" style={{ maxWidth: '800px', background: 'white', borderRadius: '12px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
                  <line x1="150" y1="150" x2="350" y2="80" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
                  <line x1="150" y1="150" x2="350" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                  <line x1="350" y1="80" x2="550" y2="150" stroke="#cbd5e1" strokeWidth="2" />
                  <line x1="350" y1="220" x2="550" y2="150" stroke="#cbd5e1" strokeWidth="2" />

                  <circle cx="150" cy="150" r="24" fill="#6366f1" style={{ cursor: 'pointer' }} />
                  <text x="150" y="154" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">CLI</text>
                  <text x="150" y="190" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="11">Término: Cliente</text>

                  <circle cx="350" cy="80" r="24" fill="#a855f7" />
                  <text x="350" y="84" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">TBL A</text>
                  <text x="350" y="120" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="11">Activo A: Maestro Clientes</text>

                  <circle cx="350" cy="220" r="24" fill="#ec4899" />
                  <text x="350" y="224" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">SYS B</text>
                  <text x="350" y="260" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="11">Activo B: CRM Leads</text>

                  <circle cx="550" cy="150" r="24" fill="#10b981" />
                  <text x="550" y="154" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">PROD</text>
                  <text x="550" y="190" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="11">Data Product: Clientes 360</text>
                </svg>
                <div style={{ marginTop: '16px', display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#64748b' }}>
                  <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#6366f1', borderRadius: '50%', marginRight: '6px' }}></span>Glosario</div>
                  <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#a855f7', borderRadius: '50%', marginRight: '6px' }}></span>Activo Técnico</div>
                  <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '6px' }}></span>Producto de Datos</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: Semantic Search */}
        {activeTab === 'search' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Búsqueda Empresarial Semántica & NLP</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Buscar por términos, campos, tablas o sinónimos:</label>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} size={18} />
                    <input 
                      type="text" 
                      className={styles.input} 
                      style={{ width: '100%', paddingLeft: '40px' }}
                      placeholder="Ej. 'correo', 'cliente_id', 'monto' o 'rut'..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Sugerencias de búsqueda rápida */}
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sugerencias rápidas:</span>
                    {['email', 'cliente_id', 'monto', 'rut', 'nombre'].map(term => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.8rem',
                          color: '#4f46e5',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  {searchQuery && (() => {
                    const q = searchQuery.toLowerCase();
                    const matched = fields.filter((f: any) => {
                      const fieldName = (f.field_name || '').toLowerCase();
                      const businessName = (f.business_name || '').toLowerCase();
                      const assetName = (f.asset?.name || '').toLowerCase();
                      const domain = (f.business_domain || '').toLowerCase();
                      const sensitivity = (f.sensitivity || '').toLowerCase();
                      const steward = (f.steward || '').toLowerCase();
                      
                      // Mapeo semántico de sinónimos comunes
                      let isSynonym = false;
                      if (q === 'correo' || q === 'email' || q === 'mail') {
                        isSynonym = fieldName.includes('email') || businessName.includes('correo') || businessName.includes('email');
                      } else if (q === 'telefono' || q === 'celular' || q === 'tel' || q === 'movil') {
                        isSynonym = fieldName.includes('telefono') || businessName.includes('teléfono') || businessName.includes('celular');
                      } else if (q === 'cliente' || q === 'cliente_id') {
                        isSynonym = fieldName.includes('cliente') || fieldName.includes('id_transaccion') || businessName.includes('cliente');
                      } else if (q === 'rut' || q === 'identificación' || q === 'documento' || q === 'dni') {
                        isSynonym = fieldName.includes('rut') || businessName.includes('rut') || businessName.includes('identificacion') || businessName.includes('identificación');
                      } else if (q === 'monto' || q === 'transacción' || q === 'monto_transaccion') {
                        isSynonym = fieldName.includes('monto') || businessName.includes('monto') || businessName.includes('transaccion') || businessName.includes('transacción');
                      }
                      
                      return (
                        fieldName.includes(q) ||
                        businessName.includes(q) ||
                        assetName.includes(q) ||
                        domain.includes(q) ||
                        sensitivity.includes(q) ||
                        steward.includes(q) ||
                        isSynonym
                      );
                    });

                    return (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Se encontraron <strong>{matched.length}</strong> campos que coinciden con su búsqueda:
                          </span>
                          <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            Motor Semántico Activo
                          </span>
                        </div>

                        {matched.length === 0 ? (
                          <div style={{ padding: '16px', textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', color: '#64748b' }}>
                            No se encontraron campos que coincidan. Pruebe con términos alternativos como "email", "rut", "cliente" o "monto".
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {matched.map((f: any) => (
                              <div
                                key={f.id}
                                style={{
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '10px',
                                  padding: '12px',
                                  background: 'white',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600, display: 'block' }}>
                                      {f.asset?.name || 'Tabla Desconocida'}
                                    </span>
                                    <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                                      {f.field_name}
                                    </strong>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                      background: f.is_sensitive || f.sensitivity === 'Confidencial' || f.sensitivity === 'Restringido' ? '#fee2e2' : '#f1f5f9',
                                      color: f.is_sensitive || f.sensitivity === 'Confidencial' || f.sensitivity === 'Restringido' ? '#ef4444' : '#64748b'
                                    }}
                                  >
                                    {f.sensitivity || 'Público'}
                                  </span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                  <strong>Concepto de Negocio:</strong> {f.business_name || 'Sin definir'}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: 'auto' }}>
                                  <span style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                    Tipo: <code>{f.data_type}</code>
                                  </span>
                                  {f.quality_rule && (
                                    <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                      {f.quality_rule}
                                    </span>
                                  )}
                                  {f.business_domain && (
                                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                      {f.business_domain}
                                    </span>
                                  )}
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                  <span>Owner: <strong>{f.owner || 'N/A'}</strong></span>
                                  <span>Steward: <strong>{f.steward || 'N/A'}</strong></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <form onSubmit={handleNlpSearch} style={{ borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Consulta de Lenguaje Natural a la Metadata:</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      className={styles.input} 
                      style={{ flex: 1 }}
                      placeholder="Ej. ¿Dónde se almacena el correo de los clientes?"
                      value={nlpQuery}
                      onChange={e => setNlpQuery(e.target.value)}
                    />
                    <button type="submit" className={styles.primaryBtn} disabled={nlpLoading}>
                      {nlpLoading ? <RefreshCw className={styles.spin} size={16} /> : <Play size={16} />}
                      Consultar
                    </button>
                  </div>
                  {nlpResult && (
                    <div style={{ marginTop: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: 'white' }}>
                      <strong>Respuesta del Catálogo:</strong>
                      <p style={{ margin: '6px 0 0', color: '#4b5563', fontSize: '0.9rem' }}>{nlpResult}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: Metadata Score & Copilot Chat */}
        {activeTab === 'score' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1.2fr 2fr' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className={styles.card}>
                <h3>Metadata Completeness</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', position: 'relative' }}>
                  <svg width="120" height="120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="314" strokeDashoffset={314 - (314 * getGlobalCompletenessScore()) / 100} strokeLinecap="round" transform="rotate(-90 60 60)" />
                  </svg>
                  <div style={{ position: 'absolute', fontSize: '1.75rem', fontWeight: 800 }}>{getGlobalCompletenessScore()}%</div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Data Products</h3>
                  <button className={styles.primaryBtn} style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => setShowProductModal(true)}>Registrar</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dataProducts.map(dp => (
                    <div key={dp.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', background: '#f8fafc' }}>
                      <strong style={{ display: 'block' }}>{dp.name}</strong>
                      <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748b' }}>{dp.description}</p>
                      <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                        Sources: <strong>{dp.sources.join(', ')}</strong><br/>
                        Consumers: <strong>{dp.consumers.join(', ')}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
              <div className={styles.cardHeader}>
                <h3>Metadata Copilot IA</h3>
              </div>
              <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', background: '#f8fafc', overflowY: 'auto', maxHeight: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {copilotChat.map((msg, index) => (
                  <div key={index} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.role === 'user' ? '#3b82f6' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    maxWidth: '85%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}>
                    {msg.content}
                  </div>
                ))}
                {copilotLoading && <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '0.85rem' }}>Escribiendo...</div>}
              </div>
              <form onSubmit={handleCopilotSend} style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <input 
                  type="text" 
                  className={styles.input} 
                  style={{ flex: 1 }}
                  placeholder="Ej. Explícame el lineage de ventas..."
                  value={copilotQuery}
                  onChange={e => setCopilotQuery(e.target.value)}
                />
                <button type="submit" className={styles.primaryBtn}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

      </motion.div>

      {/* MODAL: Nuevo Término de Glosario */}
      <AnimatePresence>
        {showGlossaryModal && (
          <div className={styles.modalOverlay}>
            <motion.div className={styles.modalContent} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className={styles.modalHeader}>
                <h2>{editingTermId ? 'Editar Término' : 'Agregar Término'}</h2>
                <button className={styles.closeBtn} onClick={() => setShowGlossaryModal(false)}><X size={20} /></button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}><label>Término</label><input type="text" className={styles.input} value={newTerm.term} onChange={e => setNewTerm({...newTerm, term: e.target.value})} /></div>
                <div className={styles.formGroup}><label>Acrónimo</label><input type="text" className={styles.input} value={newTerm.acronym} onChange={e => setNewTerm({...newTerm, acronym: e.target.value})} /></div>
                <div className={styles.formGroup}><label>Definición</label><textarea className={styles.input} rows={2} value={newTerm.definition} onChange={e => setNewTerm({...newTerm, definition: e.target.value})} /></div>
                <div className={styles.formGroup}><label>Sinónimos (separados por coma)</label><input type="text" className={styles.input} value={newTerm.synonyms} onChange={e => setNewTerm({...newTerm, synonyms: e.target.value})} /></div>
                <div className={styles.formGroup}><label>Dominio</label>
                  <select className={styles.input} value={newTerm.domain} onChange={e => setNewTerm({...newTerm, domain: e.target.value})}>
                    <option value="Comercial">Comercial</option>
                    <option value="Financiero">Financiero</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Talento Humano">Talento Humano</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label>Owner</label><input type="text" className={styles.input} value={newTerm.owner} onChange={e => setNewTerm({...newTerm, owner: e.target.value})} /></div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setShowGlossaryModal(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleSaveGlossaryTerm}><Save size={16} /> Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Editar Campo del Diccionario */}
      <AnimatePresence>
        {showFieldEditModal && selectedFieldForEdit && (
          <div className={styles.modalOverlay}>
            <motion.div className={styles.modalContent} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className={styles.modalHeader}>
                <h2>Editar Campo: {selectedFieldForEdit.field_name}</h2>
                <button className={styles.closeBtn} onClick={() => setShowFieldEditModal(false)}><X size={20} /></button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}><label>Nombre Negocio</label>
                  <input type="text" className={styles.input} defaultValue={selectedFieldForEdit.business_name || ''} id="field_biz_name" />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong>Definición Sugerida por IA (RF-MD-001):</strong><br/>
                  {getAiSuggestedDefinition(selectedFieldForEdit.field_name)}
                </div>
                <div className={styles.formGroup}><label>Regla de Calidad (DQI)</label>
                  <input type="text" className={styles.input} defaultValue={selectedFieldForEdit.quality_rule || ''} id="field_rule" />
                </div>
                <div className={styles.formGroup}><label>Dominio de Negocio</label>
                  <select className={styles.input} defaultValue={selectedFieldForEdit.business_domain || 'Comercial'} id="field_domain">
                    <option value="Comercial">Comercial</option>
                    <option value="Financiero">Financiero</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Talento Humano">Talento Humano</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label>Owner</label>
                  <input type="text" className={styles.input} defaultValue={selectedFieldForEdit.owner || ''} id="field_owner" />
                </div>
                <div className={styles.formGroup}><label>Steward</label>
                  <input type="text" className={styles.input} defaultValue={selectedFieldForEdit.steward || ''} id="field_steward" />
                </div>
                <div className={styles.formGroup}><label>Estado del Flujo</label>
                  <select className={styles.input} defaultValue={selectedFieldForEdit.status || 'Borrador'} id="field_status">
                    <option value="Borrador">Borrador</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Obsoleto">Obsoleto</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setShowFieldEditModal(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={() => {
                  const elName = document.getElementById('field_biz_name') as HTMLInputElement;
                  const elRule = document.getElementById('field_rule') as HTMLInputElement;
                  const elDomain = document.getElementById('field_domain') as HTMLSelectElement;
                  const elOwner = document.getElementById('field_owner') as HTMLInputElement;
                  const elSteward = document.getElementById('field_steward') as HTMLInputElement;
                  const elStatus = document.getElementById('field_status') as HTMLSelectElement;
                  
                  handleUpdateField({
                    business_name: elName?.value,
                    quality_rule: elRule?.value,
                    business_domain: elDomain?.value,
                    owner: elOwner?.value,
                    steward: elSteward?.value,
                    status: elStatus?.value
                  });
                }}><Save size={16} /> Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Nueva Taxonomía */}
      <AnimatePresence>
        {showTaxonomyModal && (
          <div className={styles.modalOverlay}>
            <motion.div className={styles.modalContent} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className={styles.modalHeader}>
                <h2>Crear Nodo Taxonómico</h2>
                <button className={styles.closeBtn} onClick={() => setShowTaxonomyModal(false)}><X size={20} /></button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}><label>Nombre del Concepto</label><input type="text" className={styles.input} value={newTaxonomy.name} onChange={e => setNewTaxonomy({...newTaxonomy, name: e.target.value})} /></div>
                <div className={styles.formGroup}><label>Concepto Padre (Opcional)</label>
                  <select className={styles.input} value={newTaxonomy.parent_id} onChange={e => setNewTaxonomy({...newTaxonomy, parent_id: e.target.value})}>
                    <option value="">Ninguno (Concepto Raíz)</option>
                    {taxonomies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}><label>Descripción</label><input type="text" className={styles.input} value={newTaxonomy.description} onChange={e => setNewTaxonomy({...newTaxonomy, description: e.target.value})} /></div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setShowTaxonomyModal(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleSaveTaxonomy}><Save size={16} /> Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Registrar Producto de Datos */}
      <AnimatePresence>
        {showProductModal && (
          <div className={styles.modalOverlay}>
            <motion.div className={styles.modalContent} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className={styles.modalHeader}>
                <h2>Registrar Producto de Datos</h2>
                <button className={styles.closeBtn} onClick={() => setShowProductModal(false)}><X size={20} /></button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}><label>Nombre del Producto de Datos</label><input type="text" className={styles.input} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                <div className={styles.formGroup}><label>Descripción de Negocio</label><input type="text" className={styles.input} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} /></div>
                <div className={styles.formGroup}><label>Fuentes Técnicas (separadas por coma)</label><input type="text" className={styles.input} value={newProduct.sources} onChange={e => setNewProduct({...newProduct, sources: e.target.value})} /></div>
                <div className={styles.formGroup}><label>Consumidores / Áreas consumidoras (separadas por coma)</label><input type="text" className={styles.input} value={newProduct.consumers} onChange={e => setNewProduct({...newProduct, consumers: e.target.value})} /></div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setShowProductModal(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleSaveDataProduct}><Save size={16} /> Registrar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
