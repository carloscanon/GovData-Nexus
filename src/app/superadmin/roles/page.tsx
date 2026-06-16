"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TENANT_MODULES } from '@/lib/moduleRegistry';
import { Plus, Trash2, UserPlus, Shield, CheckSquare, Square } from 'lucide-react';

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '16px',
          minWidth: '520px',
          maxWidth: '640px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          color: '#f8fafc',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Module Checklist ─────────────────────────────────────────────────────────
function ModuleChecklist({
  selected,
  onChange
}: {
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const selectAll = () => onChange(TENANT_MODULES.map(m => m.key));
  const clearAll  = () => onChange([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
          {selected.length} de {TENANT_MODULES.length} módulos seleccionados
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={selectAll}
            style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Todos
          </button>
          <span style={{ color: '#334155' }}>|</span>
          <button
            type="button"
            onClick={clearAll}
            style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Ninguno
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '4px 2px'
      }}>
        {TENANT_MODULES.map(mod => {
          const isChecked = selected.includes(mod.key);
          return (
            <button
              key={mod.key}
              type="button"
              onClick={() => toggle(mod.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: `1px solid ${isChecked ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                background: isChecked ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                color: isChecked ? '#93c5fd' : '#94a3b8'
              }}
            >
              {isChecked
                ? <CheckSquare size={16} style={{ flexShrink: 0, color: '#3b82f6' }} />
                : <Square size={16} style={{ flexShrink: 0 }} />
              }
              <span style={{ fontSize: '0.8rem', fontWeight: isChecked ? 600 : 400, lineHeight: 1.2 }}>
                {mod.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const [roles, setRoles]           = useState<Array<any>>([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [newDesc, setNewDesc]       = useState('');
  const [newModules, setNewModules] = useState<string[]>([]);
  const [error, setError]           = useState('');
  const [toast, setToast]           = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRoles = async () => {
    setLoading(true);
    const res = await fetch('/api/roles');
    if (res.ok) {
      const data = await res.json();
      setRoles(data);
    } else {
      console.error('Failed to fetch roles');
    }
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleCreate = async () => {
    setError('');
    if (!newName.trim()) { setError('El nombre del rol es obligatorio.'); return; }
    const payload = { name: newName.trim(), description: newDesc.trim(), modules: newModules };
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setShowCreate(false);
      setNewName(''); setNewDesc(''); setNewModules([]);
      await fetchRoles();
      showToast('✅ Rol creado correctamente');
    } else {
      const err = await res.json();
      setError(err.error || 'Error al crear el rol');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este rol? Esta acción no se puede deshacer.')) return;
    const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
    if (res.ok) { await fetchRoles(); showToast('🗑️ Rol eliminado'); }
  };

  const handleAssign = async (roleId: string) => {
    const userId = prompt('Ingrese el ID de usuario a asignar (UID de Supabase)');
    if (!userId) return;
    const res = await fetch(`/api/users/${userId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIds: [roleId] })
    });
    if (!res.ok) showToast('⚠️ Asignación fallida');
    else showToast('✅ Rol asignado al usuario');
  };

  return (
    <div style={{ padding: '2rem', color: '#cbd5e1', fontFamily: 'Inter, sans-serif' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: '#10b981', color: '#fff',
          padding: '1rem 1.5rem', borderRadius: '12px',
          zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontWeight: 600
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={28} style={{ color: '#3b82f6' }} />
            Gestión de Roles
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Crea y gestiona roles con acceso granular a módulos específicos.
            Los módulos disponibles se sincronizan automáticamente con el sistema.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            border: 'none', borderRadius: '10px',
            color: '#fff', fontWeight: 700, cursor: 'pointer',
            fontSize: '0.9rem', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
          }}
        >
          <Plus size={18} /> Crear Rol
        </button>
      </div>

      {/* Roles Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>Cargando roles…</div>
      ) : roles.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.08)',
          color: '#475569'
        }}>
          <Shield size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>Sin roles configurados</p>
          <p style={{ fontSize: '0.85rem' }}>Crea el primer rol para gestionar accesos granulares por módulo.</p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rol</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Módulos</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: i < roles.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>{r.name}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {r.description || <em style={{ color: '#334155' }}>Sin descripción</em>}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(r.modules || []).length === 0
                        ? <em style={{ color: '#334155', fontSize: '0.8rem' }}>Sin módulos</em>
                        : (r.modules as string[]).map(m => (
                            <span
                              key={m}
                              style={{
                                padding: '2px 10px', borderRadius: '20px',
                                background: 'rgba(59,130,246,0.12)',
                                border: '1px solid rgba(59,130,246,0.25)',
                                color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600
                              }}
                            >
                              {TENANT_MODULES.find(mod => mod.key === m)?.label ?? m}
                            </span>
                          ))
                      }
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleAssign(r.id)}
                        title="Asignar usuario"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '6px 12px', borderRadius: '8px',
                          border: '1px solid rgba(99,102,241,0.4)',
                          background: 'rgba(99,102,241,0.1)',
                          color: '#a5b4fc', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                        }}
                      >
                        <UserPlus size={14} /> Asignar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        title="Eliminar rol"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '6px 12px', borderRadius: '8px',
                          border: '1px solid rgba(239,68,68,0.3)',
                          background: 'rgba(239,68,68,0.08)',
                          color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                        }}
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} style={{ color: '#3b82f6' }} />
            Nuevo Rol
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>
            Define las propiedades del rol y selecciona los módulos a los que tendrá acceso.
          </p>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', marginBottom: '16px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nombre del Rol *
              </label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="ej. Analista de Datos"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#f8fafc',
                  outline: 'none', fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Descripción
              </label>
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Breve descripción del rol y sus responsabilidades"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#f8fafc',
                  outline: 'none', fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Módulos con Acceso
              </label>
              {/* ✅ Dynamic checklist — auto-updates when new modules are added to moduleRegistry.ts */}
              <ModuleChecklist selected={newModules} onChange={setNewModules} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowCreate(false)}
              style={{
                padding: '10px 20px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#94a3b8',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              style={{
                padding: '10px 24px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none', color: '#fff',
                cursor: 'pointer', fontWeight: 700,
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}
            >
              Crear Rol
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
