'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, MessageSquare, MessageSquareShare, Mail, Link2, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './NotificationSettingsModal.module.css';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: '',
    type: 'slack',
    webhook_url: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchChannels();
    }
  }, [isOpen]);

  async function fetchChannels() {
    const { data } = await supabase.from('notification_channels').select('*');
    setChannels(data || []);
  }

  const handleAddChannel = async () => {
    if (!newChannel.webhook_url) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('notification_channels').insert([newChannel]);
      if (error) throw error;
      setNewChannel({ name: '', type: 'slack', webhook_url: '' });
      fetchChannels();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notification_channels').delete().eq('id', id);
    fetchChannels();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleIcon}>
            <Bell size={20} color="white" />
          </div>
          <div>
            <h2>Canales de Alerta</h2>
            <p>Conecte Nexus con sus herramientas de comunicación.</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </header>

        <div className={styles.content}>
          <div className={styles.addSection}>
            <h4>Nuevo Canal</h4>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label>Nombre del Canal</label>
                <input 
                  placeholder="Ej: Alertas Calidad - IT" 
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Plataforma</label>
                <select 
                  value={newChannel.type}
                  onChange={(e) => setNewChannel({ ...newChannel, type: e.target.value })}
                >
                  <option value="slack">Slack</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="email">Email Corporativo</option>
                </select>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Webhook URL / Endpoint</label>
              <div className={styles.urlInput}>
                <Link2 size={16} />
                <input 
                  placeholder="https://hooks.slack.com/services/..." 
                  value={newChannel.webhook_url}
                  onChange={(e) => setNewChannel({ ...newChannel, webhook_url: e.target.value })}
                />
              </div>
            </div>
            <button 
              className={styles.addBtn} 
              onClick={handleAddChannel}
              disabled={loading || !newChannel.webhook_url}
            >
              {loading ? <Loader2 size={18} className={styles.spin} /> : 'Conectar Canal'}
            </button>
          </div>

          <div className={styles.listSection}>
            <h4>Canales Activos</h4>
            {channels.length === 0 ? (
              <div className={styles.empty}>No hay canales configurados.</div>
            ) : (
              <div className={styles.channelList}>
                {channels.map((ch) => (
                  <div key={ch.id} className={styles.channelItem}>
                    <div className={styles.chIcon}>
                      {ch.type === 'slack' && <MessageSquareShare size={20} color="#4A154B" />}
                      {ch.type === 'teams' && <MessageSquare size={20} color="#4B53BC" />}
                      {ch.type === 'email' && <Mail size={20} color="#EA4335" />}
                    </div>
                    <div className={styles.chInfo}>
                      <strong>{ch.name}</strong>
                      <span>{ch.webhook_url.substring(0, 30)}...</span>
                    </div>
                    <div className={styles.chActions}>
                      <div className={styles.statusBadge}>Activo</div>
                      <button onClick={() => handleDelete(ch.id)} className={styles.deleteBtn}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
