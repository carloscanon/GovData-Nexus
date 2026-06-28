'use client';

import React, { useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AIAssistant from '@/components/AIAssistant';
import { PlatformProvider, usePlatform } from '@/contexts/PlatformContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const inter = Inter({ subsets: ['latin'] });



function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logoUrl } = usePlatform();
  const isLoginPage = pathname === '/login';
  const isSuperadminLayout = pathname?.startsWith('/superadmin');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ─── Client-side Auth Guard (secondary safety net) ───────────────────────
  // The Next.js middleware handles server-side protection, but for SPA navigation
  // (where no new server request is made), we also check the cookie client-side.
  React.useEffect(() => {
    if (isLoginPage) return; // login page is always accessible

    const hasAuthCookie = document.cookie
      .split(';')
      .some(c => c.trim().startsWith('govdata_role='));

    if (!hasAuthCookie) {
      // No valid session — redirect immediately before rendering anything
      router.replace('/login?reason=unauthorized');
    }
  }, [pathname, isLoginPage, router]);

  // Inactivity and Force Close session checker
  React.useEffect(() => {
    if (isLoginPage) return;


    let timeoutMinutes = 5; // Default fallback
    let checkIntervalSeconds = 15; // Default fallback
    let sessionCheckInterval: NodeJS.Timeout;
    
    // Load config from Supabase DB to get configured inactivity timeout
    const fetchTimeout = async () => {
      try {
        const { data } = await supabase
          .from('tenant_config')
          .select('config_value')
          .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
          .eq('config_key', 'govdata_login_config')
          .single();
        if (data?.config_value) {
          const parsed = typeof data.config_value === 'string'
            ? JSON.parse(data.config_value)
            : data.config_value;
          if (parsed) {
            if (typeof parsed.sessionInactivityTimeoutMinutes === 'number') {
              timeoutMinutes = parsed.sessionInactivityTimeoutMinutes;
            }
            if (typeof parsed.adminSessionCheckIntervalSeconds === 'number') {
              checkIntervalSeconds = parsed.adminSessionCheckIntervalSeconds;
            }
          }
        }
      } catch (e) {
        console.warn('Error loading inactivity configuration:', e);
      }

      // Initialize session status check interval dynamically once parameters are loaded
      sessionCheckInterval = setInterval(checkSessionRevocation, checkIntervalSeconds * 1000);
    };

    fetchTimeout();

    // Check if the current user's session has been force-closed by an admin in saas_connections
    // IMPORTANT: Only logout if the session status is explicitly 'Forzada' - NOT if no active session is found.
    // This prevents false logouts if the session insert failed on login.
    const checkSessionRevocation = async () => {
      const email = localStorage.getItem('govdata_user_email');
      if (!email) return;

      try {
        // Look for sessions with status = 'Forzada' for this email
        // A session is 'Forzada' when an admin explicitly force-terminates it from the audit logs panel
        const { data, error } = await supabase
          .from('saas_connections')
          .select('id, status')
          .ilike('user_email', email.trim())
          .eq('status', 'Forzada')
          .limit(1);

        // Only logout if there is an EXPLICIT 'Forzada' session - i.e., admin actively closed it
        if (!error && data && data.length > 0) {
          console.log('[Session] Session force-terminated by administrator. Logging out.');
          // Mark the session as acknowledged so we don't loop
          await supabase
            .from('saas_connections')
            .update({ status: 'Cerrada', logout_time: new Date().toISOString() })
            .eq('id', data[0].id);
          handleLogout();
        }
      } catch (e) {
        console.warn('[Session] Error checking session revocation status:', e);
      }
    };

    const handleLogout = async () => {
      // Mark active session as 'Cerrada' in DB before clearing local state
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
      // Clear local storage session markers
      localStorage.removeItem('govdata_role');
      localStorage.removeItem('govdata_user_name');
      localStorage.removeItem('govdata_current_tenant_id');
      localStorage.removeItem('govdata_user_email');
      localStorage.removeItem('govdata_avatar_url');
      // Expire the auth cookie so middleware blocks protected routes immediately
      document.cookie = 'govdata_role=; path=/; max-age=0; SameSite=Strict';
      
      // Redirect to login with reason
      router.push('/login?reason=inactivity');
    };



    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLogout();
      }, timeoutMinutes * 60 * 1000);
    };

    // Initialize timer
    resetTimer();

    // Event listeners for activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearTimeout(timer);
      if (sessionCheckInterval) clearInterval(sessionCheckInterval);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isLoginPage, router]);

  // If we are in superadmin or login, we don't render the default sidebar or mobile header
  // Note: Superadmin layout handles its own sidebar
  const showDefaultLayout = !isLoginPage && !isSuperadminLayout;

  return (
    <div className="app-container">
      {showDefaultLayout && (
        <header className="mobile-header">
          <div className="mobile-brand">
            <img 
              src={logoUrl || "/logo.png"} 
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


