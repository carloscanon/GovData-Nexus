"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Simple modal component
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', minWidth: '300px' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newModules, setNewModules] = useState<string>(''); // comma separated list
  const [error, setError] = useState<string>('');

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

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async () => {
    setError('');
    const modulesArray = newModules.split(',').map(m => m.trim()).filter(Boolean);
    const payload = { name: newName, description: newDesc, modules: modulesArray };
    const res = await fetch('/api/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      setShowCreate(false);
      setNewName(''); setNewDesc(''); setNewModules('');
      fetchRoles();
    } else {
      const err = await res.json();
      setError(err.error || 'Error creating role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este rol?')) return;
    const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
    if (res.ok) fetchRoles();
  };

  const handleAssign = async (roleId: string) => {
    const userId = prompt('Ingrese el ID de usuario a asignar (UID de Supabase)');
    if (!userId) return;
    const res = await fetch(`/api/users/${userId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIds: [roleId] })
    });
    if (!res.ok) alert('Asignación falló'); else alert('Asignado');
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '16px' }}>Gestión de Roles</h1>
      {loading ? <p>Cargando…</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Nombre</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Descripción</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Módulos</th>
              <th style={{ borderBottom: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.id}>
                <td style={{ padding: '8px' }}>{r.name}</td>
                <td style={{ padding: '8px' }}>{r.description || ''}</td>
                <td style={{ padding: '8px' }}>{r.modules?.join(', ')}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button onClick={() => handleAssign(r.id)} style={{ marginRight: '8px' }}>Asignar</button>
                  <button onClick={() => handleDelete(r.id)} style={{ marginRight: '8px', color: 'red' }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => setShowCreate(true)} style={{ marginTop: '16px' }}>Crear Nuevo Rol</button>

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h2>Nuevo Rol</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div>
            <label>Nombre:<br />
              <input value={newName} onChange={e => setNewName(e.target.value)} /></label>
          </div>
          <div>
            <label>Descripción:<br />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} /></label>
          </div>
          <div>
            <label>Módulos (coma separada):<br />
              <input value={newModules} onChange={e => setNewModules(e.target.value)} placeholder="catalog,security" /></label>
          </div>
          <button onClick={handleCreate}>Crear</button>
          <button onClick={() => setShowCreate(false)} style={{ marginLeft: '8px' }}>Cancelar</button>
        </Modal>
      )}
    </div>
  );
}
