'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  Database,
  LogIn,
  Menu
} from 'lucide-react';
import './superadmin.css';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard SaaS', href: '/superadmin' },
  { icon: Building2, label: 'Empresas', href: '/superadmin/empresas' },
  { icon: ClipboardList, label: 'Solicitud de Demos', href: '/superadmin/demos' },
  { icon: Layers, label: 'Planes SaaS', href: '/superadmin/planes' },
  { icon: CreditCard, label: 'Facturación', href: '/superadmin/billing' },
  { icon: Gauge, label: 'Control de Consumo', href: '/superadmin/consumo' },
  { icon: Zap, label: 'Escaneos Automáticos', href: '/superadmin/escaneos' },
  { icon: Ticket, label: 'Soporte Tickets', href: '/superadmin/tickets' },
  { icon: ShieldCheck, label: 'Seguridad y RLS', href: '/superadmin/security' },
  { icon: ClipboardList, label: 'Logs de Auditoría', href: '/superadmin/logs' },
  { icon: LogIn, label: 'Portal de Login', href: '/superadmin/login-config' },
  { icon: Settings, label: 'Configuración', href: '/superadmin/config' },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    // Check cookie (set on login) instead of only localStorage
    // This ensures direct URL access after logout is blocked
    const roleCookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('govdata_role='))
      ?.split('=')[1]
      ?.trim();

    if (!roleCookie) {
      router.replace('/login?reason=unauthorized');
      return;
    }
    if (roleCookie !== 'superadmin') {
      router.replace('/');
    }
  }, [router]);

  // Close session in DB and redirect
  const handleLogout = async (redirectTo: string = '/login') => {
    const email = localStorage.getItem('govdata_user_email');
    if (email) {
      try {
        await supabase
          .from('saas_connections')
          .update({ status: 'Cerrada', logout_time: new Date().toISOString() })
          .ilike('user_email', email.trim())
          .eq('status', 'Activa');
      } catch (e) {
        console.warn('[Logout] Could not update session status:', e);
      }
    }
    localStorage.removeItem('govdata_role');
    localStorage.removeItem('govdata_user_name');
    localStorage.removeItem('govdata_current_tenant_id');
    localStorage.removeItem('govdata_user_email');
    localStorage.removeItem('govdata_avatar_url');
    // Expire the auth cookie so middleware blocks protected routes immediately
    document.cookie = 'govdata_role=; path=/; max-age=0; SameSite=Strict';
    router.push(redirectTo);
  };

  return (
    <div className="sa-layout">
      {/* Backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div className="sa-sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      
      {/* Mobile Header Bar */}
      <header className="sa-mobile-header">
        <div className="sa-mobile-brand">
          <div className="sa-brand-logo">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="sa-mobile-brand-title">Nexus Master</span>
        </div>
        <button 
          className="sa-mobile-menu-btn"
          onClick={() => setIsMobileSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* Super Admin Sidebar */}
      <aside className={`sa-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
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
                onClick={() => setIsMobileSidebarOpen(false)}
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
            onClick={() => handleLogout('/login')}
            className="sa-btn-back"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
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
