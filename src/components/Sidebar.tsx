'use client';

import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Database, label: 'Catálogo de Datos', href: '/catalog' },
  { icon: Activity, label: 'Calidad de Datos', href: '/quality' },
  { icon: ShieldCheck, label: 'Seguridad y Riesgos', href: '/security' },
  { icon: FileText, label: 'Políticas', href: '/policies' },
  { icon: Zap, label: 'Workflows', href: '/workflows' },
  { icon: Users, label: 'Roles y Equipo', href: '/team' },
  { icon: BarChart3, label: 'Madurez', href: '/maturity' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>GN</div>
          {!isCollapsed && <span className={styles.logoText}>GovData Nexus</span>}
        </div>
        <button 
          className={styles.collapseBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          {!isCollapsed && <input type="text" placeholder="Buscar activos..." className={styles.searchInput} />}
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
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
        <Link href="/settings" className={styles.footerLink}>
          <Settings size={22} />
          {!isCollapsed && <span>Configuración</span>}
        </Link>
        <Link href="/help" className={styles.footerLink}>
          <HelpCircle size={22} />
          {!isCollapsed && <span>Ayuda</span>}
        </Link>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>CD</div>
          {!isCollapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>Carlos Director</span>
              <span className={styles.userRole}>CDO Executive</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
