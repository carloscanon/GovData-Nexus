'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { 
  Zap, 
  Search, 
  Calendar, 
  Clock, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  BrainCircuit, 
  ArrowUpRight 
} from 'lucide-react';

const initialScans = [
  { id: '1', date: '2026-05-19 11:32', source: 'PostgreSQL - Bancolombia Prod', duration: '4.2s', tables: 145, columns: 1204, classifications: 86, creditCost: 15, status: 'success' },
  { id: '2', date: '2026-05-19 10:15', source: 'MySQL - Banco Central Central', duration: '8.5s', tables: 320, columns: 4108, classifications: 232, creditCost: 35, status: 'success' },
  { id: '3', date: '2026-05-19 09:02', source: 'Redshift - MinSalud Clinica', duration: '12.1s', tables: 54, columns: 860, classifications: 45, creditCost: 10, status: 'success' },
  { id: '4', date: '2026-05-18 23:40', source: 'PostgreSQL - Bancolombia Dev', duration: '1.8s', tables: 24, columns: 180, classifications: 12, creditCost: 2, status: 'success' },
  { id: '5', date: '2026-05-18 20:10', source: 'Snowflake - MinSalud Stats', duration: '25.4s', tables: 580, columns: 8750, classifications: 620, creditCost: 80, status: 'failed', error: 'Database timeout exceeded' },
];

export default function SaaSAutomaticScansPage() {
  const { currentTenant } = usePlatform();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="sa-title-area">
        <div>
          <h1 className="sa-title">Escaneos Automáticos</h1>
          <p className="sa-subtitle">Bitácora global de ejecuciones de escaneo inteligente de metadatos y clasificaciones IA.</p>
        </div>
        <span className="sa-badge sa-badge-blue">
          Escáner Agentic Core v2.4
        </span>
      </div>

      {/* Scans Registry Search */}
      <div className="sa-filter-bar" style={{ gridTemplateColumns: '1fr' }}>
        <div className="sa-search-wrapper">
          <Search className="sa-search-icon" />
          <input
            type="text"
            placeholder="Buscar escaneo por fuente de datos, cliente o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sa-search-input"
          />
        </div>
      </div>

      {/* Scans Registry Table */}
      <div className="sa-card-panel">
        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Fuente de Datos</th>
                <th>Duración</th>
                <th>Dimensiones</th>
                <th>Clasificaciones IA</th>
                <th>Créditos</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {initialScans.map((scan) => (
                <tr key={scan.id}>
                  <td style={{ fontFamily: 'monospace' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{scan.date}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Database className="w-4 h-4 text-blue-400" />
                      <span>{scan.source}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'monospace' }}>
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{scan.duration}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{scan.tables}</span> t / <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{scan.columns} col</span>
                  </td>
                  <td>
                    <span className="sa-badge sa-badge-green">
                      <BrainCircuit className="w-3.5 h-3.5" style={{ marginRight: '0.25rem' }} />
                      {scan.classifications}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                    {scan.creditCost} cr
                  </td>
                  <td>
                    {scan.status === 'success' ? (
                      <span className="sa-badge sa-badge-green">Completado</span>
                    ) : (
                      <span className="sa-badge sa-badge-red" title={scan.error}>Error</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="sa-btn sa-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', marginLeft: 'auto' }}>
                      <span>Ver logs</span>
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
