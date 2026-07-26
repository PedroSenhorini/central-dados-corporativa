import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  runningAutomations: number;
  startAutomation: () => void;
  finishAutomation: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// guarda o estado da sidebar e um contador de automações rodando (pra mostrar feedback tipo badge)
export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [runningAutomations, setRunningAutomations] = useState(0);

  const value: AppContextValue = {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((open) => !open),
    runningAutomations,
    startAutomation: () => setRunningAutomations((n) => n + 1),
    finishAutomation: () => setRunningAutomations((n) => Math.max(0, n - 1)),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext precisa ser usado dentro de <AppProvider>');
  }
  return ctx;
}
