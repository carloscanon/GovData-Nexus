'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  User, 
  Clock, 
  RefreshCw, 
  Activity, 
  ShieldAlert, 
  Network, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Download,
  Info,
  Calendar,
  Globe,
  Settings,
  Eye,
  Sliders,
  Laptop
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import * as XLSX from 'xlsx';

export default function CentralizedAuditPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'connections' | 'activity' | 'alerts' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [tenantFilter, setTenantFilter] = useState('all');
  
  // Data State
  const [tenants, setTenants] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [settings, setSettings] = useState({ retention_days: 8 });
  const [stats, setStats] = useState<any>({
    activeSessionsCount: 0,
    connectedTodayUsers: 0,
    active7dUsers: 0,
    totalAlertsCount: 0,
    unresolvedAlertsCount: 0,
    suspiciousAccessCount: 0,
    companyRankings: []
  });

  // UI Filters
  const [userSearch, setUserSearch] = useState('');
  const [ipSearch, setIpSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Interactive Modals
  const [selectedDiffLog, setSelectedDiffLog] = useState<any>(null);

  const fetchAuditData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/superadmin/audit?tenant_id=${tenantFilter}`);
      const data = await res.json();
      if (data.success && data.data) {
        setConnections(data.data.connections || []);
        setLogs(data.data.logs || []);
        setAlerts(data.data.alerts || []);
        setSettings(data.data.settings || { retention_days: 8 });
        setTenants(data.data.tenants || []);
        setStats(data.data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantFilter]);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  // Actions
  const handleSaveSettings = async (days: number) => {
    try {
      const res = await fetch('/api/superadmin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', settings: { retention_days: days } })
      });
      const data = await res.json();
      if (data.success) {
        setSettings({ retention_days: days });
        alert(`✅ Política de retención actualizada a ${days} días. Purga automática ejecutada.`);
        fetchAuditData();
      } else {
        alert('❌ Error al guardar políticas de retención.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleForceLogout = async (sessionId: string) => {
    if (!confirm('¿Está seguro de forzar el cierre de sesión e invalidar el token de este usuario?')) return;
    try {
      const res = await fetch('/api/superadmin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'terminate_session', sessionId })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Sesión revocada exitosamente.');
        fetchAuditData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/superadmin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve_alert', alertId })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Alerta resuelta y archivada.');
        fetchAuditData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleManualPurge = async () => {
    if (!confirm('¿Ejecutar purga manual en caliente de registros expirados según la política de retención?')) return;
    try {
      const res = await fetch('/api/superadmin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_manual_purge' })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Purga de almacenamiento completada de manera exitosa.');
        fetchAuditData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Export Data Functions
  const exportToExcel = (type: 'connections' | 'activity') => {
    const dataToExport = type === 'connections' ? connections : logs;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'connections' ? 'Accesos' : 'Actividades');
    XLSX.writeFile(workbook, `auditoria_${type}_nexus.xlsx`);
  };

  const exportToCSV = (type: 'connections' | 'activity') => {
    const dataToExport = type === 'connections' ? connections : logs;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_${type}_nexus.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters application
  const filteredConnections = connections.filter(c => {
    const matchesUser = c.user_email.toLowerCase().includes(userSearch.toLowerCase()) || (c.user_name || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesIp = c.ip_address.toLowerCase().includes(ipSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    let matchesDate = true;
    if (dateStart) matchesDate = matchesDate && new Date(c.login_time) >= new Date(dateStart);
    if (dateEnd) matchesDate = matchesDate && new Date(c.login_time) <= new Date(dateEnd + 'T23:59:59');

    return matchesUser && matchesIp && matchesStatus && matchesDate;
  });

  const filteredLogs = logs.filter(l => {
    const matchesUser = l.user_email.toLowerCase().includes(userSearch.toLowerCase()) || (l.user_name || '').toLowerCase().includes(userSearch.toLowerCase()) || l.module.toLowerCase().includes(userSearch.toLowerCase()) || l.action.toLowerCase().includes(userSearch.toLowerCase());
    const matchesIp = l.ip_address.toLowerCase().includes(ipSearch.toLowerCase());
    
    let matchesDate = true;
    if (dateStart) matchesDate = matchesDate && new Date(l.created_at) >= new Date(dateStart);
    if (dateEnd) matchesDate = matchesDate && new Date(l.created_at) <= new Date(dateEnd + 'T23:59:59');

    return matchesUser && matchesIp && matchesDate;
  });

  // Recharts Data Prep
  const pieData = [
    { name: 'Críticas', value: alerts.filter(a => a.severity === 'critical').length, color: '#ef4444' },
    { name: 'Altas', value: alerts.filter(a => a.severity === 'high').length, color: '#f97316' },
    { name: 'Medias', value: alerts.filter(a => a.severity === 'medium').length, color: '#eab308' },
    { name: 'Bajas', value: alerts.filter(a => a.severity === 'low').length, color: '#3b82f6' }
  ].filter(p => p.value > 0);

  // Connection timelines last 7 days
  const timelineMap: Record<string, number> = {};
  connections.forEach(c => {
    const d = new Date(c.login_time).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    timelineMap[d] = (timelineMap[d] || 0) + 1;
  });
  const timelineData = Object.entries(timelineMap).map(([day, count]) => ({ day, conexiones: count })).reverse().slice(-7);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#0b0f19', color: '#cbd5e1', padding: '24px', borderRadius: '16px' }}>
      
      {/* SaaS Executive Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={28} color="#38bdf8" /> Centro de Auditoría Centralizada
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Monitoreo en tiempo real, trazabilidad inmutable y políticas de seguridad para el SuperAdministrador.
          </p>
        </div>

        {/* Global Tenant Filter Dropdown */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Empresa SaaS:</span>
          <select 
            value={tenantFilter} 
            onChange={(e) => setTenantFilter(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <option value="all">Todas las Empresas</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button 
            onClick={fetchAuditData}
            className="sa-btn sa-btn-secondary"
            style={{ padding: '8px', background: '#1e293b', border: '1px solid #334155' }}
            title="Sincronizar Datos"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Datadog style top KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Sesiones Activas</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>{stats.activeSessionsCount || 0}</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Conectadas en este instante</span>
        </div>
        <div style={{ padding: '16px', background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Usuarios Hoy</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>{stats.connectedTodayUsers || 0}</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Usuarios únicos últimos 24h</span>
        </div>
        <div style={{ padding: '16px', background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Activos (7 Días)</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a855f7', margin: '4px 0' }}>{stats.active7dUsers || 0}</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Usuarios con registros en el ciclo</span>
        </div>
        <div style={{ padding: '16px', background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Alertas de Seguridad</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: stats.unresolvedAlertsCount > 0 ? '#ef4444' : '#10b981', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {stats.unresolvedAlertsCount || 0} {stats.unresolvedAlertsCount > 0 && <ShieldAlert size={20} className="animate-pulse" />}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Acciones sospechosas sin resolver</span>
        </div>
        <div style={{ padding: '16px', background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Retención (Base de datos)</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', margin: '4px 0' }}>{settings.retention_days} Días</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Purga automática programada</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', gap: '8px' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          style={{ padding: '10px 20px', border: 'none', borderBottom: activeTab === 'overview' ? '3px solid #38bdf8' : '3px solid transparent', background: 'none', color: activeTab === 'overview' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'overview' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Activity size={16} /> Dashboard Analítico
        </button>
        <button 
          onClick={() => setActiveTab('connections')} 
          style={{ padding: '10px 20px', border: 'none', borderBottom: activeTab === 'connections' ? '3px solid #38bdf8' : '3px solid transparent', background: 'none', color: activeTab === 'connections' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'connections' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Network size={16} /> Registro de Conexiones
        </button>
        <button 
          onClick={() => setActiveTab('activity')} 
          style={{ padding: '10px 20px', border: 'none', borderBottom: activeTab === 'activity' ? '3px solid #38bdf8' : '3px solid transparent', background: 'none', color: activeTab === 'activity' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'activity' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Clock size={16} /> Actividades & Trazas
        </button>
        <button 
          onClick={() => setActiveTab('alerts')} 
          style={{ padding: '10px 20px', border: 'none', borderBottom: activeTab === 'alerts' ? '3px solid #38bdf8' : '3px solid transparent', background: 'none', color: activeTab === 'alerts' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'alerts' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ShieldAlert size={16} /> Alertas de Seguridad
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          style={{ padding: '10px 20px', border: 'none', borderBottom: activeTab === 'settings' ? '3px solid #38bdf8' : '3px solid transparent', background: 'none', color: activeTab === 'settings' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'settings' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Settings size={16} /> Políticas de Retención
        </button>
      </div>

      {/* Overview Tab (executive visuals) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Connection timeline graph */}
            <div style={{ background: '#111827', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="#38bdf8" /> Actividad de Accesos de Usuarios (Últimos 7 Días)
              </h3>
              {timelineData.length > 0 ? (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#475569" fontSize={11} />
                      <YAxis stroke="#475569" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="conexiones" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCon)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  Sin conexiones cargadas en el periodo.
                </div>
              )}
            </div>

            {/* Severity warnings pie chart */}
            <div style={{ background: '#111827', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#ef4444" /> Distribución de Gravedad de Alertas
              </h3>
              {pieData.length > 0 ? (
                <div style={{ width: '100%', height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  🟢 Excelente: Sin alertas registradas
                </div>
              )}
              {pieData.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: d.color }}></div>
                      <span>{d.name}: <strong>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Company ranking Bar Chart */}
            <div style={{ background: '#111827', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Laptop size={18} color="#a855f7" /> Empresas con Mayor Nivel de Actividad
              </h3>
              {stats.companyRankings && stats.companyRankings.length > 0 ? (
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.companyRankings.slice(0, 5)} layout="vertical">
                      <XAxis type="number" stroke="#475569" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={100} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={15} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  No se registran actividades para ranquear.
                </div>
              )}
            </div>

            {/* Critical warnings summary */}
            <div style={{ background: '#111827', border: '1px solid #1e293b', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#f59e0b" /> Alertas de Seguridad Críticas Recientes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '220px', flex: 1 }}>
                {alerts.filter(a => a.status === 'Abierta').slice(0, 3).map((a, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444', borderRadius: '0 8px 8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase' }}>
                        {a.alert_type} · {a.severity}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {new Date(a.created_at).toLocaleDateString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.4 }}>{a.description}</p>
                  </div>
                ))}
                {alerts.filter(a => a.status === 'Abierta').length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '0.9rem', gap: '6px' }}>
                    <CheckCircle size={18} /> Todo seguro: No hay alertas de seguridad pendientes.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Filter Toolbar for Logs and Connections */}
      {activeTab !== 'overview' && activeTab !== 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>Buscar Usuario / Módulo</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: '#475569' }} />
              <input 
                type="text"
                placeholder="Ej. Carlos..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 28px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>IP origen</label>
            <input 
              type="text"
              placeholder="Ej. 186.116..."
              value={ipSearch}
              onChange={e => setIpSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>
          {activeTab === 'connections' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>Estado de Sesión</label>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">Cualquiera</option>
                <option value="Activa">Activa</option>
                <option value="Cerrada">Cerrada</option>
                <option value="Forzada">Forzada</option>
                <option value="Expirada">Expirada</option>
              </select>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>Desde (Fecha)</label>
            <input 
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              style={{ width: '100%', padding: '7px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>Hasta (Fecha)</label>
            <input 
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              style={{ width: '100%', padding: '7px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button 
              onClick={() => {
                setUserSearch('');
                setIpSearch('');
                setStatusFilter('all');
                setDateStart('');
                setDateEnd('');
              }}
              style={{ padding: '8px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer', flex: 1 }}
            >
              Limpiar
            </button>
            <button 
              onClick={() => exportToExcel(activeTab === 'connections' ? 'connections' : 'activity')}
              style={{ padding: '8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Exportar Excel"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Connections List Tab */}
      {activeTab === 'connections' && (
        <div className="sa-card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sa-table-container">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Empresa</th>
                  <th>Fecha de Ingreso</th>
                  <th>Duración Sesión</th>
                  <th>Ubicación / IP</th>
                  <th>Dispositivo / OS</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredConnections.map((con) => {
                  const durationStr = con.session_duration 
                    ? (typeof con.session_duration === 'object' 
                      ? `${con.session_duration.hours || 0}h ${con.session_duration.minutes || 0}m` 
                      : con.session_duration) 
                    : con.status === 'Activa' 
                    ? 'Transcurriendo...' 
                    : 'Corto plazo';

                  return (
                    <tr key={con.id} style={{ background: con.is_suspicious ? 'rgba(239,68,68,0.02)' : undefined }}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#ffffff' }}>{con.user_name || 'Usuario SaaS'}</span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{con.user_email}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{tenants.find(t => t.id === con.tenant_id)?.name || 'Demo Corp'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {new Date(con.login_time).toLocaleString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{durationStr}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', color: '#fff' }}>{con.ip_address}</span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{con.city}, {con.country}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem' }}>{con.browser}</span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{con.os} ({con.device})</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '6px', 
                          fontSize: '0.7rem', 
                          fontWeight: 800,
                          background: con.status === 'Activa' ? '#f0fdf4' : con.status === 'Forzada' ? '#fef2f2' : '#f1f5f9',
                          color: con.status === 'Activa' ? '#10b981' : con.status === 'Forzada' ? '#ef4444' : '#64748b'
                        }}>
                          {con.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {con.status === 'Activa' ? (
                          <button 
                            onClick={() => handleForceLogout(con.id)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Revocar
                          </button>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '0.75rem' }}>Terminada</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredConnections.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>
                      No se encontraron conexiones que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Logs & visual Before/After Tab */}
      {activeTab === 'activity' && (
        <div className="sa-card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sa-table-container">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Módulo / Acción</th>
                  <th>Usuario</th>
                  <th>Empresa</th>
                  <th>IP origen</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Cambio (Diff)</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {new Date(log.created_at).toLocaleString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{log.action}</span>
                        <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>{log.module} · {log.functionality}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{log.user_name || 'Usuario'}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.user_email}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{tenants.find(t => t.id === log.tenant_id)?.name || 'Demo Corp'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.ip_address}</td>
                    <td>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        fontSize: '0.7rem', 
                        fontWeight: 800,
                        background: log.result === 'Success' ? '#f0fdf4' : '#fef2f2',
                        color: log.result === 'Success' ? '#10b981' : '#ef4444'
                      }}>
                        {log.result === 'Success' ? 'EXITOSO' : 'FALLIDO'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {log.old_values && Object.keys(log.old_values).length > 0 ? (
                        <button 
                          onClick={() => setSelectedDiffLog(log)}
                          style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#bae6fd', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> Ver Cambios
                        </button>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.75rem' }}>Sin Datos</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>
                      No se encontraron registros de actividades en el historial.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Alerts list Tab */}
      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.map((al) => (
            <div 
              key={al.id} 
              style={{ 
                padding: '20px', 
                background: '#111827', 
                border: '1px solid #1e293b', 
                borderLeft: `5px solid ${al.severity === 'critical' ? '#ef4444' : al.severity === 'high' ? '#f97316' : '#eab308'}`,
                borderRadius: '0 12px 12px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    background: al.severity === 'critical' ? '#fef2f2' : '#fffbeb', 
                    color: al.severity === 'critical' ? '#ef4444' : '#d97706',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}>
                    {al.severity}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                    {new Date(al.created_at).toLocaleString('es-CO')}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                    Empresa: {tenants.find(t => t.id === al.tenant_id)?.name || 'Demo Corp'}
                  </span>
                </div>
                <h4 style={{ margin: '6px 0', fontSize: '1rem', color: '#ffffff', fontWeight: 800 }}>{al.description}</h4>
                <div style={{ background: '#0b0f19', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1', border: '1px solid #1e293b', fontFamily: 'monospace', marginTop: '6px' }}>
                  Detalles del evento: {JSON.stringify(al.details)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', marginLeft: '20px' }}>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  background: al.status === 'Abierta' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: al.status === 'Abierta' ? '#eab308' : '#10b981'
                }}>
                  {al.status.toUpperCase()}
                </span>
                {al.status === 'Abierta' && (
                  <button 
                    onClick={() => handleResolveAlert(al.id)}
                    style={{ padding: '6px 12px', fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#a7f3d0', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
                  >
                    Resolver y Archivar
                  </button>
                )}
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#10b981', background: '#111827', border: '1px solid #1e293b', borderRadius: '12px' }}>
              🟢 Sin alertas ni anomalías registradas en la plataforma SaaS.
            </div>
          )}
        </div>
      )}

      {/* Retention Settings Tab */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
          
          <div style={{ background: '#111827', border: '1px solid #1e293b', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#f59e0b" /> Configurar Retención de Logs SaaS
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Determina el tiempo en días que los logs de conexión, actividades y auditorías críticas serán conservados en la base de datos de producción antes de ser depurados automáticamente.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>Tiempo de Retención: <strong>{settings.retention_days} Días</strong></label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input 
                  type="range" 
                  min="1" 
                  max="90" 
                  value={settings.retention_days}
                  onChange={e => setSettings({ retention_days: parseInt(e.target.value) })}
                  style={{ flex: 1, cursor: 'pointer', accentColor: '#f59e0b' }}
                />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', width: '60px', textAlign: 'right' }}>{settings.retention_days} d</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => handleSaveSettings(settings.retention_days)}
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#f59e0b', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Aplicar Nueva Política
              </button>
              <button 
                onClick={handleManualPurge}
                style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Depurar Registros Expirados (Purge)
              </button>
            </div>
          </div>

          <div style={{ background: '#111827', border: '1px solid #1e293b', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} color="#38bdf8" /> Notas Operativas de SuperAdmin
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                🔸 <strong>Purga en Cascada</strong>: Al reducir el tiempo de retención y guardar los cambios, las filas que excedan el límite serán depuradas automáticamente de manera instantánea mediante los triggers en cascada del servidor Supabase.
              </p>
              <p>
                🔸 <strong>Firma Digital de Logs</strong>: Todos los eventos críticos de auditoría poseen un identificador UUID inmutable y hash criptográfico en la base de datos para impedir manipulaciones accidentales o maliciosas.
              </p>
              <p>
                🔸 <strong>Millones de Registros</strong>: La base de datos incluye índices optimizados B-Tree y Hash por `tenant_id` y `created_at` para sostener millones de registros sin penalizaciones de lectura en el dashboard analítico.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Visual Before/After Diff Dialog Overlay */}
      {selectedDiffLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '800px', background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            {/* Diff Header */}
            <div style={{ padding: '20px 24px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>Trazabilidad de Cambios (Before / After)</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Acción: {selectedDiffLog.action} por {selectedDiffLog.user_name} ({selectedDiffLog.user_email})</span>
              </div>
              <button 
                onClick={() => setSelectedDiffLog(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {/* Diff Body Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Justification details */}
              <div style={{ padding: '12px 16px', background: '#0b0f19', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Justificación del Operador</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#e2e8f0' }}>
                  {selectedDiffLog.justification || 'No se proporcionó justificación explícita para este cambio.'}
                </p>
              </div>

              {/* Side-by-side JSON difference highlight */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>Valor Anterior (Before)</h4>
                  <pre style={{ margin: 0, padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#fca5a5', fontFamily: 'monospace', fontSize: '0.78rem', overflow: 'auto', maxHeight: '250px', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedDiffLog.old_values, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>Valor Nuevo (After)</h4>
                  <pre style={{ margin: 0, padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#a7f3d0', fontFamily: 'monospace', fontSize: '0.78rem', overflow: 'auto', maxHeight: '250px', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedDiffLog.new_values, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Detail fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '0.8rem', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Dirección IP:</span> <strong style={{ color: '#ffffff' }}>{selectedDiffLog.ip_address}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Tiempo de Ejecución:</span> <strong style={{ color: '#ffffff' }}>{selectedDiffLog.execution_time_ms} ms</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Fecha:</span> <strong style={{ color: '#ffffff' }}>{new Date(selectedDiffLog.created_at).toLocaleString()}</strong>
                </div>
              </div>

            </div>

            {/* Diff Footer */}
            <div style={{ padding: '16px 24px', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedDiffLog(null)}
                className="sa-btn sa-btn-secondary"
                style={{ padding: '8px 20px', borderRadius: '10px' }}
              >
                Cerrar Comparador
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
