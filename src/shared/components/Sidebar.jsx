import { NavLink } from 'react-router-dom';
import { BarChart3, UserCog, PanelLeftClose, PanelLeftOpen, CircleDot } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  {
    to: '/analise-dados',
    label: 'Análise de Dados',
    description: 'KPIs e indicadores',
    icon: BarChart3,
  },
  {
    to: '/automacao-rh',
    label: 'Automação de RH',
    description: 'Onboarding M365',
    icon: UserCog,
  },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, runningAutomations } = useAppContext();

  return (
    <aside
      className={`flex flex-col shrink-0 bg-ink text-white h-screen sticky top-0 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Marca */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-ink-border">
        {sidebarOpen && (
          <div className="leading-tight">
            <p className="font-display font-semibold text-sm tracking-wide">CENTRAL DE DADOS</p>
            <p className="text-[11px] text-white/50">Painel Corporativo</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-ink-soft transition-colors"
          aria-label="Recolher menu"
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto scroll-slim">
        {sidebarOpen && (
          <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
            Áreas
          </p>
        )}
        {NAV_ITEMS.map(({ to, label, description, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-accent/15 text-white'
                  : 'text-white/65 hover:bg-ink-soft hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-md shrink-0 ${
                    isActive ? 'bg-accent text-white' : 'bg-ink-soft text-white/70'
                  }`}
                >
                  <Icon size={17} />
                </span>
                {sidebarOpen && (
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">{label}</span>
                    <span className="block text-[11px] text-white/40 truncate">{description}</span>
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status do sistema */}
      <div className="px-4 py-4 border-t border-ink-border">
        <div className="flex items-center gap-2 text-[12px] text-white/60">
          <CircleDot size={14} className="text-success" />
          {sidebarOpen ? (
            <span>
              Sistemas operacionais
              {runningAutomations > 0 && (
                <span className="ml-1 text-accent">· {runningAutomations} em execução</span>
              )}
            </span>
          ) : (
            runningAutomations > 0 && (
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            )
          )}
        </div>
      </div>
    </aside>
  );
}
