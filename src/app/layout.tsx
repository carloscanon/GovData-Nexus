'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AIAssistant from '@/components/AIAssistant';
import { PlatformProvider } from '@/contexts/PlatformContext';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="es">
      <body className={inter.className}>
        <PlatformProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {!isLoginPage && <Sidebar />}
            <main style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: 'var(--background)',
              overflowX: 'hidden'
            }}>
              {children}
            </main>
            {!isLoginPage && <AIAssistant />}
          </div>
        </PlatformProvider>
      </body>
    </html>
  );
}
