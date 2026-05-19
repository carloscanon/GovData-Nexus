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
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './Sidebar.module.css';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Database, label: 'Catálogo de Datos', href: '/catalog', module: 'catalog' },
  { icon: Activity, label: 'Calidad de Datos', href: '/quality', module: 'quality' },
  { icon: ShieldCheck, label: 'Seguridad y Riesgos', href: '/security', module: 'security' },
  { icon: FileText, label: 'Políticas', href: '/policies', module: 'catalog' },
  { icon: Zap, label: 'Workflows', href: '/workflows', module: 'workflows' },
  { icon: Users, label: 'Roles y Equipo', href: '/team', module: 'team' },
  { icon: BarChart3, label: 'Madurez', href: '/maturity', module: 'maturity' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
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
    router.push('/login');
  };

  // Filtrar ítems de menú según módulos activos de la empresa o si es superadmin (ve todo)
  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === 'superadmin') return true;
    if (!item.module) return true; // Siempre mostrar Dashboard, etc.
    return currentTenant?.modules?.includes(item.module);
  });

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
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
            >
              <item.icon size={22} className={styles.navIcon} />
              {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
              {isActive && !isCollapsed && <div className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {/* Link directo a SuperAdministrador si es admin */}
        {userRole === 'superadmin' && !isCollapsed && (
          <Link 
            href="/superadmin" 
            className="flex items-center space-x-2 px-4 py-2 mx-2 mb-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all text-center justify-center shadow-sm"
          >
            <span>Super Administrador</span>
          </Link>
        )}

        <Link href="/settings" className={styles.footerLink}>
          <Settings size={22} />
          {!isCollapsed && <span>Configuración</span>}
        </Link>
        <Link href="/help" className={styles.footerLink}>
          <HelpCircle size={22} />
          {!isCollapsed && <span>Ayuda</span>}
        </Link>

        {/* User Card */}
        {!isCollapsed && (
          <div className={styles.userProfile}>
            <div className={styles.userMain}>
              <div className={styles.avatar}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{userName || 'Usuario'}</span>
                <span className={styles.userRole}>{userRole === 'superadmin' ? 'Superadmin' : 'Miembro'}</span>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar Sesión">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
