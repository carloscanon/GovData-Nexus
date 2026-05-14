'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Database, Shield, User, Info, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './AddAssetModal.module.css';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetToEdit?: any; // Añadimos prop opcional para editar
}

export default function AddAssetModal({ isOpen, onClose, onSuccess, assetToEdit }: AddAssetModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Tabla SQL',
    source: '',
    owner: '',
    data_owner: '',
    sensitivity: 'Interno',
    quality_score: 100,
    status: 'Vigente',
    description: '',
    risk_level: 'Bajo',
    criticality: 'Media',
    tags: [] as string[]
  });

  // Cargar datos si estamos editando
  React.useEffect(() => {
    if (assetToEdit) {
      setFormData({
        name: assetToEdit.name || '',
        type: assetToEdit.type || 'Tabla SQL',
        source: assetToEdit.source || '',
        owner: assetToEdit.owner || '',
        data_owner: assetToEdit.data_owner || '',
        sensitivity: assetToEdit.sensitivity || 'Interno',
        quality_score: assetToEdit.quality_score || 100,
        status: assetToEdit.status || 'Vigente',
        description: assetToEdit.description || '',
        risk_level: assetToEdit.risk_level || 'Bajo',
        criticality: assetToEdit.criticality || 'Media',
        tags: assetToEdit.tags || []
      });
    } else {
      setFormData({
        name: '',
        type: 'Tabla SQL',
        source: '',
        owner: '',
        data_owner: '',
        sensitivity: 'Interno',
        quality_score: 100,
        status: 'Vigente',
        description: '',
        risk_level: 'Bajo',
        criticality: 'Media',
        tags: []
      });
    }
  }, [assetToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (assetToEdit) {
        // Lógica de ACTUALIZACIÓN
        const { error } = await supabase
          .from('data_assets')
          .update(formData)
          .eq('id', assetToEdit.id);
        if (error) throw error;
      } else {
        // Lógica de CREACIÓN
        const { error } = await supabase
          .from('data_assets')
          .insert([formData]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.drawer} 
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.iconBox}>
              <Database size={20} />
            </div>
            <div>
              <h3>{assetToEdit ? 'Editar Activo' : 'Registrar Nuevo Activo'}</h3>
              <p>{assetToEdit ? 'Modifica los metadatos del activo existente.' : 'Completa los metadatos básicos del activo.'}</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <label>Nombre del Activo</label>
            <input 
              type="text" 
              placeholder="Ej: Maestro de Clientes"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formSection}>
              <label>Tipo de Activo</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option>Tabla SQL</option>
                <option>API</option>
                <option>Vista</option>
                <option>Reporte BI</option>
                <option>Archivo Plano</option>
              </select>
            </div>
            <div className={styles.formSection}>
              <label>Fuente / Sistema</label>
              <input 
                type="text" 
                placeholder="Ej: SAP ERP"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formSection}>
              <label>Área Dueña</label>
              <input 
                type="text" 
                placeholder="Ej: Ventas"
                value={formData.owner}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                required
              />
            </div>
            <div className={styles.formSection}>
              <label>Responsable (Data Owner)</label>
              <input 
                type="text" 
                placeholder="Ej: Juan Perez"
                value={formData.data_owner}
                onChange={(e) => setFormData({...formData, data_owner: e.target.value})}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formSection}>
              <label>Sensibilidad</label>
              <select 
                value={formData.sensitivity}
                onChange={(e) => setFormData({...formData, sensitivity: e.target.value})}
              >
                <option>Público</option>
                <option>Interno</option>
                <option>Restringido</option>
                <option>Confidencial</option>
                <option>Altamente Sensible</option>
              </select>
            </div>
            <div className={styles.formSection}>
              <label>Nivel de Riesgo</label>
              <select 
                value={formData.risk_level}
                onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
              >
                <option>Bajo</option>
                <option>Medio</option>
                <option>Alto</option>
                <option>Crítico</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formSection}>
              <label>Criticidad</label>
              <select 
                value={formData.criticality}
                onChange={(e) => setFormData({...formData, criticality: e.target.value})}
              >
                <option>Baja</option>
                <option>Media</option>
                <option>Alta</option>
                <option>Muy Alta</option>
              </select>
            </div>
            <div className={styles.formSection}>
              <label>Etiquetas (separadas por coma)</label>
              <input 
                type="text" 
                placeholder="Ej: Maestro, Crítico, IA Ready"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <label>Descripción</label>
            <textarea 
              placeholder="Describe el propósito de este dato..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
              Guardar Activo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
