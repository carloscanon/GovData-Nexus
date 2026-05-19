'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Database, AlertTriangle, CheckCircle2, ChevronDown, Info, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './CreateRuleModal.module.css';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ruleToEdit?: any;
  assetId?: string;
  fields?: any[];
}

export default function CreateRuleModal({ isOpen, onClose, onSuccess, ruleToEdit, assetId, fields: propFields }: CreateRuleModalProps) {
  const [step, setStep] = useState(1);
  const [assets, setAssets] = useState<any[]>([]);
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
      if (assetId) {
        setRuleData((prev: any) => ({ ...prev, asset_id: assetId }));
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
        // Reiniciar estado al abrir para nueva regla
        setRuleData({
          asset_id: '',
          field_id: '',
          name: '',
          type: 'Nulos',
          severity: 'Media',
          config: {}
        });
        setFields([]);
      }
    }
  }, [isOpen, ruleToEdit]);

  async function fetchAssets() {
    const { data, error } = await supabase.from('data_assets').select('id, name');
    if (error) console.error('Modal Fetch Assets Error:', error);
    setAssets(data || []);
  }

  async function fetchFields(assetId: string) {
    const { data, error } = await supabase.from('asset_fields').select('id, field_name, data_type').eq('asset_id', assetId);
    if (error) console.error('Modal Fetch Fields Error:', error);
    setFields(data || []);
  }

  const handleAssetChange = (id: string) => {
    setRuleData({ ...ruleData, asset_id: id, field_id: '' });
    if (id) fetchFields(id);
  };

  const handleSave = async () => {
    setLoading(true);
    console.log("Saving Rule Payload:", ruleData);
    try {
      const query = ruleToEdit 
        ? supabase.from('quality_rules').update(ruleData).eq('id', ruleToEdit.id)
        : supabase.from('quality_rules').insert([ruleData]);
      
      const { error } = await query;
      
      if (error) {
        console.error("Supabase Error:", error);
        alert(`Error de Base de Datos (${error.code}): ${error.message}\n${error.details || ''}`);
        return;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Runtime Error:", err);
      alert(`Error inesperado: ${err.message || 'Error desconocido'}`);
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

        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label>1. Seleccionar Activo de Datos</label>
            <select 
              value={ruleData.asset_id} 
              onChange={(e) => handleAssetChange(e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccione un activo...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>2. Campo a Validar</label>
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
                onChange={(e) => setRuleData({ ...ruleData, type: e.target.value })}
                className={styles.select}
              >
                <option value="Nulos">No Nulos (Completitud)</option>
                <option value="Duplicados">Unicidad (Sin duplicados)</option>
                <option value="Formato">Formato (Email, RFC, etc.)</option>
                <option value="Rango">Rango (Valores min/max)</option>
                <option value="Negocio">Lógica de Negocio</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>4. Nombre de la Regla</label>
            <input 
              type="text" 
              placeholder="Ej: Email debe tener formato válido" 
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
              {ruleData.type === 'Negocio' && (
                <div className={styles.configDetail}>
                  <label>Valores Permitidos (separados por coma)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Activo, Inactivo, Suspendido"
                    value={ruleData.config?.allowedValues || ''}
                    onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, allowedValues: e.target.value}})}
                  />
                  <label style={{ marginTop: '10px', display: 'block' }}>Expresión de Validación (opcional)</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Ej: campo_edad >= 18 AND campo_edad <= 120"
                    rows={3}
                    value={ruleData.config?.expression || ''}
                    onChange={(e) => setRuleData({...ruleData, config: {...ruleData.config, expression: e.target.value}})}
                  />
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
            disabled={loading || !ruleData.field_id || !ruleData.name}
          >
            {loading ? 'Guardando...' : ruleToEdit ? 'Guardar Cambios' : 'Activar Regla'}
          </button>
        </footer>
      </div>
    </div>
  );
}
