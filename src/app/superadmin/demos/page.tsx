'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Briefcase, 
  Calendar,
  Search,
  RefreshCw,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoRequest {
  id: string;
  organization: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export default function DemoRequestsReport() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching demo requests:', err);
      setError(err.message || 'Error al obtener las solicitudes de demo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleExportCSV = () => {
    if (requests.length === 0) return;
    
    const headers = ['ID', 'Organización', 'Nombre', 'Correo', 'Teléfono', 'Cargo', 'Fecha de Registro'];
    const csvRows = [
      headers.join(','),
      ...requests.map(r => [
        r.id,
        `"${r.organization.replace(/"/g, '""')}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.email.replace(/"/g, '""')}"`,
        `"${r.phone.replace(/"/g, '""')}"`,
        `"${r.role.replace(/"/g, '""')}"`,
        new Date(r.created_at).toLocaleString()
      ].join(','))
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `solicitudes_demo_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRequests = requests.filter(req => 
    req.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sa-card" style={{ padding: '24px', backgroundColor: 'var(--sa-card)', border: '1px solid var(--sa-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--sa-text)' }}>Solicitudes de Demostración</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>Visualiza y gestiona las solicitudes de demo enviadas desde el portal de login</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchRequests} 
            className="sa-btn sa-btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button 
            onClick={handleExportCSV} 
            className="sa-btn sa-btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}
            disabled={filteredRequests.length === 0}
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Filter and search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: 'var(--sa-background)', padding: '12px', borderRadius: '12px', border: '1px solid var(--sa-border)' }}>
        <Search size={18} style={{ color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Buscar por organización, nombre, correo o cargo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', color: 'var(--sa-text)' }}
        />
      </div>

      {/* Table view */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
          Cargando solicitudes...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
          {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay solicitudes de demo registradas aún.'}
        </div>
      ) : (
        <div className="sa-table-container" style={{ overflowX: 'auto', border: '1px solid var(--sa-border)', borderRadius: '12px', backgroundColor: 'var(--sa-background)' }}>
          <table className="sa-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--sa-border)', background: 'var(--sa-card)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>ORGANIZACIÓN</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>CONTACTO</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>CORREO</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>TELÉFONO</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>CARGO</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>FECHA REGISTRO</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--sa-border)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--sa-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} style={{ color: 'var(--sa-primary)' }} />
                      {req.organization}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} style={{ color: '#94a3b8' }} />
                      {req.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} style={{ color: '#94a3b8' }} />
                      <a href={`mailto:${req.email}`} style={{ color: 'var(--sa-primary)', textDecoration: 'none' }}>
                        {req.email}
                      </a>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} style={{ color: '#94a3b8' }} />
                      {req.phone}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={16} style={{ color: '#94a3b8' }} />
                      {req.role}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} style={{ color: '#64748b' }} />
                      {new Date(req.created_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
