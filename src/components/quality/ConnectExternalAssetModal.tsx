'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Loader2, Link2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './ConnectExternalAssetModal.module.css';

interface ConnectExternalAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  onSuccess: () => void;
}

export default function ConnectExternalAssetModal({ isOpen, onClose, asset, onSuccess }: ConnectExternalAssetModalProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingConns, setFetchingConns] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen]);

  const fetchConnections = async () => {
    setFetchingConns(true);
    try {
      const { data, error } = await supabase.from('data_connections').select('*').order('name');
      if (!error && data) {
        setConnections(data);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setFetchingConns(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedConnection) {
      alert('Seleccione una conexión válida');
      return;
    }

    setLoading(true);
    try {
      // Remover la etiqueta 'Metadatos_Externos' y agregar la referencia a la conexión
      const currentTags = asset.tags || [];
      const newTags = currentTags.filter((t: string) => t !== 'Metadatos_Externos');

      const { error } = await supabase
        .from('data_assets')
        .update({ 
          tags: newTags,
          source: selectedConnection // Guardamos el ID o nombre de la conexión
        })
        .eq('id', asset.id);

      if (error) throw error;
      
      alert('Conexión establecida exitosamente. Ahora puede ejecutar reglas de calidad sobre este activo.');
      onSuccess();
    } catch (error: any) {
      alert('Error al enlazar la conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay}>
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>

          <div className={styles.header}>
            <div className={styles.iconCircle}>
              <Database size={32} />
            </div>
            <h2>Enlazar Base de Datos</h2>
            <p>
              El activo <strong>{asset.name}</strong> actualmente solo tiene metadatos. 
              Seleccione un conector existente para habilitar las consultas de calidad.
            </p>
          </div>

          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Conector Disponible</label>
              <select 
                value={selectedConnection} 
                onChange={(e) => setSelectedConnection(e.target.value)}
                disabled={fetchingConns}
              >
                <option value="">-- Seleccionar Conexión --</option>
                {connections.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.source_id})
                  </option>
                ))}
              </select>
            </div>
            {connections.length === 0 && !fetchingConns && (
              <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '-10px' }}>
                No hay conexiones guardadas. Debe crear una desde AutoScan primero.
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button 
              className={styles.connectBtn} 
              onClick={handleConnect}
              disabled={loading || !selectedConnection || connections.length === 0}
            >
              {loading ? <Loader2 size={18} className={styles.spin} /> : <Link2 size={18} />}
              Vincular Conector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
