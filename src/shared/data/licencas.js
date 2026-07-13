import { Mail, Users2, FolderKanban, PresentationIcon, Bot, MessagesSquare } from 'lucide-react';

/**
 * Licenças do Microsoft 365 usadas tanto no onboarding (concessão) quanto
 * no desligamento (revogação) — mesmo catálogo, ações opostas.
 */
export const LICENCAS_M365 = [
  { id: 'e3', label: 'Microsoft 365 E3', description: 'Office, e-mail e armazenamento', icon: Mail },
  { id: 'teams', label: 'Microsoft Teams', description: 'Chamadas e colaboração', icon: MessagesSquare },
  { id: 'sharepoint', label: 'SharePoint', description: 'Portais e documentos de equipe', icon: FolderKanban },
  { id: 'powerbi', label: 'Power BI Pro', description: 'Relatórios e dashboards', icon: PresentationIcon },
  { id: 'copilot', label: 'Copilot para M365', description: 'Assistente de IA integrado', icon: Bot },
  { id: 'exchange', label: 'Exchange Online', description: 'Caixa de e-mail corporativa', icon: Users2 },
];
