'use client';

import React, { useState } from 'react';
import { 
  Ticket, 
  Search, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react';

const initialTickets = [
  { id: 'TCK-201', tenant: 'Bancolombia', subject: 'Error al escanear vistas materializadas', priority: 'Alta', sla: '4 horas', status: 'Abierto', assignee: 'Sofia Martínez', created: '2026-05-19 10:30' },
  { id: 'TCK-200', tenant: 'Banco Central', subject: 'Solicitud de ampliación de storage', priority: 'Media', sla: '12 horas', status: 'En Progreso', assignee: 'Mateo Gómez', created: '2026-05-19 08:15' },
  { id: 'TCK-199', tenant: 'Ministerio de Salud', subject: 'Problema de enmascaramiento con RUT', priority: 'Crítica', sla: '1 hora', status: 'Abierto', assignee: 'Alejandro Ruiz', created: '2026-05-19 07:45' },
  { id: 'TCK-198', tenant: 'Gobierno de la Ciudad', subject: 'Consulta sobre linaje en Spark', priority: 'Baja', sla: '24 horas', status: 'Resuelto', assignee: 'Sofia Martínez', created: '2026-05-18 16:20' },
];

export default function SaaSSupportTicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="sa-title-area">
        <div>
          <h1 className="sa-title">Soporte Multiempresa</h1>
          <p className="sa-subtitle">Gestión de tickets, atención a clientes SaaS y supervisión de acuerdos de nivel de servicio (SLA).</p>
        </div>
        <button className="sa-btn sa-btn-primary">
          <Plus className="w-5 h-5" />
          <span>Crear Ticket</span>
        </button>
      </div>

      {/* SLA Alert banner */}
      <div className="sa-widget-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#ffffff', fontSize: '0.875rem' }}>Alerta de SLA Activa</p>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.15rem' }}>Hay 1 ticket crítico (TCK-199) por vencer SLA en los próximos 15 minutos.</p>
          </div>
        </div>
        <button className="sa-btn sa-btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
          Atender Ahora
        </button>
      </div>

      {/* Tickets List */}
      <div className="sa-card-panel">
        <h3 className="sa-panel-title" style={{ marginBottom: '1.5rem' }}>Bandeja de Tickets Global</h3>
        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Cliente</th>
                <th>Asunto</th>
                <th>Prioridad / SLA</th>
                <th>Asignado a</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {initialTickets.map((tck) => (
                <tr key={tck.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6' }}>{tck.id}</td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{tck.tenant}</td>
                  <td>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, color: '#f8fafc' }}>{tck.subject}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Creado el {tck.created}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`sa-badge ${
                        tck.priority === 'Crítica' ? 'sa-badge-red' :
                        tck.priority === 'Alta' ? 'sa-badge-amber' : 'sa-badge-blue'
                      }`}>
                        {tck.priority}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SLA: {tck.sla}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{tck.assignee}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`sa-badge ${
                      tck.status === 'Resuelto' ? 'sa-badge-green' :
                      tck.status === 'En Progreso' ? 'sa-badge-blue' : 'sa-badge-red'
                    }`}>
                      {tck.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="sa-btn sa-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', marginLeft: 'auto' }}>
                      <span>Responder</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
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
