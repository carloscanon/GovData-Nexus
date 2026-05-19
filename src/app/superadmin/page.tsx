'use client';

import React from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { 
  Building2, 
  DollarSign, 
  Zap, 
  AlertTriangle, 
  HardDrive, 
  TrendingUp, 
  Users, 
  Activity,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function SaaSDashboard() {
  const { tenants } = usePlatform();

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dynamic calculations based on real platform state
  const activeTenantsCount = tenants.length;
  
  // Calculate total monthly recurring revenue (MRR) dynamically
  const totalMrr = tenants.reduce((acc, t) => {
    // Parse values like "$5,000" or "$300"
    const cost = parseInt(t.monthlyCost.replace(/[^0-9]/g, ''), 10) || 0;
    return acc + cost;
  }, 0);

  if (!isMounted) return null;

  // Dynamic top clients derived from real tenant list
  const dynamicTopClients = tenants.map((t, idx) => {
    // Standard mock metrics for scans & storage based on plan type
    let scans = 840;
    let storage = '124 GB';
    if (t.plan === 'Professional') {
      scans = 310;
      storage = '12.8 GB';
    } else if (t.plan === 'Starter') {
      scans = 45;
      storage = '1.2 GB';
    }
    return {
      rank: idx + 1,
      name: t.name,
      plan: t.plan,
      escaneos: scans,
      storage: storage,
      mrr: t.monthlyCost
    };
  });

  const financialData = [
    { name: 'Ene', MRR: Math.round(totalMrr * 0.6), ARR: Math.round(totalMrr * 0.6 * 12), Churn: 2.1 },
    { name: 'Feb', MRR: Math.round(totalMrr * 0.7), ARR: Math.round(totalMrr * 0.7 * 12), Churn: 1.8 },
    { name: 'Mar', MRR: Math.round(totalMrr * 0.8), ARR: Math.round(totalMrr * 0.8 * 12), Churn: 1.9 },
    { name: 'Abr', MRR: Math.round(totalMrr * 0.9), ARR: Math.round(totalMrr * 0.9 * 12), Churn: 1.5 },
    { name: 'May', MRR: totalMrr, ARR: totalMrr * 12, Churn: 1.1 },
  ];

  const infraUsageData = [
    { name: 'Lun', cpu: 32, ram: 45, db: 55 },
    { name: 'Mar', cpu: 38, ram: 48, db: 56 },
    { name: 'Mié', cpu: 45, ram: 52, db: 58 },
    { name: 'Jue', cpu: 42, ram: 50, db: 58 },
    { name: 'Vie', cpu: 58, ram: 65, db: 60 },
    { name: 'Sáb', cpu: 28, ram: 40, db: 61 },
    { name: 'Dom', cpu: 25, ram: 38, db: 61 },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header section */}
      <div className="sa-title-area">
        <div>
          <h1 className="sa-title">Dashboard SaaS Maestro</h1>
          <p className="sa-subtitle">Supervisión en tiempo real de ingresos, consumo de recursos e infraestructura.</p>
        </div>
        <span className="sa-badge sa-badge-green">
          Infraestructura: Óptima
        </span>
      </div>

      {/* Metric Cards (10 Core SaaS & Finance Widgets) */}
      <div className="sa-widget-grid">
        {/* Empresas Activas */}
        <div className="sa-widget-card">
          <div className="sa-widget-header">
            <div>
              <p className="sa-widget-label">Empresas Activas</p>
              <h3 className="sa-widget-value">{activeTenantsCount}</h3>
            </div>
            <div className="sa-widget-icon-container">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="sa-widget-trend sa-trend-up">
            <TrendingUp className="w-4 h-4" style={{ marginRight: '0.25rem' }} />
            <span>+12% vs mes anterior</span>
          </div>
        </div>

        {/* Ingresos Mensuales (MRR) */}
        <div className="sa-widget-card">
          <div className="sa-widget-header">
            <div>
              <p className="sa-widget-label">Ingresos Mensuales (MRR)</p>
              <h3 className="sa-widget-value">${totalMrr.toLocaleString()}</h3>
            </div>
            <div className="sa-widget-icon-container green">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="sa-widget-trend sa-trend-up">
            <TrendingUp className="w-4 h-4" style={{ marginRight: '0.25rem' }} />
            <span>+15% este trimestre</span>
          </div>
        </div>

        {/* Escaneos Hoy */}
        <div className="sa-widget-card">
          <div className="sa-widget-header">
            <div>
              <p className="sa-widget-label">Escaneos Hoy</p>
              <h3 className="sa-widget-value">{activeTenantsCount * 230}</h3>
            </div>
            <div className="sa-widget-icon-container purple">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="sa-widget-trend sa-trend-up" style={{ color: '#818cf8' }}>
            <Activity className="w-4 h-4" style={{ marginRight: '0.25rem' }} />
            <span>{activeTenantsCount * 2} activos en cola</span>
          </div>
        </div>

        {/* Clientes por Vencer */}
        <div className="sa-widget-card">
          <div className="sa-widget-header">
            <div>
              <p className="sa-widget-label">Clientes por Vencer</p>
              <h3 className="sa-widget-value">2</h3>
            </div>
            <div className="sa-widget-icon-container amber">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="sa-widget-trend sa-trend-down" style={{ color: '#fbbf24' }}>
            <span>Renovación en 7 días</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics row */}
      <div className="sa-stat-row">
        <div className="sa-stat-panel">
          <div>
            <p className="sa-stat-panel-label">Anual Recurring Revenue (ARR)</p>
            <h4 className="sa-stat-panel-value">${(totalMrr * 12).toLocaleString()}</h4>
          </div>
          <span className="sa-badge sa-badge-blue">Proyectado</span>
        </div>

        <div className="sa-stat-panel">
          <div>
            <p className="sa-stat-panel-label">Churn Rate (Pérdida)</p>
            <h4 className="sa-stat-panel-value" style={{ color: '#10b981' }}>0.8%</h4>
          </div>
          <div className="sa-widget-trend sa-trend-up" style={{ marginTop: 0 }}>
            <TrendingDown className="w-4 h-4" style={{ marginRight: '0.25rem', color: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>-0.4%</span>
          </div>
        </div>

        <div className="sa-stat-panel">
          <div>
            <p className="sa-stat-panel-label">Uso de Infraestructura</p>
            <h4 className="sa-stat-panel-value">38.4%</h4>
          </div>
          <span className="sa-badge sa-badge-blue">2.4 TB libres</span>
        </div>
      </div>

      {/* Financial Growth Charts & Infrastructure Resource Usage */}
      <div className="sa-card-grid">
        {/* MRR Growth Area Chart */}
        <div className="sa-card">
          <div className="sa-panel-header">
            <div>
              <h3 className="sa-panel-title">Crecimiento Mensual MRR</h3>
              <p className="sa-table-meta-text">Evolución de ingresos recurrentes y ARR</p>
            </div>
            <span className="sa-badge sa-badge-green">+${Math.round(totalMrr * 0.4).toLocaleString()} este año</span>
          </div>
          <div className="h-80" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#16223f" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{backgroundColor: '#090f1d', borderColor: '#16223f', color: '#f8fafc', borderRadius: '12px'}}
                />
                <Area type="monotone" dataKey="MRR" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Infrastructure Usage */}
        <div className="sa-card">
          <div className="sa-panel-header">
            <div>
              <h3 className="sa-panel-title">Consumo de Infraestructura</h3>
              <p className="sa-table-meta-text">Cómputo en la nube y consumo de Base de Datos</p>
            </div>
            <span className="sa-badge sa-badge-blue">Actualizado hace 2m</span>
          </div>
          <div className="h-80" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={infraUsageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#16223f" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip 
                  contentStyle={{backgroundColor: '#090f1d', borderColor: '#16223f', color: '#f8fafc', borderRadius: '12px'}}
                />
                <Line type="monotone" dataKey="cpu" name="CPU" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="ram" name="RAM" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="db" name="Database" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom section: Top clients & billing reminders */}
      <div className="sa-card-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Top Clientes Table */}
        <div className="sa-card-panel" style={{ marginBottom: 0 }}>
          <div className="sa-panel-header">
            <h3 className="sa-panel-title">Clientes Activos y Consumos</h3>
            <button className="sa-btn sa-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              <span>Ver todas</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="sa-table-container">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Plan</th>
                  <th>Escaneos (Mes)</th>
                  <th>Almacenamiento</th>
                  <th style={{ textAlign: 'right' }}>Suscripción</th>
                </tr>
              </thead>
              <tbody>
                {dynamicTopClients.map((client, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>{client.name}</td>
                    <td>
                      <span className={`sa-badge ${
                        client.plan === 'Enterprise' ? 'sa-badge-blue' :
                        client.plan === 'Professional' ? 'sa-badge-green' : 'sa-badge-amber'
                      }`}>
                        {client.plan}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{client.escaneos} / {client.plan === 'Enterprise' ? 'Ilimitado' : client.plan === 'Professional' ? '500' : '100'}</td>
                    <td>{client.storage}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{client.mrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Churn & Subscriptions Status Summary */}
        <div className="sa-card">
          <div>
            <h3 className="sa-panel-title" style={{ marginBottom: '1.5rem' }}>Estado de Renovaciones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="sa-stat-panel" style={{ border: '1px solid #16223f' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Suscripciones al Día</span>
                <span className="sa-badge sa-badge-green">{activeTenantsCount}</span>
              </div>
              <div className="sa-stat-panel" style={{ border: '1px solid #16223f' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>En Periodo de Gracia</span>
                <span className="sa-badge sa-badge-amber">0</span>
              </div>
              <div className="sa-stat-panel" style={{ border: '1px solid #16223f' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Retención de Clientes</span>
                <span className="sa-badge sa-badge-blue">100%</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', borderTop: '1px solid #16223f', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <span>Próxima facturación: 01 de Jun</span>
              <span>MRR Proyectado: ${(totalMrr * 1.1).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
