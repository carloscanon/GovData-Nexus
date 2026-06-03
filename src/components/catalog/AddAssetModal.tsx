'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Database, Loader2, Link2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './AddAssetModal.module.css';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newData?: any) => void;
  assetToEdit?: any;
}

export default function AddAssetModal({ isOpen, onClose, onSuccess, assetToEdit }: AddAssetModalProps) {
  const { mode, currentTenant } = usePlatform();
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConns, setLoadingConns] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Tabla SQL',
    source: '',
    connection_id: '',
    table_name: '',
    schema_name: 'public',
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

  // Cargar conexiones disponibles del catálogo
  useEffect(() => {
    if (!isOpen) return;
    setLoadingConns(true);
    supabase
      .from('data_connections')
      .select('id, name, source_id, host')
      .order('name')
      .then(({ data }) => {
        setConnections(data || []);
        setLoadingConns(false);
      });
  }, [isOpen]);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (assetToEdit) {
      setFormData({
        name: assetToEdit.name || '',
        type: assetToEdit.type || 'Tabla SQL',
        source: assetToEdit.source || '',
        connection_id: assetToEdit.connection_id || '',
        table_name: assetToEdit.table_name || '',
        schema_name: assetToEdit.schema_name || 'public',
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
        connection_id: '',
        table_name: '',
        schema_name: 'public',
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

  // Al seleccionar conexión, auto-completar el campo source
  const handleConnectionChange = (connId: string) => {
    const conn = connections.find(c => c.id === connId);
    setFormData(prev => ({
      ...prev,
      connection_id: connId,
      source: conn ? conn.name : prev.source
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        type: formData.type,
        source: formData.source,
        connection_id: formData.connection_id || null,
        table_name: formData.table_name || null,
        schema_name: formData.schema_name || 'public',
        owner: formData.owner,
        data_owner: formData.data_owner,
        sensitivity: formData.sensitivity,
        quality_score: formData.quality_score,
        status: formData.status,
        description: formData.description,
        risk_level: formData.risk_level,
        criticality: formData.criticality,
        tags: formData.tags
      };

      if (mode === 'DEMO') {
        const demoResult = {
          ...payload,
          id: assetToEdit ? assetToEdit.id : `DEMO-${Date.now()}`,
          code_id: assetToEdit ? assetToEdit.code_id : `AST-${Math.floor(100 + Math.random() * 900)}`,
          tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
          updated_at: new Date().toISOString().split('T')[0]
        };
        onSuccess(demoResult);
        onClose();
        return;
      }

      try {
        if (assetToEdit) {
          const { data, error } = await supabase
            .from('data_assets')
            .update(payload)
            .eq('id', assetToEdit.id)
            .select();
          if (error) throw error;
          onSuccess(data?.[0]);
        } else {
          const { data, error } = await supabase
            .from('data_assets')
            .insert([{ ...payload, tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001' }])
            .select();
          if (error) throw error;
          onSuccess(data?.[0]);
        }
        onClose();
      } catch (dbErr) {
        console.warn('Error al guardar en BD:', dbErr);
        const demoResult = {
          ...payload,
          id: assetToEdit ? assetToEdit.id : `DEMO-${Date.now()}`,
          code_id: `AST-${Math.floor(100 + Math.random() * 900)}`,
          tenant_id: currentTenant?.id,
          updated_at: new Date().toISOString().split('T')[0]
        };
        onSuccess(demoResult);
        onClose();
        alert('Activo guardado localmente (BD desconectada).');
      }
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
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.iconBox}><Database size={20} /></div>
            <div>
              <h3>{assetToEdit ? 'Editar Activo' : 'Registrar Nuevo Activo'}</h3>
              <p>{assetToEdit ? 'Modifica los metadatos del activo.' : 'Registra un activo y vincúlalo a su base de datos.'}</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <label>Nombre del Activo</label>
            <input
              type="text"
              placeholder="Ej: Maestro de Clientes"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* SECCIÓN NUEVA: Conexión a Base de Datos */}
          <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#4f46e5', fontWeight: 700, fontSize: '0.9rem' }}>
              <Link2 size={16} />
              Vinculación a Base de Datos (Para Calidad de Datos)
            </div>
            <div className={styles.row}>
              <div className={styles.formSection}>
                <label>Conexión del Catálogo</label>
                <select
                  value={formData.connection_id}
                  onChange={(e) => handleConnectionChange(e.target.value)}
                  style={{ background: 'white' }}
                >
                  <option value="">— Sin conexión directa —</option>
                  {loadingConns
                    ? <option disabled>Cargando conexiones...</option>
                    : connections.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.source_id} · {c.host || 'conn-string'})
                        </option>
                      ))
                  }
                </select>
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Conexiones registradas en el Catálogo de Datos
                </span>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.formSection}>
                <label>Nombre físico de la tabla</label>
                <input
                  type="text"
                  placeholder="Ej: clientes, public.CLIENTES, ventas_2024"
                  value={formData.table_name}
                  onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Nombre exacto en la BD (no importa mayúsculas/minúsculas)
                </span>
              </div>
              <div className={styles.formSection}>
                <label>Esquema (Schema)</label>
                <input
                  type="text"
                  placeholder="public"
                  value={formData.schema_name}
                  onChange={(e) => setFormData({ ...formData, schema_name: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formSection}>
              <label>Tipo de Activo</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
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
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                required
              />
            </div>
            <div className={styles.formSection}>
              <label>Responsable (Data Owner)</label>
              <input
                type="text"
                placeholder="Ej: Juan Perez"
                value={formData.data_owner}
                onChange={(e) => setFormData({ ...formData, data_owner: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formSection}>
              <label>Sensibilidad</label>
              <select value={formData.sensitivity} onChange={(e) => setFormData({ ...formData, sensitivity: e.target.value })}>
                <option>Público</option>
                <option>Interno</option>
                <option>Restringido</option>
                <option>Confidencial</option>
                <option>Altamente Sensible</option>
              </select>
            </div>
            <div className={styles.formSection}>
              <label>Nivel de Riesgo</label>
              <select value={formData.risk_level} onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}>
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
              <select value={formData.criticality} onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}>
                <option>Baja</option>
                <option>Media</option>
                <option>Alta</option>
                <option>Muy Alta</option>
              </select>
            </div>
            <div className={styles.formSection}>
              <label>Estado</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option>Vigente</option>
                <option>En Revisión</option>
                <option>Borrador</option>
                <option>Deprecado</option>
              </select>
            </div>
          </div>

          <div className={styles.formSection}>
            <label>Etiquetas (separadas por coma)</label>
            <input
              type="text"
              placeholder="Ej: Maestro, Crítico, IA Ready"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
            />
          </div>

          <div className={styles.formSection}>
            <label>Descripción</label>
            <textarea
              placeholder="Describe el propósito de este dato..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
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
