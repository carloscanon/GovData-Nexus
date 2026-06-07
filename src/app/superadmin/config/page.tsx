'use client';

import React, { useState, useEffect } from 'react';
import { Save, Mail, Cpu, Palette, ShieldAlert, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

// ─────────────────────────────────────────────
// SA Theme Presets
// ─────────────────────────────────────────────
interface SAPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  accent: string;
  theme: {
    background: string;
    card: string;
    border: string;
    primary: string;
    text: string;
    fontFamily: string;
    sidebarText: string;
    btnText: string;
  };
}

const SA_PRESETS: SAPreset[] = [
  {
    id: 'cosmos',
    name: 'Cosmos',
    description: 'Azul profundo · Inter · Tema por defecto',
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #050b14 0%, #090f1d 50%, #0d1f3c 100%)',
    accent: '#3b82f6',
    theme: {
      background: '#050b14',
      card: '#090f1d',
      border: '#16223f',
      primary: '#3b82f6',
      text: '#ffffff',
      fontFamily: 'Inter',
      sidebarText: '#94a3b8',
      btnText: '#ffffff',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Blanco polar · Poppins · Modo claro',
    emoji: '❄️',
    gradient: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #dce8ff 100%)',
    accent: '#6366f1',
    theme: {
      background: '#f0f4ff',
      card: '#ffffff',
      border: '#c7d2fe',
      primary: '#6366f1',
      text: '#1e1b4b',
      fontFamily: 'Poppins',
      sidebarText: '#4338ca',
      btnText: '#ffffff',
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Carbón & naranja · Montserrat · Alto contraste',
    emoji: '🔥',
    gradient: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #2a1a0a 100%)',
    accent: '#f97316',
    theme: {
      background: '#0f0a06',
      card: '#1a1008',
      border: '#3d2210',
      primary: '#f97316',
      text: '#fef3e2',
      fontFamily: 'Montserrat',
      sidebarText: '#fb923c',
      btnText: '#0f0a06',
    },
  },
];

// Inject Google Fonts dynamically
function injectFont(fontFamily: string) {
  if (fontFamily === 'Inter' || fontFamily === 'system-ui' || fontFamily === 'monospace') return;
  const id = `sa-gfont-${fontFamily.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

export default function SaaSGeneralConfigPage() {
  const { saTheme, setSaTheme } = usePlatform();
  const [localTheme, setLocalTheme] = useState(saTheme);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Superadmin Management State
  const [saUsers, setSaUsers] = useState([
    { email: 'carlos@govdata.com', role: 'Owner', date: '2025-01-01' },
    { email: 'admin@govdata.com', role: 'Superadmin', date: '2025-02-15' }
  ]);
  const [newSaEmail, setNewSaEmail] = useState('');

  // Detect which preset matches current theme on load
  useEffect(() => {
    const matched = SA_PRESETS.find(p =>
      p.theme.background === saTheme.background &&
      p.theme.primary === saTheme.primary
    );
    if (matched) setActivePresetId(matched.id);
  }, []);

  const handleApplyPreset = (preset: SAPreset) => {
    injectFont(preset.theme.fontFamily);
    setLocalTheme(preset.theme);
    setActivePresetId(preset.id);
  };

  const handleInviteSa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaEmail) return;
    setSaUsers([...saUsers, { email: newSaEmail, role: 'Superadmin', date: new Date().toISOString().split('T')[0] }]);
    setNewSaEmail('');
    setToast('Privilegios de Superadministrador otorgados.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    injectFont(localTheme.fontFamily);
    setSaTheme(localTheme);
    setToast('Configuración guardada correctamente.');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sa-title-area">
        <div>
          <h1 className="sa-title">Configuración del Sistema</h1>
          <p className="sa-subtitle">Configuración global del motor SaaS, integraciones y servidores de soporte.</p>
        </div>
        <button onClick={handleSave} className="sa-btn sa-btn-primary">
          <Save className="w-5 h-5" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="sa-card-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {/* Core Config */}
        <div className="sa-card" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Configuración del Motor SaaS</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="sa-form-group">
              <label className="sa-label">Url del Portal Global</label>
              <input type="text" defaultValue="https://portal.govdata.com" className="sa-input" />
            </div>
            <div className="sa-form-group">
              <label className="sa-label">Tasa de impuesto por suscripción (%)</label>
              <input type="number" defaultValue="19" className="sa-input" />
            </div>
          </div>
        </div>

        {/* Mail Config */}
        <div className="sa-card" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail className="w-5 h-5 text-indigo-400" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Servidor de Correo (SMTP)</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="sa-form-group">
              <label className="sa-label">Host SMTP</label>
              <input type="text" defaultValue="smtp.sendgrid.net" className="sa-input" />
            </div>
            <div className="sa-form-group">
              <label className="sa-label">Puerto SMTP</label>
              <input type="number" defaultValue="587" className="sa-input" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Theme Config ── Full Width */}
      <div className="sa-card" style={{ gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Palette className="w-5 h-5 text-pink-400" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Apariencia del Superadmin</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
              Elige un tema predefinido o personaliza cada color manualmente.
            </p>
          </div>
        </div>

        {/* ── Preset Cards ── */}
        <div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>
            Temas Predefinidos
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {SA_PRESETS.map(preset => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: isActive
                      ? `2px solid ${preset.accent}`
                      : '2px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `0 0 0 4px ${preset.accent}22` : 'none',
                  }}
                >
                  {/* Active badge */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      color: preset.accent,
                    }}>
                      <CheckCircle2 size={18} />
                    </div>
                  )}

                  {/* Preview strip */}
                  <div style={{
                    height: '64px',
                    borderRadius: '10px',
                    background: preset.gradient,
                    border: `1px solid ${preset.accent}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    overflow: 'hidden',
                  }}>
                    {/* Mini UI mockup */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '28%', padding: '4px' }}>
                      <div style={{ height: '8px', borderRadius: '4px', background: preset.accent, opacity: 0.9 }} />
                      <div style={{ height: '5px', borderRadius: '4px', background: preset.theme.sidebarText, opacity: 0.7 }} />
                      <div style={{ height: '5px', borderRadius: '4px', background: preset.theme.sidebarText, opacity: 0.4, width: '70%' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                      <div style={{ height: '24px', borderRadius: '6px', background: preset.theme.card, border: `1px solid ${preset.theme.border}`, opacity: 0.9 }} />
                      <div style={{ height: '24px', borderRadius: '6px', background: preset.theme.card, border: `1px solid ${preset.theme.border}`, opacity: 0.6 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{preset.emoji}</div>
                      {/* btn text preview */}
                      <div style={{ fontSize: '0.45rem', fontWeight: 700, background: preset.accent, color: preset.theme.btnText, borderRadius: '3px', padding: '1px 4px', whiteSpace: 'nowrap' }}>
                        BTN
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{preset.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.1rem' }}>{preset.description}</div>
                  </div>

                  {/* Color dots */}
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                      { color: preset.theme.background, label: 'Fondo' },
                      { color: preset.theme.card, label: 'Card' },
                      { color: preset.theme.border, label: 'Borde' },
                      { color: preset.theme.primary, label: 'Primario' },
                      { color: preset.theme.text, label: 'Texto' },
                      { color: preset.theme.sidebarText, label: 'Menú' },
                      { color: preset.theme.btnText, label: 'Botón' },
                    ].map(({ color, label }, i) => (
                      <div key={i} title={label} style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '1.5px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
                    ))}
                    <div style={{ marginLeft: 'auto', fontSize: '0.65rem', color: preset.accent, fontWeight: 700 }}>
                      {preset.theme.fontFamily}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)' }}>
            Ajuste fino
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* ── Manual Color Controls ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Fondo Principal', key: 'background' as const },
            { label: 'Fondo Paneles (Card)', key: 'card' as const },
            { label: 'Color de Bordes', key: 'border' as const },
            { label: 'Color Primario (Acentos)', key: 'primary' as const },
            { label: 'Texto General', key: 'text' as const },
            { label: 'Texto Menú Lateral', key: 'sidebarText' as const },
            { label: 'Texto Botones', key: 'btnText' as const },
          ].map(({ label, key }) => (
            <div className="sa-form-group" key={key}>
              <label className="sa-label">{label}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={localTheme[key]}
                  onChange={e => { setLocalTheme({ ...localTheme, [key]: e.target.value }); setActivePresetId(null); }}
                  style={{ height: 38, width: 38, padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
                />
                <input
                  type="text"
                  value={localTheme[key]}
                  onChange={e => { setLocalTheme({ ...localTheme, [key]: e.target.value }); setActivePresetId(null); }}
                  className="sa-input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          ))}

          <div className="sa-form-group">
            <label className="sa-label">Tipografía (Fuente)</label>
            <select
              value={localTheme.fontFamily}
              onChange={e => { setLocalTheme({ ...localTheme, fontFamily: e.target.value }); setActivePresetId(null); }}
              className="sa-select"
            >
              <option value="Inter">Inter (Por defecto)</option>
              <option value="Roboto">Roboto</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
              <option value="system-ui">System UI</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            const cosmos = SA_PRESETS[0];
            setLocalTheme(cosmos.theme);
            setActivePresetId(cosmos.id);
          }}
          className="sa-btn sa-btn-secondary"
          style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
        >
          Restaurar Original (Cosmos)
        </button>
      </div>

      {/* Superadmin Access Management */}
      <div className="sa-card" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Acceso Global (Superadministradores)</h3>
        </div>
        <p className="sa-subtitle" style={{ marginTop: 0 }}>
          Otorga o revoca el acceso a la consola global del sistema. Los usuarios con este nivel pueden gestionar clientes, facturación y cambiar configuraciones críticas.
        </p>

        <form onSubmit={handleInviteSa} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
          <div className="sa-form-group" style={{ flex: 1 }}>
            <label className="sa-label">Correo Electrónico del Usuario</label>
            <input 
              type="email" 
              placeholder="ejemplo@govdata.com" 
              value={newSaEmail}
              onChange={e => setNewSaEmail(e.target.value)}
              className="sa-input" 
              required
            />
          </div>
          <button type="submit" className="sa-btn sa-btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            <UserPlus className="w-4 h-4" /> Otorgar Acceso
          </button>
        </form>

        <div className="sa-table-container" style={{ marginTop: '2rem' }}>
          <table className="sa-table">
            <thead>
              <tr>
                <th>Usuario (Email)</th>
                <th>Nivel de Acceso</th>
                <th>Fecha de Asignación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {saUsers.map((user, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{user.email}</td>
                  <td>
                    <span className={user.role === 'Owner' ? 'sa-badge sa-badge-amber' : 'sa-badge sa-badge-blue'}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.date}</td>
                  <td>
                    {user.role !== 'Owner' && (
                      <button 
                        onClick={() => {
                          if (confirm(`¿Revocar acceso a ${user.email}?`)) {
                            setSaUsers(saUsers.filter((_, i) => i !== idx));
                          }
                        }}
                        className="sa-btn sa-btn-danger" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 className="w-3 h-3" /> Revocar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
