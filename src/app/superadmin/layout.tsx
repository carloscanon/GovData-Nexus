'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';

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

// Default labels (fallback) keyed by module identifier
const DEFAULT_LABELS: Record<string, string> = {
  moduleNames: 'Nombres de Módulos',
  dashboard: 'Dashboard SaaS',
  empresas: 'Empresas',
  demos: 'Solicitud de Demos',
  planes: 'Planes SaaS',
  billing: 'Facturación',
  consumo: 'Control de Consumo',
  escaneos: 'Escaneos Automáticos',
  tickets: 'Soporte Tickets',
  security: 'Seguridad y RLS',
  logs: 'Logs de Auditoría',
  loginConfig: 'Portal de Login',
  config: 'Configuración',
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const { saTheme, setSaTheme } = usePlatform();
  const [theme, setTheme] = useState<string>('classic');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('govdata_sa_theme');
      if (savedTheme) setTheme(savedTheme);
    } catch {}
  }, []);

  const themePresets: Record<string, any> = {
    classic: {
      background: '#050b14',
      card: '#090f1d',
      border: '#16223f',
      primary: '#3b82f6',
      text: '#ffffff',
      sidebarText: '#94a3b8',
      btnText: '#ffffff',
    },
    mediora: {
      background: '#f3f4f6',
      card: '#ffffff',
      border: '#cbd5e1',
      primary: '#10b981',
      text: '#0f172a',
      sidebarText: '#94a3b8',
      btnText: '#ffffff',
    },
    cyberpunk: {
      background: '#07000d',
      card: '#0f011a',
      border: '#ec4899',
      primary: '#f43f5e',
      text: '#00f0ff',
      sidebarText: '#f472b6',
      btnText: '#ffffff',
    },
    luxury: {
      background: '#080808',
      card: '#141414',
      border: '#b45309',
      primary: '#d97706',
      text: '#ffffff',
      sidebarText: '#d97706',
      btnText: '#000000',
    }
  };

  const handleDropdownThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    localStorage.setItem('govdata_sa_theme', selectedTheme);
    if (themePresets[selectedTheme]) {
      setSaTheme(themePresets[selectedTheme]);
    }
  };

  // Sidebar navigation items (key, icon, href)
  const sidebarItems = [
    { key: 'dashboard', icon: LayoutDashboard, href: '/superadmin' },
    { key: 'empresas', icon: Building2, href: '/superadmin/empresas' },
    { key: 'demos', icon: ClipboardList, href: '/superadmin/demos' },
    { key: 'planes', icon: Layers, href: '/superadmin/planes' },
    { key: 'billing', icon: CreditCard, href: '/superadmin/billing' },
    { key: 'consumo', icon: Gauge, href: '/superadmin/consumo' },
    { key: 'escaneos', icon: Zap, href: '/superadmin/escaneos' },
    { key: 'tickets', icon: Ticket, href: '/superadmin/tickets' },
    { key: 'security', icon: ShieldCheck, href: '/superadmin/security' },
    { key: 'logs', icon: ClipboardList, href: '/superadmin/logs' },
    { key: 'loginConfig', icon: LogIn, href: '/superadmin/login-config' },
    { key: 'config', icon: Settings, href: '/superadmin/config' },
    { key: 'moduleNames', icon: Settings, href: '/superadmin/module-names' },
  ];
  // Load module display names from DB (if any) – allow superadmin to customise
  const [moduleNames, setModuleNames] = useState<Record<string, string>>({});
  const GLOBAL_TENANT_ID = '00000000-0000-0000-0000-000000000001';
  useEffect(() => {
    const fetchModules = async () => {
      const { data, error } = await supabase
        .from('tenant_config')
        .select('config_value')
        .eq('tenant_id', GLOBAL_TENANT_ID)
        .eq('config_key', 'module_config')
        .single();
        
      if (!error && data && data.config_value) {
        setModuleNames(data.config_value as Record<string, string>);
      }
    };
    fetchModules();
  }, []);

  const roleCookie = typeof document !== 'undefined' ? document.cookie
    .split(';')
    .find(c => c.trim().startsWith('govdata_role='))
    ?.split('=')[1]
    ?.trim() : null;

  useEffect(() => {
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

  const styleVariables = {
    '--sa-background': saTheme.background || '#050b14',
    '--sa-card': saTheme.card || '#090f1d',
    '--sa-border': saTheme.border || '#16223f',
    '--sa-primary': saTheme.primary || '#3b82f6',
    '--sa-text': saTheme.text || '#ffffff',
    '--sa-sidebar-text': saTheme.sidebarText || '#94a3b8',
    '--sa-btn-text': saTheme.btnText || '#ffffff',
    '--sa-sidebar-bg': saTheme.card === '#ffffff' ? '#0b0f19' : (saTheme.card || '#090f1d'),
    '--sa-header-bg': saTheme.card === '#ffffff' ? '#0b0f19' : (saTheme.card || '#090f1d'),
    '--sa-card-shadow': saTheme.card === '#ffffff' ? '0 4px 18px rgba(15, 23, 42, 0.04)' : '0 10px 15px -3px rgba(0,0,0,0.3)',
    '--sa-accent-glow': saTheme.primary === '#10b981' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.05)',
  } as React.CSSProperties;

  return (
    <div className="sa-layout" style={styleVariables}>
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
const label = moduleNames[item.key] ?? DEFAULT_LABELS[item.key] ?? item.key;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sa-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <div className="sa-nav-link-content">
                  <item.icon className="w-5 h-5" style={{ color: isActive ? '#ffffff' : '#64748b' }} />
                  <span>{label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="sa-sidebar-footer">
          {/* Volver a UI normal (no logout) */}
          <button
            onClick={() => {
              // Simply navigate back to the main application UI.
              // Do NOT clear the auth cookie or session.
              setIsMobileSidebarOpen(false);
              router.push('/');
            }}
            className="sa-btn-back"
          >
            <LogOut className="w-4 h-4" />
            <span>Volver a la UI Normal</span>
          </button>
          {/* Cerrar sesión */}
          <button
            onClick={() => handleLogout('/')}
            className="sa-btn-back"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="sa-main">
         <header className="sa-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="sa-badge sa-badge-blue">
              SaaS Multiempresa Activo
            </span>
            
            {/* Theme Selector */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--sa-border)', padding: '4px 12px', borderRadius: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>UX TEMA:</span>
              <select 
                value={theme} 
                onChange={(e) => handleDropdownThemeChange(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--sa-text)', fontSize: '0.75rem', fontWeight: 800, outline: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                <option value="classic" style={{ background: '#0b0f19', color: '#fff' }}>Classic Dark</option>
                <option value="mediora" style={{ background: '#0b0f19', color: '#fff' }}>Mediora (UX Hybrid)</option>
                <option value="cyberpunk" style={{ background: '#0b0f19', color: '#fff' }}>Cyberpunk Neon</option>
                <option value="luxury" style={{ background: '#0b0f19', color: '#fff' }}>Luxury Gold</option>
              </select>
            </div>
          </div>
          
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
