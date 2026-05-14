'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type PlatformMode = 'DEMO' | 'ENTERPRISE';

interface PlatformContextType {
  mode: PlatformMode;
  setMode: (mode: PlatformMode) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PlatformMode>('DEMO');

  // Guardar preferencia en localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('govdata_mode') as PlatformMode;
    if (savedMode) setMode(savedMode);
  }, []);

  const handleSetMode = (newMode: PlatformMode) => {
    setMode(newMode);
    localStorage.setItem('govdata_mode', newMode);
  };

  return (
    <PlatformContext.Provider value={{ mode, setMode: handleSetMode }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform debe usarse dentro de un PlatformProvider');
  }
  return context;
}
