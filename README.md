# Central de Dados Corporativa

Aplicação React para centralizar visão operacional e automações de onboarding em uma experiência mais limpa e visualmente organizada.

## Visão geral

Este projeto conta com duas áreas principais:

- Análise de Dados: painel com KPIs, gráficos e indicadores consolidados.
- Automação de RH: fluxo de onboarding com seleção de setor, cargo, gestor e licenças do Microsoft 365.

## Tecnologias

- React 18
- Vite
- React Router
- Tailwind CSS
- Recharts
- Lucide React
- Context API

## Estrutura do projeto

```text
src/
  app/                          Aplicação principal e layout
  features/
    analise-dados/pages/       Tela de análise de dados
    automacao-rh/pages/        Tela de automação de RH
  shared/
    components/                 Componentes reutilizáveis
    context/                    Contexto global da aplicação
    data/                       Dados mockados de estrutura organizacional
    utils/                      Funções auxiliares
```

## Como executar localmente

```bash
npm install
npm run dev
```

A aplicação ficará disponível em http://localhost:5173 e a navegação inicia em `/analise-dados`.

## Como construir

```bash
npm run build
```

## CI/CD

O projeto já conta com um workflow de CI no GitHub Actions para validar o build a cada push ou pull request na branch `main`.

## Próximos passos

- integrar a automação com Microsoft Graph API;
- substituir dados mockados por backend real;
- adicionar autenticação e permissões;
- implementar testes automatizados.
