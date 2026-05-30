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
  Rocket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './Sidebar.module.css';

const menuItems = [
  { icon: Rocket, label: 'GovData Launchpad', href: '/launchpad' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: LayoutGrid, label: 'Command Center 360°', href: '/command-center' },
  { icon: Brain, label: 'Metadata Intelligence', href: '/metadata', module: 'metadata' },
  { icon: Database, label: 'Catálogo de Datos', href: '/catalog', module: 'catalog' },
  { icon: Activity, label: 'Calidad de Datos', href: '/quality', module: 'quality' },
  { icon: ShieldCheck, label: 'Seguridad y Riesgos', href: '/security', module: 'security' },
  { icon: FileText, label: 'Políticas', href: '/policies', module: 'catalog' },
  { icon: Zap, label: 'Workflows', href: '/workflows', module: 'workflows' },
  { icon: Users, label: 'Roles y Equipo', href: '/team', module: 'team' },
  { icon: BarChart3, label: 'Madurez', href: '/maturity', module: 'maturity' },
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
  const { mode, setMode, currentTenant, tenants, setCurrentTenant } = usePlatform();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('govdata_role'));
      setUserName(localStorage.getItem('govdata_user_name'));
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('govdata_role');
    localStorage.removeItem('govdata_user_name');
    localStorage.removeItem('govdata_current_tenant_id');
    window.location.href = '/login';
  };

  // Filtrar ítems de menú según módulos activos de la empresa o si es superadmin/admin (ve todo)
  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === 'superadmin') return true; // Superadmin ve absolutamente todo
    if (userRole === 'admin') return true;       // Admin del tenant ve todos los módulos
    if (!item.module) return true;               // Dashboard siempre visible
    // Usuarios normales: solo módulos habilitados del tenant
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
            src="/logo.png" 
            alt="GovData Nexus Logo" 
            className={styles.logoImg} 
          />
          {!isCollapsed && <span className={styles.logoText}>GovData Nexus</span>}
        </div>
        <button 
          className={styles.collapseBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Selector de Empresa (SaaS / Multi-Tenant Context Switcher) */}
      <div className={styles.tenantContainer}>
        {!isCollapsed ? (
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

      {/* Mode Switcher - Solo visible para Superadmin */}
      {userRole === 'superadmin' && (
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

      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          {!isCollapsed && <input type="text" placeholder="Buscar activos..." className={styles.searchInput} />}
        </div>
      </div>

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
        <Link href="/settings" className={styles.footerLink} onClick={handleLinkClick}>
          <Settings size={22} />
          {!isCollapsed && <span>Configuración</span>}
        </Link>
        <Link href="/help" className={styles.footerLink} onClick={handleLinkClick}>
          <HelpCircle size={22} />
          {!isCollapsed && <span>Ayuda</span>}
        </Link>

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
        {!isCollapsed && (
          <div className={styles.userProfile}>
            <div className={styles.userMain}>
              <div className={styles.avatar}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{userName || 'Usuario'}</span>
                <span className={styles.userRole}>
                  {userRole === 'superadmin' ? 'Superadmin' : userRole === 'admin' ? 'Administrador' : 'Miembro'}
                </span>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar Sesión">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
