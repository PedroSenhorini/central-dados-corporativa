# Central de Dados Corporativa

Dashboard com duas áreas: Análise de Dados e Automação de RH.

- **Análise de Dados** — KPIs com sparkline e dois gráficos (linha e barras), via `recharts`.
- **Automação de RH** — onboarding com setor, cargo, gestor e licenças do Microsoft 365. O e-mail é gerado a partir do domínio do setor e o painel de status simula o provisionamento (ainda não chama a Graph API de verdade — ver abaixo).

## Stack

- React 18
- `react-router-dom`
- Context API (`src/context/AppContext.jsx`) para o estado do menu lateral
- Tailwind CSS
- `recharts`, `lucide-react`

## Estrutura

```
src/
  components/    Sidebar, KpiCard, ToggleSwitch, IntegrationStatus, OnboardingSummary
  context/       AppContext.jsx
  data/          organizacao.js (setores, gestores, cargos, acessos automáticos)
  utils/         email.js (geração do e-mail corporativo)
  pages/         AnaliseDados.jsx, AutomacaoRH.jsx
  App.jsx        layout, header e rotas
  main.jsx       bootstrap
```

## Rodando

```bash
npm install
npm run dev
```

Abre em `/analise-dados`; o menu lateral leva até `/automacao-rh`.

## Pendências

- `runAutomation` (em `AutomacaoRH.jsx`) hoje só simula as etapas com `setTimeout` — plugar a Microsoft Graph API aqui.
- KPIs e gráficos de `AnaliseDados.jsx` estão com dados mockados.
- Setores, gestores, cargos e domínios ficam em `src/data/organizacao.js` — editar direto ali.
- Sem autenticação ainda (considerar MSAL se for login com conta Microsoft).
