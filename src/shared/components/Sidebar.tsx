import { NavLink } from 'react-router-dom';
import {
  Home,
  Megaphone,
  Contact,
  FileText,
  Palmtree,
  Headset,
  BarChart3,
  UserCog,
  UserX,
  Users,
  KanbanSquare,
  ShoppingCart,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext.js';
import { useAuth } from '../context/AuthContext.js';
import { temAcessoAoModulo } from '../utils/permissoes.js';

interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  modulo?: string;
}

interface NavGroup {
  titulo: string;
  itens: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    titulo: 'Geral',
    itens: [
      { to: '/inicio', label: 'Início', description: 'Resumo do seu dia', icon: Home },
      { to: '/mural', label: 'Mural', description: 'Comunicados da empresa', icon: Megaphone },
      { to: '/pessoas', label: 'Pessoas', description: 'Diretório de colaboradores', icon: Contact },
      { to: '/documentos', label: 'Documentos', description: 'Políticas, manuais e modelos', icon: FileText },
    ],
  },
  {
    titulo: 'Dashboards',
    itens: [{ to: '/analise-dados', label: 'Análise de Dados', description: 'KPIs e indicadores', icon: BarChart3 }],
  },
  {
    titulo: 'Solicitações',
    itens: [
      { to: '/solicitacoes-rh', label: 'Solicitações de RH', description: 'Férias, declarações e cadastro', icon: Palmtree },
      { to: '/chamados-ti', label: 'Chamados de TI', description: 'Suporte a equipamentos e sistemas', icon: Headset },
      { to: '/compras', label: 'Compras', description: 'Solicitação e orçamento de compra', icon: ShoppingCart },
    ],
  },
  {
    titulo: 'Operação',
    itens: [
      { to: '/vagas-rh', label: 'Vagas (RH)', description: 'Kanban e SLA de contratação', icon: KanbanSquare },
      {
        to: '/visitas-tecnicas',
        label: 'Visitas Técnicas',
        description: 'Vistoria técnica em campo',
        icon: ClipboardCheck,
        modulo: 'visitas-tecnicas',
      },
      {
        to: '/automacao-rh',
        label: 'Automação de RH',
        description: 'Onboarding M365',
        icon: UserCog,
        modulo: 'automacao-rh',
      },
      {
        to: '/desligamento-rh',
        label: 'Desligamento',
        description: 'Bloqueio de acessos e licenças',
        icon: UserX,
        modulo: 'desligamento-rh',
      },
    ],
  },
  {
    titulo: 'Administração',
    itens: [{ to: '/usuarios', label: 'Usuários', description: 'Áreas de acesso', icon: Users, modulo: 'usuarios' }],
  },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, runningAutomations } = useAppContext();
  const { profile } = useAuth();

  return (
    <aside
      className={`flex flex-col shrink-0 bg-surface border-r border-border h-screen sticky top-0 transition-all duration-300 ${
        sidebarOpen ? 'w-16 md:w-60' : 'w-16'
      }`}
    >
      {/* Marca */}
      <div className="flex items-center justify-between gap-2 px-3 h-14">
        {sidebarOpen && (
          <div className="hidden md:flex items-center gap-2.5 min-w-0 pl-1">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-ink2 text-white text-[11px] font-semibold shrink-0">
              CD
            </span>
            <div className="leading-tight min-w-0">
              <p className="text-[13px] font-semibold text-ink2 truncate">Central de Dados</p>
              <p className="text-[11px] text-muted truncate">{profile?.empresa || 'Painel Corporativo'}</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="hidden md:block p-1.5 rounded-md text-muted hover:text-ink2 hover:bg-canvas transition-colors mx-auto"
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </button>
      </div>

      {/* Navegação principal */}
      {/* Em telas pequenas o menu fica só com ícones, sem empurrar o conteúdo. */}
      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto scroll-slim">
        {NAV_GROUPS.map((grupo) => {
          const itensVisiveis = grupo.itens.filter((item) =>
            temAcessoAoModulo(profile?.papel, item.modulo)
          );
          if (itensVisiveis.length === 0) return null;

          return (
            <div key={grupo.titulo} className="space-y-0.5">
              {sidebarOpen && (
                <p className="hidden md:block px-2 pb-1.5 text-[11px] font-medium text-muted/80">{grupo.titulo}</p>
              )}
              {itensVisiveis.map(({ to, label, description, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={sidebarOpen ? description : label}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                      sidebarOpen ? 'justify-center md:justify-start' : 'justify-center'
                    } ${
                      isActive
                        ? 'bg-canvas text-ink2 font-medium ring-1 ring-inset ring-border'
                        : 'text-muted hover:bg-canvas hover:text-ink2'
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  {sidebarOpen && <span className="hidden md:inline truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Status do sistema */}
      <div className="px-4 py-3 border-t border-border">
        <div className={`flex items-center gap-2 text-[12px] text-muted ${sidebarOpen ? 'justify-center md:justify-start' : 'justify-center'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
          {sidebarOpen && (
            <span className="hidden md:inline">
              Sistemas operacionais
              {runningAutomations > 0 && (
                <span className="ml-1 text-primary">· {runningAutomations} em execução</span>
              )}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
