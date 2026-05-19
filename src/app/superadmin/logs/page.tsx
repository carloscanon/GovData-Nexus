'use client';

import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Clock, 
  RefreshCw
} from 'lucide-react';

const initialLogs = [
  { id: '1', date: '2026-05-19 11:45:02', user: 'carlos.director@bancolombia.com', tenant: 'Bancolombia', action: 'Exportó Reporte de Calidad', module: 'Calidad', ip: '186.116.14.82' },
  { id: '2', date: '2026-05-19 11:32:10', user: 'admin.global@govdata.com', tenant: 'SuperAdmin', action: 'Activó Módulo de Flujos a Bancolombia', module: 'Config', ip: '190.143.2.11' },
  { id: '3', date: '2026-05-19 10:15:30', user: 'maria.analista@bcentral.gov.co', tenant: 'Banco Central', action: 'Ejecutó Escaneo Automático DB', module: 'Catálogo', ip: '200.41.98.5' },
  { id: '4', date: '2026-05-19 09:02:18', user: 'soporte@govdata.com', tenant: 'SuperAdmin', action: 'Accedió en Modo Impersonación a MinSalud', module: 'Soporte', ip: '190.143.2.11' },
  { id: '5', date: '2026-05-19 08:30:15', user: 'juan.medico@minsalud.gov.co', tenant: 'Ministerio de Salud', action: 'Actualizó Regla de Validación R-204', module: 'Calidad', ip: '181.134.45.92' },
];

export default function SaaSLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="sa-title-area">
        <div>
          <h1 className="sa-title">Logs de Auditoría</h1>
          <p className="sa-subtitle">Historial detallado de todas las acciones críticas ejecutadas por usuarios en sus respectivos tenants.</p>
        </div>
        <button 
          className="sa-btn sa-btn-secondary"
          style={{ padding: '0.6rem' }}
          title="Refrescar logs"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Logs Search */}
      <div className="sa-filter-bar" style={{ gridTemplateColumns: '1fr' }}>
        <div className="sa-search-wrapper">
          <Search className="sa-search-icon" />
          <input
            type="text"
            placeholder="Buscar logs por usuario, acción, módulo o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sa-search-input"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="sa-card-panel">
        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Empresa</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th style={{ textAlign: 'right' }}>Dirección IP</th>
              </tr>
            </thead>
            <tbody>
              {initialLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'monospace' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{log.date}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{log.tenant}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{log.user}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: '#f8fafc' }}>{log.action}</td>
                  <td>
                    <span className="sa-badge sa-badge-blue">
                      {log.module}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
