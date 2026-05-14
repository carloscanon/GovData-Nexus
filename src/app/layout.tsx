import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AIAssistant from '@/components/AIAssistant';
import { PlatformProvider } from '@/contexts/PlatformContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GovData Nexus | Plataforma de Gobierno de Datos',
  description: 'Gestión integral de activos, calidad y cumplimiento de datos corporativos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <PlatformProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: 'var(--background)',
              overflowX: 'hidden'
            }}>
              {children}
            </main>
            <AIAssistant />
          </div>
        </PlatformProvider>
      </body>
    </html>
  );
}
