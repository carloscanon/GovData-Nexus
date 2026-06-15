'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Database, 
  ShieldCheck, 
  FileText, 
  Users, 
  Activity, 
  Settings, 
  HelpCircle,
  X,
  Menu,
  ChevronLeft,
  Search,
  Zap,
  Lock,
  BarChart3,
  Box,
  Building2,
  LogOut,
  Crown,
  Sparkles,
  LayoutGrid,
  Brain,
  Rocket,
  GraduationCap,
  Award,
  ShoppingBag
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './Sidebar.module.css';

const menuItems = [
  { icon: Rocket, label: 'GovData Launchpad', href: '/launchpad' },
  { icon: GraduationCap, label: 'Journey CDO', href: '/journey', module: 'journey' },
  { icon: ShoppingBag, label: 'App Store', href: '/appstore' },
  { icon: LayoutGrid, label: 'Command Center 360°', href: '/command-center' },
  { icon: Brain, label: 'Metadata Intelligence', href: '/metadata', module: 'metadata' },
  { icon: Database, label: 'Catálogo de Datos', href: '/catalog', module: 'catalog' },
  { icon: Activity, label: 'Calidad de Datos', href: '/quality', module: 'quality' },
  { icon: ShieldCheck, label: 'Seguridad y Riesgos', href: '/security', module: 'security' },
  { icon: FileText, label: 'Políticas', href: '/policies', module: 'policies' },
  { icon: Users, label: 'Roles y Equipo', href: '/team', module: 'team' },
  { icon: Users, label: 'Comités de Gobierno', href: '/data-governance/committees', module: 'team' },
  { icon: Zap, label: 'Gestión de Workflows', href: '/workflows', module: 'quality' },
  { icon: BarChart3, label: 'Madurez DAMA', href: '/maturity', module: 'maturity' },
  { icon: GraduationCap, label: 'Simulador CDO', href: '/simulator' },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };
  const { mode, setMode, currentTenant, tenants, setCurrentTenant, logoUrl, logoWidth } = usePlatform();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  const [userAllowedModules, setUserAllowedModules] = React.useState<string[]>([]);

  React.useEffect(() => {
    setIsMounted(true);
    const role = typeof window !== 'undefined' ? localStorage.getItem('govdata_role') : null;
    const email = typeof window !== 'undefined' ? localStorage.getItem('govdata_user_email') : null;
    
    setUserRole(role);
    if (typeof window !== 'undefined') {
      setUserName(localStorage.getItem('govdata_user_name'));
      setUserAvatar(localStorage.getItem('govdata_avatar_url'));
      setUserEmail(email);
    }

    // Fetch allowed modules for custom DB roles if not a standard system role (superadmin/admin/viewer/editor/steward)
    const fetchCustomRolePermissions = async () => {
      if (!role || !currentTenant || ['superadmin', 'admin', 'viewer', 'editor', 'steward'].includes(role.toLowerCase())) {
        return;
      }
      try {
        const { supabase } = await import('@/lib/supabase');
        // Get the role's modules
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('tenant_id', currentTenant.id)
          .eq('name', role)
          .single();
          
        if (roleData) {
          const { data: moduleData } = await supabase
            .from('role_modules')
            .select('module')
            .eq('role_id', roleData.id);
            
          if (moduleData) {
            setUserAllowedModules(moduleData.map((m: any) => m.module));
          }
        }
      } catch (err) {
        console.error('Error loading custom role permissions:', err);
      }
    };

    if (currentTenant?.id) {
      fetchCustomRolePermissions();
    }

    // Listen for profile updates from the access management module
    const handleUserUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.avatar !== undefined) setUserAvatar(detail.avatar || null);
      if (detail?.name) setUserName(detail.name);
    };

    // Also re-sync from localStorage when another tab updates it
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'govdata_avatar_url') setUserAvatar(e.newValue);
      if (e.key === 'govdata_user_name') setUserName(e.newValue);
    };

    window.addEventListener('govdata_user_updated', handleUserUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('govdata_user_updated', handleUserUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentTenant?.id, userRole]);

  // Logout handler — marks session as 'Cerrada' in DB before clearing local state
  const handleLogout = async () => {
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
    localStorage.removeItem('govdata_avatar_url');
    localStorage.removeItem('govdata_user_email');
    // Expire the auth cookie so the middleware blocks routes immediately
    document.cookie = 'govdata_role=; path=/; max-age=0; SameSite=Strict';
    window.location.href = '/login';
  };

  // Filtrar ítems de menú según módulos activos de la empresa o si es superadmin/admin (ve todo)
  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === 'superadmin') return true; // Superadmin ve absolutamente todo
    
    // Si es el módulo de Journey CDO, desactivado por defecto en todos los casos excepto si se asigna por roles
    if (item.module === 'journey') {
      return userAllowedModules.includes('journey');
    }
    
    if (userRole === 'admin') return true;       // Admin del tenant ve todos los otros módulos
    if (!item.module) return true;               // Launchpad/Command center siempre visible
    
    // Si es un rol personalizado de base de datos
    if (userRole && !['viewer', 'editor', 'steward'].includes(userRole.toLowerCase())) {
      return userAllowedModules.includes(item.module);
    }
    
    // Mapeo tradicional por defecto
    if (item.module === 'policies') {
      return currentTenant?.modules?.includes('policies') || currentTenant?.modules?.includes('catalog');
    }
    return currentTenant?.modules?.includes(item.module);
  });

  return (
    <>
      {isMobileOpen && (
        <div className={styles.backdrop} onClick={onCloseMobile} />
      )}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <img 
            src={logoUrl || "/logo.png"} 
            alt="GovData Nexus Logo" 
            className={styles.logoImg} 
            style={{ 
              width: isCollapsed ? '48px' : logoWidth || '180px', 
              height: isCollapsed ? '48px' : 'auto' 
            }}
          />
          {!isCollapsed && (logoUrl === '/logo.png' || logoWidth === '40px' || logoWidth === '80px' || logoWidth === '120px') && <span className={styles.logoText}>GovData Nexus</span>}
        </div>
        <button 
          className={styles.closeMobileBtn} 
          onClick={onCloseMobile}
        >
          <X size={20} />
        </button>
        <button 
          className={styles.collapseBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* KITT Scanner — subtle red scan light like K.I.T.T. from Knight Rider */}
      <div className={styles.kittScanner}>
        <div className={styles.kittScannerGlow} />
      </div>

      {/* Selector de Empresa (SaaS / Multi-Tenant Context Switcher) */}
      <div className={styles.tenantContainer}>
        {!isMounted ? (
          <div className={styles.tenantDisplay}>
            <span className={styles.tenantName}>Cargando...</span>
          </div>
        ) : !isCollapsed ? (
          <div className="flex flex-col space-y-1">
            <span className={styles.tenantLabel}>Empresa Activa</span>
            
            {userRole === 'superadmin' ? (
              <select
                value={currentTenant?.id}
                onChange={(e) => {
                  const tenant = tenants.find(t => t.id === e.target.value);
                  if (tenant) setCurrentTenant(tenant);
                }}
                className={styles.tenantSelect}
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.plan})
                  </option>
                ))}
              </select>
            ) : (
              <div className={styles.tenantDisplay}>
                <span className={styles.tenantName}>{currentTenant?.name || 'Cargando...'}</span>
                <span className={styles.tenantBadge}>{currentTenant?.plan || 'Enterprise'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center text-slate-400 cursor-pointer" title={currentTenant?.name}>
            <Building2 size={20} />
          </div>
        )}
      </div>

      {/* Mode Switcher - Solo visible para Superadmin en la empresa principal */}
      {userRole === 'superadmin' && currentTenant && tenants.length > 0 && currentTenant.id === tenants[0].id && (
        <div className={styles.modeToggleContainer}>
          <div className={`${styles.toggleWrapper} ${isCollapsed ? styles.collapsedToggle : ''}`}>
            <button 
              className={`${styles.modeBtn} ${mode === 'DEMO' ? styles.activeMode : ''}`}
              onClick={() => setMode('DEMO')}
              title="Vista Demo"
            >
              <Box size={18} />
              {!isCollapsed && <span>Demo</span>}
            </button>
            <button 
              className={`${styles.modeBtn} ${mode === 'ENTERPRISE' ? styles.activeMode : ''}`}
              onClick={() => setMode('ENTERPRISE')}
              title="Vista Empresarial"
            >
              <Building2 size={18} />
              {!isCollapsed && <span>Empresa</span>}
            </button>
          </div>
        </div>
      )}

      
      <nav className={styles.nav}>
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              onClick={handleLinkClick}
            >
              <item.icon size={22} className={styles.navIcon} />
              {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
              {isActive && !isCollapsed && <div className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {(userRole === 'admin' || userRole === 'superadmin') && (
          <Link href="/settings" className={styles.footerLink} onClick={handleLinkClick}>
            <Settings size={22} />
            {!isCollapsed && <span>Configuración</span>}
          </Link>
        )}
        <button 
          className={styles.footerLink} 
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('open-ai-assistant'));
            handleLinkClick();
          }}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <HelpCircle size={22} />
          {!isCollapsed && <span>Ayuda</span>}
        </button>

        {/* Link directo a SuperAdministrador si es admin - Abajo, llamativo y adaptado */}
        {userRole === 'superadmin' && (
          <Link 
            href="/superadmin" 
            className={`${styles.superadminLink} ${isCollapsed ? styles.collapsedLink : ''}`}
            title="Panel de Super Administrador"
            onClick={handleLinkClick}
          >
            <Crown size={22} className="flex-shrink-0" />
            {!isCollapsed && <span>Super Administrador</span>}
            {!isCollapsed && <Sparkles size={14} className="ml-auto animate-pulse" />}
          </Link>
        )}

        {/* User Card */}
        {!isCollapsed && (() => {
          const roleConfig: Record<string, { label: string; color: string; bg: string; gradient: string }> = {
            superadmin: { label: 'Super Admin', color: '#d97706', bg: 'rgba(217,119,6,0.15)', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
            admin:      { label: 'Administrador', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
            user:       { label: 'Miembro', color: '#10b981', bg: 'rgba(16,185,129,0.15)', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
          };
          const rc = roleConfig[userRole || 'user'] || roleConfig['user'];
          const initials = userName ? userName.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() : 'U';
          const seed = encodeURIComponent((userName || '').replace(/\s+/g, '').substring(0, 30));
          const isReal = (url: string | null | undefined) => 
            !!url && !url.includes('dicebear') && !url.includes('/initials/') && 
            (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:'));
          const finalAvatar = isReal(userAvatar) ? userAvatar : `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div className={styles.userProfile}>
                <div className={styles.userMain}>
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={finalAvatar as string}
                      alt={userName || 'avatar'}
                      style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', border: `2px solid ${rc.color}`, display: 'block' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`; }}
                    />
                    {/* Online dot */}
                    <div style={{
                      position: 'absolute', bottom: '-2px', right: '-2px',
                      width: '12px', height: '12px', borderRadius: '50%',
                      background: '#10b981', border: '2px solid #1e293b'
                    }} />
                  </div>

                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{userName || 'Usuario'}</span>
                    {/* Role badge */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      marginTop: '3px',
                      fontSize: '0.68rem', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '6px',
                      background: rc.bg, color: rc.color,
                      border: `1px solid ${rc.color}44`,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase' as const
                    }}>
                      {rc.label}
                    </span>
                  </div>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar Sesión">
                  <LogOut size={16} />
                </button>
              </div>

              {/* Small logo of GovData Nexus at the end of the user card */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px', 
                padding: '10px 0 2px 0', 
                opacity: 0.75,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <img 
                  src={logoUrl || "/logo.png"} 
                  alt="GovData Nexus Logo" 
                  style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px' }} 
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.95)', textTransform: 'uppercase' }}>
                  GovData Nexus
                </span>
              </div>
            </div>
          );
        })()}
        
        {isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0 0', opacity: 0.65 }}>
            <img 
              src={logoUrl || "/logo.png"} 
              alt="GovData Nexus Logo" 
              style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px' }} 
            />
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
