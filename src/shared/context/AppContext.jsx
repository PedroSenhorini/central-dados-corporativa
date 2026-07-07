import { createContext, useContext, useState } from 'react';

const AppContext = createContext(undefined);

/**
 * Provedor global da aplicação.
 * Guarda o estado do menu lateral e um contador simples de
 * automações de onboarding em andamento, para exibir feedback
 * em qualquer parte da interface (ex: badge na sidebar).
 */
export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [runningAutomations, setRunningAutomations] = useState(0);

  const value = {
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
