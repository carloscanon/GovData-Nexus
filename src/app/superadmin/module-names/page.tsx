// src/app/superadmin/module-names/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SUPERADMIN_MODULES, TENANT_MODULES, MODULE_DEFAULT_LABELS } from '@/lib/moduleRegistry';

// Reserved UUID for global (superadmin-level) config — not tied to any real tenant
const GLOBAL_TENANT_ID = '00000000-0000-0000-0000-000000000001';

type ModuleMap = Record<string, string>;

export default function ModuleNamesPage() {
  const [moduleNames, setModuleNames] = useState<ModuleMap>({});
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'superadmin' | 'tenant'>('tenant');

  // Load saved custom names from Supabase tenant_config table
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('tenant_config')
        .select('config_value')
        .eq('tenant_id', GLOBAL_TENANT_ID)
        .eq('config_key', 'module_config')
        .single();
      
      if (!error && data && data.config_value) {
        setModuleNames(data.config_value as ModuleMap);
      }
    };
    fetch();
  }, []);

  const handleChange = (key: string, value: string) => {
    setModuleNames(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const cleanNames: ModuleMap = {};
    Object.entries(moduleNames).forEach(([key, val]) => {
      if (val && val.trim() !== '') {
        cleanNames[key] = val;
      }
    });

    try {
      const { error } = await supabase
        .from('tenant_config')
        .upsert({
          tenant_id: GLOBAL_TENANT_ID,
          config_key: 'module_config',
          config_value: cleanNames,
          updated_at: new Date().toISOString()
        }, { onConflict: 'tenant_id,config_key' });

      if (error) {
        console.error('Supabase upsert error:', JSON.stringify(error));
        throw error;
      }
      setToast('✅ Nombres guardados');
    } catch (e) {
      console.error('handleSave error:', e);
      setToast('⚠️ Error al guardar');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = async () => {
    if (!confirm('Restablecer a los nombres predeterminados?')) return;
    try {
      const { error } = await supabase
        .from('tenant_config')
        .delete()
        .eq('tenant_id', GLOBAL_TENANT_ID)
        .eq('config_key', 'module_config');

      if (error) throw error;
      setModuleNames({});
      setToast('🔄 Restablecido a valores por defecto');
    } catch (e) {
      console.warn(e);
      setToast('⚠️ Error al restablecer');
    }
    setTimeout(() => setToast(null), 3000);
  };

  // ✅ Derived dynamically from the registry — no manual sync needed
  const currentModules = activeTab === 'superadmin' ? SUPERADMIN_MODULES : TENANT_MODULES;

  return (
    <div className="fade-in" style={{ padding: '2rem', color: '#cbd5e1', fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#10b981', color: '#fff', padding: '1rem 1.5rem', borderRadius: '12px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{toast}</div>
      )}
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>Configurar Nombres de Módulos</h1>
      <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Personaliza las etiquetas de los menús de navegación de la barra lateral.</p>
      <p style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '2rem' }}>
        {currentModules.length} módulos disponibles — se actualiza automáticamente cuando se añaden nuevos módulos al sistema.
      </p>

      {/* Tabs Layout */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '16px', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('tenant')}
          style={{
            padding: '12px 20px',
            border: 'none',
            borderBottom: activeTab === 'tenant' ? '3px solid #3b82f6' : '3px solid transparent',
            background: 'none',
            color: activeTab === 'tenant' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}
        >
          Módulos de Usuario Normal ({TENANT_MODULES.length})
        </button>
        <button
          onClick={() => setActiveTab('superadmin')}
          style={{
            padding: '12px 20px',
            border: 'none',
            borderBottom: activeTab === 'superadmin' ? '3px solid #3b82f6' : '3px solid transparent',
            background: 'none',
            color: activeTab === 'superadmin' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}
        >
          Módulos del SuperAdministrador ({SUPERADMIN_MODULES.length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 280px) 1fr', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {currentModules.map(mod => (
          <React.Fragment key={mod.key}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: '#f8fafc', textTransform: 'capitalize' }}>
                {mod.key.replace(/-/g, ' ')}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Por defecto: {mod.label}</span>
            </div>
            <input
              type="text"
              placeholder={mod.label}
              value={moduleNames[mod.key] ?? ''}
              onChange={e => handleChange(mod.key, e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '0.65rem 0.9rem',
                color: '#f8fafc',
                width: '100%',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </React.Fragment>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button onClick={handleSave} className="sa-btn sa-btn-primary" style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'linear-gradient(135deg, #3b82f6, #10b981)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none', color: '#fff', fontWeight: 700 }}>
          <Save size={18} /> Guardar Cambios
        </button>
        <button onClick={handleReset} className="sa-btn sa-btn-secondary" style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#cbd5e1' }}>
          <RotateCcw size={18} /> Restaurar Predeterminados
        </button>
      </div>
    </div>
  );
}
