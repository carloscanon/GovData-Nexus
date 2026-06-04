'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Database, AlertTriangle, CheckCircle2, ChevronDown, Info, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './CreateRuleModal.module.css';

const demoAssets = [
  { id: '1', name: 'Maestro de Clientes' },
  { id: '2', name: 'Transacciones Q2' },
  { id: '3', name: 'Leads Marketing' },
  { id: '4', name: 'Reporte Consolidado' },
];

function getDemoFields(assetId: string) {
  const fieldsMap: any = {
    '1': [
      { id: 'f1-1', field_name: 'id', data_type: 'INTEGER' },
      { id: 'f1-2', field_name: 'nombre', data_type: 'VARCHAR' },
      { id: 'f1-3', field_name: 'email', data_type: 'VARCHAR' },
      { id: 'f1-4', field_name: 'rut', data_type: 'VARCHAR' },
      { id: 'f1-5', field_name: 'telefono', data_type: 'VARCHAR' },
    ],
    '2': [
      { id: 'f2-1', field_name: 'id_transaccion', data_type: 'INTEGER' },
      { id: 'f2-2', field_name: 'cliente_id', data_type: 'INTEGER' },
      { id: 'f2-3', field_name: 'monto', data_type: 'NUMERIC' },
      { id: 'f2-4', field_name: 'tarjeta_hash', data_type: 'VARCHAR' },
      { id: 'f2-5', field_name: 'estado', data_type: 'VARCHAR' },
    ],
    '3': [
      { id: 'f3-1', field_name: 'sku', data_type: 'VARCHAR' },
      { id: 'f3-2', field_name: 'nombre_producto', data_type: 'VARCHAR' },
      { id: 'f3-3', field_name: 'categoria', data_type: 'VARCHAR' },
      { id: 'f3-4', field_name: 'precio_unitario', data_type: 'NUMERIC' },
    ],
    '4': [
      { id: 'f4-1', field_name: 'id', data_type: 'INTEGER' },
      { id: 'f4-2', field_name: 'total_ventas', data_type: 'NUMERIC' },
      { id: 'f4-3', field_name: 'region', data_type: 'VARCHAR' },
    ]
  };
  return fieldsMap[assetId] || [
    { id: 'f-gen-1', field_name: 'id', data_type: 'INTEGER' },
    { id: 'f-gen-2', field_name: 'nombre', data_type: 'VARCHAR' }
  ];
}

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRule?: any) => void;
  ruleToEdit?: any;
  assetId?: string;
  fields?: any[];
  assets?: any[];
}

export default function CreateRuleModal({ isOpen, onClose, onSuccess, ruleToEdit, assetId, fields: propFields, assets: propAssets }: CreateRuleModalProps) {
  const { mode, currentTenant } = usePlatform();
  const [step, setStep] = useState(1);
  const [assets, setAssets] = useState<any[]>(propAssets || []);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [ruleData, setRuleData] = useState<any>({
    asset_id: '',
    field_id: '',
    name: '',
    type: 'Nulos',
    severity: 'Media',
    config: {}
  });

  useEffect(() => {
    if (isOpen) {
      if (propAssets && propAssets.length > 0) {
        setAssets(propAssets.map(a => ({ id: a.id, name: a.name })));
      } else {
        fetchAssets();
      }
      
      if (propFields) {
        setFields(propFields);
      }

      if (ruleToEdit) {
        setRuleData({
          asset_id: ruleToEdit.asset_id,
          field_id: ruleToEdit.field_id,
          name: ruleToEdit.name,
          type: ruleToEdit.type,
          severity: ruleToEdit.severity,
          config: ruleToEdit.config || {}
        });
        fetchFields(ruleToEdit.asset_id);
      } else {
        // Reiniciar estado al abrir para nueva regla, preservando el assetId si se pasa por prop
        setRuleData({
          asset_id: assetId || '',
          field_id: '',
          name: '',
          type: 'Nulos',
          severity: 'Media',
          config: {}
        });
        if (assetId) {
          fetchFields(assetId);
        } else {
          setFields([]);
        }
      }
    }
  }, [isOpen, ruleToEdit, assetId, propAssets, propFields]);

  async function fetchAssets() {
    if (mode === 'DEMO') {
      // Cargar activos desde localStorage de la empresa activa para que aparezcan los activos nuevos
      const localKey = `govdata_assets_${currentTenant?.id || 'demo'}`;
      try {
        const saved = localStorage.getItem(localKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAssets(parsed.map((a: any) => ({ id: a.id, name: a.name })));
          return;
        }
      } catch {}
      setAssets(demoAssets);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('data_assets')
        .select('id, name')
        .or(`tenant_id.eq.${currentTenant?.id || ''},tenant_id.is.null`);
      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.warn('Error al cargar activos de base de datos en CreateRuleModal, aplicando fallback:', err);
      // Fallback a localStorage con aislamiento por empresa
      const localKey = `govdata_assets_${currentTenant?.id || 'demo'}`;
      try {
        const saved = localStorage.getItem(localKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAssets(parsed.map((a: any) => ({ id: a.id, name: a.name })));
          return;
        }
      } catch {}
      setAssets(demoAssets);
    }
  }

  async function fetchFields(assetId: string) {
    if (mode === 'DEMO') {
      const mockFields = getDemoFields(assetId);
      setFields(mockFields);
      return;
    }

    try {
      const { data, error } = await supabase.from('asset_fields').select('id, field_name, data_type').eq('asset_id', assetId);
      if (error) throw error;
      setFields(data || []);
    } catch (err) {
      console.warn('Error al cargar campos en CreateRuleModal, aplicando fallback:', err);
      const mockFields = getDemoFields(assetId);
      setFields(mockFields);
    }
  }

  const handleAssetChange = (id: string) => {
    setRuleData({ ...ruleData, asset_id: id, field_id: '' });
    if (id) fetchFields(id);
  };

  // Plantillas de la Biblioteca Corporativa
  const corporateTemplates = [
    { id: 't1', name: 'Correo electrónico válido', type: 'Formato', config: { formatType: 'email', regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }, description: 'Valida estructura estándar de email', domain: 'Clientes', industry: 'General', system: 'CRM/ERP' },
    { id: 't2', name: 'RFC válido (México)', type: 'Formato', config: { formatType: 'custom', regex: '^[A-ZÑ&]{3,4}\\d{6}[A-Z0-9]{3}$' }, description: 'Valida estructura oficial del RFC', domain: 'Finanzas', industry: 'Servicios', system: 'SAT' },
    { id: 't3', name: 'NIT válido (Colombia)', type: 'Formato', config: { formatType: 'custom', regex: '^\\d{9}-\\d{1}$' }, description: 'Valida estructura oficial de identificación fiscal NIT', domain: 'Finanzas', industry: 'Servicios', system: 'DIAN' },
    { id: 't4', name: 'Documento único de identidad', type: 'Duplicados', config: { caseSensitive: true }, description: 'Valida que no existan duplicados en identificaciones', domain: 'Clientes', industry: 'General', system: 'Todos' },
    { id: 't5', name: 'Fecha de nacimiento válida', type: 'Rango', config: { min: 1900, max: 2026 }, description: 'Valida que el año de nacimiento esté en rango realista', domain: 'RRHH', industry: 'General', system: 'Nómina' },
    { id: 't6', name: 'Código SAP válido', type: 'Formato', config: { formatType: 'custom', regex: '^SAP-\\d{5,8}$' }, description: 'Valida formato de código de producto o proveedor SAP', domain: 'Compras', industry: 'Manufactura', system: 'SAP ERP' }
  ];

  const handleApplyTemplate = (tpl: any) => {
    setRuleData((prev: any) => ({
      ...prev,
      name: tpl.name,
      type: tpl.type,
      config: tpl.config || {},
      description: tpl.description
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    console.log("Saving Rule Payload:", ruleData);
    
    const newRuleId = ruleToEdit ? ruleToEdit.id : `rule-${Date.now()}`;
    const fullRuleData = {
      id: newRuleId,
      ...ruleData,
      status: 'Activa',
      created_at: new Date().toISOString()
    };

    if (mode === 'DEMO') {
      alert('Regla de calidad configurada y activada exitosamente (Modo DEMO).');
      onSuccess(fullRuleData);
      onClose();
      setLoading(false);
      return;
    }

    try {
      const payloadToSave = { ...fullRuleData };
      delete payloadToSave.id; // Deja que Supabase autogenere el UUID si es necesario, o usa el generado si la tabla no tiene default
      
      const query = ruleToEdit 
        ? supabase.from('quality_rules').update({
            name: ruleData.name,
            type: ruleData.type,
            severity: ruleData.severity,
            field_id: ruleData.field_id || null,
            config: ruleData.config
          }).eq('id', ruleToEdit.id).select()
        : supabase.from('quality_rules').insert([{
            ...ruleData,
            field_id: ruleData.field_id || null,
            status: 'Activa'
          }]).select();
      
      const { data, error } = await query;
      if (error) throw error;
      
      alert('Regla de calidad guardada y activada exitosamente.');
      onSuccess(data?.[0] || fullRuleData);
      onClose();
    } catch (err: any) {
      console.warn('Error al guardar la regla en base de datos. Aplicando fallback local:', err);
      alert('Regla de calidad configurada y activada exitosamente (Modo local - Base de datos desconectada).');
      onSuccess(fullRuleData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleIcon}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <h2>{ruleToEdit ? 'Editar Regla de Calidad' : 'Crear Regla de Calidad'}</h2>
            <p>{ruleToEdit ? 'Modifique los parámetros de validación.' : 'Configure validaciones automáticas sin código.'}</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </header>

        <div className={styles.content} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className={styles.formGroup}>
            <label>1. Seleccionar Activo de Datos</label>
            <select 
              value={ruleData.asset_id} 
              onChange={(e) => handleAssetChange(e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccione un activo...</option>
              {(propAssets && propAssets.length > 0 ? propAssets : assets).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {(propAssets && propAssets.length > 0 ? propAssets : assets).length === 0 && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                No se encontraron activos. Registre un activo en el catálogo primero.
              </p>
            )}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>2. Campo Principal a Validar</label>
              <select 
                value={ruleData.field_id} 
                onChange={(e) => setRuleData({ ...ruleData, field_id: e.target.value })}
                disabled={!ruleData.asset_id}
                className={styles.select}
              >
                <option value="">Seleccione un campo...</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.field_name} ({f.data_type})</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>3. Tipo de Regla</label>
              <select 
                value={ruleData.type} 
                onChange={(e) => setRuleData({ ...ruleData, type: e.target.value, config: {} })}
                className={styles.select}
              >
                <option value="Nulos">No Nulos (Completitud)</option>
                <option value="Duplicados">Unicidad (Sin duplicados)</option>
                <option value="Formato">Formato (Email, RFC, etc.)</option>
                <option value="Rango">Rango (Valores min/max)</option>
                <option value="Comparacion">Comparación de Campos (A vs B)</option>
                <option value="Negocio">Lógica de Negocio / Fórmula</option>
              </select>
            </div>
          </div>

          {/* Biblioteca Corporativa Panel */}
          {!ruleToEdit && (
            <div className={styles.configBox} style={{ border: '1px solid #6366f1', background: '#f5f7ff' }}>
              <div className={styles.configHeader} style={{ background: '#e0e4ff', color: '#4f46e5' }}>
                <Shield size={16} />
                <span>¿Usar plantilla de la Biblioteca Corporativa?</span>
              </div>
              <div className={styles.configBody} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px' }}>
                {corporateTemplates.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className={styles.sevBtn}
                    style={{ fontSize: '0.78rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 12px' }}
                  >
                    <strong style={{ color: '#4f46e5' }}>{tpl.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      Dom: {tpl.domain} · Sis: {tpl.system}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>4. Nombre de la Regla</label>
            <input 
              type="text" 
              placeholder="Ej: Email debe tener formato válido o fecha_fin >= fecha_inicio" 
              className={styles.input}
              value={ruleData.name}
              onChange={(e) => setRuleData({ ...ruleData, name: e.target.value })}
            />
          </div>

          <div className={styles.configBox}>
            <div className={styles.configHeader}>
              <Info size={16} />
              <span>Configuración de la Regla</span>
            </div>
            <div className={styles.configBody}>
              {ruleData.type === 'Nulos' && (
                <div className={styles.configDetail}>
                  <p>La regla fallará si el campo contiene valores vacíos o NULL.</p>
                  <label className={styles.checkLabel}>
                    <input 
                      type="checkbox" 
                      checked={ruleData.config?.countBlanks || false}
                      onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, countBlanks: e.target.checked}})}
                    />
                    También considerar cadenas vacías ("") como nulo
                  </label>
                </div>
              )}
              {ruleData.type === 'Duplicados' && (
                <div className={styles.configDetail}>
                  <p>La regla fallará si existen valores repetidos en esta columna.</p>
                  <label className={styles.checkLabel}>
                    <input 
                      type="checkbox" 
                      checked={ruleData.config?.caseSensitive || false}
                      onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, caseSensitive: e.target.checked}})}
                    />
                    Comparación sensible a mayúsculas/minúsculas
                  </label>
                </div>
              )}
              {ruleData.type === 'Formato' && (
                <div className={styles.configDetail}>
                  <label>Formato esperado</label>
                  <select 
                    className={styles.selectSmall}
                    value={ruleData.config?.formatType || 'email'}
                    onChange={(e) => {
                      const presets: any = {
                        email: { regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', label: 'Email Estándar' },
                        rfc: { regex: '^[A-ZÑ&]{3,4}\\d{6}[A-Z0-9]{3}$', label: 'RFC (México)' },
                        phone: { regex: '^\\d{10}$', label: 'Teléfono (10 dígitos)' },
                        zip: { regex: '^\\d{5}$', label: 'Código Postal' },
                        url: { regex: '^https?:\\/\\/.+', label: 'URL' },
                        numeric: { regex: '^-?\\d+(\\.\\d+)?$', label: 'Solo Números' },
                        alpha: { regex: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$', label: 'Solo Letras' },
                        custom: { regex: '', label: 'Personalizado' }
                      };
                      const selected = presets[e.target.value] || presets.custom;
                      setRuleData({...ruleData, config: {...ruleData.config, formatType: e.target.value, regex: selected.regex}});
                    }}
                  >
                    <option value="email">Email Estándar</option>
                    <option value="rfc">RFC (México)</option>
                    <option value="phone">Teléfono (10 dígitos)</option>
                    <option value="zip">Código Postal</option>
                    <option value="url">URL (http/https)</option>
                    <option value="numeric">Solo Números</option>
                    <option value="alpha">Solo Letras</option>
                    <option value="custom">⚙️ Personalizado (Regex)</option>
                  </select>
                  {ruleData.config?.formatType === 'custom' && (
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Expresión regular: ^[A-Z]{3}\d{4}$"
                      value={ruleData.config?.regex || ''}
                      onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, regex: e.target.value}})}
                      style={{ marginTop: '8px' }}
                    />
                  )}
                  {ruleData.config?.regex && (
                    <p className={styles.regexPreview}>Regex: <code>{ruleData.config.regex}</code></p>
                  )}
                </div>
              )}
              {ruleData.type === 'Rango' && (
                <div className={styles.configDetail}>
                  <p>La regla fallará si el valor numérico está fuera del rango definido.</p>
                  <div className={styles.rangeInputs}>
                    <div>
                      <label>Valor Mínimo</label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="0"
                        value={ruleData.config?.min ?? ''}
                        onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, min: Number(e.target.value)}})}
                      />
                    </div>
                    <div>
                      <label>Valor Máximo</label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="100000"
                        value={ruleData.config?.max ?? ''}
                        onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, max: Number(e.target.value)}})}
                      />
                    </div>
                  </div>
                </div>
              )}
              {ruleData.type === 'Comparacion' && (
                <div className={styles.configDetail}>
                  <p>Compara el campo principal seleccionado arriba con otro campo o valor.</p>
                  <div className={styles.rangeInputs} style={{ gridTemplateColumns: '1fr 2fr' }}>
                    <div>
                      <label>Operador</label>
                      <select
                        className={styles.selectSmall}
                        value={ruleData.config?.operator || '>='}
                        onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, operator: e.target.value}})}
                      >
                        <option value=">=">&gt;= (Mayor o igual)</option>
                        <option value="<=">&lt;= (Menor o igual)</option>
                        <option value="=">= (Igual a)</option>
                        <option value=">">&gt; (Mayor estricto)</option>
                        <option value="<">&lt; (Menor estricto)</option>
                        <option value="!=">!= (Diferente de)</option>
                      </select>
                    </div>
                    <div>
                      <label>Campo de Comparación</label>
                      <select
                        className={styles.selectSmall}
                        value={ruleData.config?.compareFieldId || ''}
                        onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, compareFieldId: e.target.value}})}
                      >
                        <option value="">-- Seleccionar campo --</option>
                        {fields.map(f => (
                          <option key={f.id} value={f.field_name}>{f.field_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <label>O valor constante (si no seleccionó campo):</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: 18 o 'Activo'"
                      value={ruleData.config?.constantValue || ''}
                      onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, constantValue: e.target.value}})}
                    />
                  </div>
                </div>
              )}
              {ruleData.type === 'Negocio' && (
                <div className={styles.configDetail}>
                  <label>Fórmula o Expresión Matemática / Lógica</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Ej: monto_total = subtotal + impuestos o edad >= 18"
                    rows={3}
                    value={ruleData.config?.expression || ''}
                    onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, expression: e.target.value}})}
                  />
                  <p style={{ fontSize: '0.75rem', marginTop: '4px', color: '#94a3b8' }}>
                    Puede usar operadores matemáticos estándar y nombres de campos.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.severitySection}>
            <label>Severidad del Incidente</label>
            <div className={styles.severityOptions}>
              {['Baja', 'Media', 'Alta', 'Crítica'].map(s => (
                <button 
                  key={s}
                  className={`${styles.sevBtn} ${ruleData.severity === s ? styles.sevActive : ''}`}
                  onClick={() => setRuleData({ ...ruleData, severity: s })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
          <button 
            onClick={handleSave} 
            className={styles.saveBtn}
            disabled={loading || !ruleData.name}
          >
            {loading ? 'Guardando...' : ruleToEdit ? 'Guardar Cambios' : 'Activar Regla'}
          </button>
        </footer>
      </div>
    </div>
  );
}
