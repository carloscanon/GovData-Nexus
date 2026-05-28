'use client';

import React, { useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AIAssistant from '@/components/AIAssistant';
import { PlatformProvider } from '@/contexts/PlatformContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const isSuperadminLayout = pathname?.startsWith('/superadmin');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('govdata_role');
      if (!role && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  // If we are in superadmin or login, we don't render the default sidebar or mobile header
  // Note: Superadmin layout handles its own sidebar
  const showDefaultLayout = !isLoginPage && !isSuperadminLayout;

  return (
    <div className="app-container">
      {showDefaultLayout && (
        <header className="mobile-header">
          <div className="mobile-brand">
            <img 
              src="/logo.png" 
              alt="GovData Nexus Logo" 
              className="mobile-logo-img" 
            />
            <span className="mobile-brand-name">GovData Nexus</span>
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        </header>
      )}
      
      {showDefaultLayout && (
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          onCloseMobile={() => setIsMobileSidebarOpen(false)} 
        />
      )}
      
      <main className="main-content">
        {children}
      </main>
      
      {showDefaultLayout && <AIAssistant />}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <PlatformProvider>
          <LayoutContent>{children}</LayoutContent>
        </PlatformProvider>
      </body>
    </html>
  );
}


