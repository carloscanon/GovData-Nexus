'use client';

import React, { useState } from 'react';
import { Save, Mail, Cpu, Palette, ShieldAlert, UserPlus, Trash2 } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

export default function SaaSGeneralConfigPage() {
  const { saTheme, setSaTheme } = usePlatform();
  const [localTheme, setLocalTheme] = useState(saTheme);
  const [toast, setToast] = useState<string | null>(null);
  
  // Superadmin Management State
  const [saUsers, setSaUsers] = useState([
    { email: 'carlos@govdata.com', role: 'Owner', date: '2025-01-01' },
    { email: 'admin@govdata.com', role: 'Superadmin', date: '2025-02-15' }
  ]);
  const [newSaEmail, setNewSaEmail] = useState('');

  const handleInviteSa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaEmail) return;
    setSaUsers([...saUsers, { email: newSaEmail, role: 'Superadmin', date: new Date().toISOString().split('T')[0] }]);
    setNewSaEmail('');
    setToast('Privilegios de Superadministrador otorgados.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
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

        {/* Theme Config */}
        <div className="sa-card" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Palette className="w-5 h-5 text-pink-400" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Apariencia del Superadmin</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="sa-form-group">
                <label className="sa-label">Fondo Principal</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={localTheme.background} onChange={e => setLocalTheme({...localTheme, background: e.target.value})} style={{ height: 38, width: 38, padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <input type="text" value={localTheme.background} onChange={e => setLocalTheme({...localTheme, background: e.target.value})} className="sa-input" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="sa-form-group">
                <label className="sa-label">Fondo Paneles (Card)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={localTheme.card} onChange={e => setLocalTheme({...localTheme, card: e.target.value})} style={{ height: 38, width: 38, padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <input type="text" value={localTheme.card} onChange={e => setLocalTheme({...localTheme, card: e.target.value})} className="sa-input" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="sa-form-group">
                <label className="sa-label">Color de Bordes</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={localTheme.border} onChange={e => setLocalTheme({...localTheme, border: e.target.value})} style={{ height: 38, width: 38, padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <input type="text" value={localTheme.border} onChange={e => setLocalTheme({...localTheme, border: e.target.value})} className="sa-input" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="sa-form-group">
                <label className="sa-label">Color Primario (Acentos)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={localTheme.primary} onChange={e => setLocalTheme({...localTheme, primary: e.target.value})} style={{ height: 38, width: 38, padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <input type="text" value={localTheme.primary} onChange={e => setLocalTheme({...localTheme, primary: e.target.value})} className="sa-input" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="sa-form-group">
                <label className="sa-label">Color de Textos</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={localTheme.text} onChange={e => setLocalTheme({...localTheme, text: e.target.value})} style={{ height: 38, width: 38, padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <input type="text" value={localTheme.text} onChange={e => setLocalTheme({...localTheme, text: e.target.value})} className="sa-input" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="sa-form-group">
                <label className="sa-label">Tipografía (Fuente)</label>
                <select value={localTheme.fontFamily} onChange={e => setLocalTheme({...localTheme, fontFamily: e.target.value})} className="sa-select">
                  <option value="Inter">Inter (Por defecto)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="system-ui">System UI</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
            </div>
            <button onClick={() => setLocalTheme({ background: '#050b14', card: '#090f1d', border: '#16223f', primary: '#3b82f6', text: '#ffffff', fontFamily: 'Inter' })} className="sa-btn sa-btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
              Restaurar Original
            </button>
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
