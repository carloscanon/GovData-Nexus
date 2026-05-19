'use client';

import React from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { 
  Gauge, 
  Users, 
  HardDrive, 
  Cpu, 
  Zap, 
  LayoutDashboard, 
  Globe, 
  ArrowUpRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const usageData = [
  { name: 'Bancolombia', scans: 840, users: 145, storage: 124, api: 450000, iaCredits: 850 },
  { name: 'Banco Central', scans: 620, users: 320, storage: 84, api: 380000, iaCredits: 620 },
  { name: 'Ministerio de Salud', scans: 310, users: 56, storage: 12, api: 180000, iaCredits: 210 },
  { name: 'Gov de la Ciudad', scans: 290, users: 42, storage: 42, api: 120000, iaCredits: 180 },
];

export default function SaaSUsageControlPage() {
  const { currentTenant } = usePlatform();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 className="sa-title">Control de Consumo y Recursos</h1>
        <p className="sa-subtitle">Supervisa y limita el uso de recursos computacionales, almacenamiento y créditos de IA por empresa.</p>
      </div>

      {/* Global Resource Allocation summary */}
      <div className="sa-widget-grid">
        <div className="sa-widget-card">
          <div className="sa-widget-header">
            <div>
              <p className="sa-widget-label">Créditos de Escaneo Consumidos</p>
              <h3 className="sa-widget-value">2,060</h3>
            </div>
            <div className="sa-widget-icon-container">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div style={{ width: '100%', backgroundColor: '#1e293b', borderRadius: '9999px', height: '6px', marginTop: '1rem' }}>
            <div style={{ backgroundColor: '#3b82f6', height: '6px', borderRadius: '9999px', width: '41.2%' }}></div>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', display: 'block' }}>Límite global reservado: 5,000 escaneos</span>
        </div>

        <div className="sa-widget-card">
          <div className="sa-widget-header">
            <div>
              <p className="sa-widget-label">Almacenamiento Total Usado</p>
              <h3 className="sa-widget-value">262 GB</h3>
            </div>
            <div className="sa-widget-icon-container purple">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div style={{ width: '100%', backgroundColor: '#1e293b', borderRadius: '9999px', height: '6px', marginTop: '1rem' }}>
            <div style={{ backgroundColor: '#6366f1', height: '6px', borderRadius: '9999px', width: '52.4%' }}></div>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', display: 'block' }}>Capacidad del host actual: 500 GB</span>
        </div>

        <div className="sa-widget-card">
          <div className="sa-widget-header">
            <div>
              <p className="sa-widget-label">Créditos de Procesamiento IA</p>
              <h3 className="sa-widget-value">1,860 tokens</h3>
            </div>
            <div className="sa-widget-icon-container green">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div style={{ width: '100%', backgroundColor: '#1e293b', borderRadius: '9999px', height: '6px', marginTop: '1rem' }}>
            <div style={{ backgroundColor: '#10b981', height: '6px', borderRadius: '9999px', width: '37.2%' }}></div>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', display: 'block' }}>Uso del plan de APIs OpenRouter/DeepSeek</span>
        </div>
      </div>

      {/* Consumption Chart per Tenant */}
      <div className="sa-card-panel">
        <h3 className="sa-panel-title" style={{ marginBottom: '1.5rem' }}>Comparativa de Escaneos por Empresa</h3>
        <div className="h-80" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#16223f" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#090f1d', borderColor: '#16223f', color: '#f8fafc', borderRadius: '12px'}}
              />
              <Bar dataKey="scans" name="Escaneos Ejecutados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage limits matrix table */}
      <div className="sa-card-panel">
        <div className="sa-panel-header">
          <h3 className="sa-panel-title">Consumo y Límites Detallados</h3>
        </div>
        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Llamadas API / Límite</th>
                <th>Créditos IA</th>
                <th>Usuarios Activos / Límite</th>
                <th style={{ textAlign: 'right' }}>Uso Almacenamiento</th>
              </tr>
            </thead>
            <tbody>
              {usageData.map((client) => (
                <tr key={client.name}>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{client.name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{(client.api / 1000).toFixed(0)}k / 1M</td>
                  <td style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 600 }}>{client.iaCredits} cr</td>
                  <td>{client.users} / 500</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#6366f1' }}>{client.storage} GB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
