'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Layers,
  CreditCard,
  Gauge,
  Zap,
  Ticket,
  Settings,
  ShieldCheck,
  ClipboardList,
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react';
import './superadmin.css';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard SaaS', href: '/superadmin' },
  { icon: Building2, label: 'Empresas', href: '/superadmin/empresas' },
  { icon: Layers, label: 'Planes SaaS', href: '/superadmin/planes' },
  { icon: CreditCard, label: 'Facturación', href: '/superadmin/billing' },
  { icon: Gauge, label: 'Control de Consumo', href: '/superadmin/consumo' },
  { icon: Zap, label: 'Escaneos Automáticos', href: '/superadmin/escaneos' },
  { icon: Ticket, label: 'Soporte Tickets', href: '/superadmin/tickets' },
  { icon: ShieldCheck, label: 'Seguridad y RLS', href: '/superadmin/security' },
  { icon: ClipboardList, label: 'Logs de Auditoría', href: '/superadmin/logs' },
  { icon: Settings, label: 'Configuración', href: '/superadmin/config' },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('govdata_role');
      if (role !== 'superadmin') {
        router.push('/');
      }
    }
  }, [router]);

  return (
    <div className="sa-layout">
      {/* Super Admin Sidebar */}
      <aside className="sa-sidebar">
        {/* Header */}
        <div className="sa-brand-container">
          <div className="sa-brand">
            <div className="sa-brand-logo">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="sa-brand-title">Nexus Master</h1>
              <p className="sa-brand-subtitle">Superadministrador</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sa-nav">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sa-nav-link ${isActive ? 'active' : ''}`}
              >
                <div className="sa-nav-link-content">
                  <item.icon className="w-5 h-5" style={{ color: isActive ? '#ffffff' : '#64748b' }} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="sa-sidebar-footer">
          <button
            onClick={() => router.push('/')}
            className="sa-btn-back"
          >
            <LogOut className="w-4 h-4" />
            <span>Volver al Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="sa-main">
        <header className="sa-header">
          <span className="sa-badge sa-badge-blue">
            SaaS Multiempresa Activo
          </span>
          
          <div className="sa-user-badge">
            <div className="sa-user-avatar">
              SA
            </div>
            <div className="sa-user-info">
              <span className="sa-user-name">Administrador Global</span>
              <span className="sa-user-role">SuperAdmin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="sa-content">
          {children}
        </div>
      </main>
    </div>
  );
}
