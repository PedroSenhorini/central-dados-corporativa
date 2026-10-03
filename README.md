# Central de Dados Corporativa

Uma intranet para empresa: comunicados, diretório de pessoas, pedidos de RH, chamados de TI, compras e dashboards de indicadores, tudo num lugar só e com acesso separado por cargo.

Comecei como um painel simples de KPIs e onboarding e fui adicionando módulos aos poucos.

Demo: https://central-dados-corporativa.vercel.app
Dá pra criar uma conta na tela de cadastro. Contas novas entram com o perfil "geral", então alguns módulos ficam ocultos.

<!-- TODO: adicionar print da tela inicial em docs/preview.png -->

## O que tem

- Início com o resumo do dia e notificações de pendências
- Mural de comunicados com confirmação de leitura
- Diretório de pessoas e área de documentos
- Dashboard de indicadores com filtros e um assistente que aponta o que melhorou e o que piorou
- Solicitações de RH (férias, declarações), chamados de TI e pedidos de compra com aprovação
- Kanban de vagas com SLA de contratação
- Onboarding e desligamento de colaboradores (o desligado perde o acesso na hora)
- Checklist de visitas técnicas com fotos e assinatura
- Tela de administração de usuários e papéis
- Busca rápida com Ctrl + K

## Permissões

O login é feito com Supabase Auth e existem 9 papéis (geral, rh, ti, compras, marketing, admin etc.). Cada um enxerga só os módulos que fazem sentido pra ele.

A regra de verdade fica no banco, com Row Level Security no Postgres. No front eu só escondo botões e rotas; se alguém tentar chamar a API direto, o banco bloqueia do mesmo jeito.

Na migration [`20261001_seguranca_rls.sql`](supabase/migrations/20261001_seguranca_rls.sql) corrigi algumas brechas que encontrei revisando as policies:

- o usuário conseguia trocar o próprio papel com um update direto;
- dava pra se cadastrar como admin mandando o papel nos metadados do sign up;
- quem pedia uma compra podia aprovar o próprio pedido;
- colaborador desligado ainda acessava os dados pela API.

## Stack

React 18, TypeScript, Vite, React Router, Tailwind, React Hook Form + Zod, Recharts e Supabase (Auth, Postgres, Realtime e Storage).

O GitHub Actions roda typecheck e build em cada push e PR, e o deploy é feito na Vercel.

## Rodando local

Precisa de Node 20+ e de um projeto no Supabase (o plano free resolve).

```bash
git clone https://github.com/PedroSenhorini/central-dados-corporativa.git
cd central-dados-corporativa
npm install
```

Rode o `supabase/schema.sql` no SQL Editor do Supabase e crie um `.env` na raiz:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Depois é só `npm run dev` e abrir http://localhost:5173. Pra virar admin, crie sua conta e rode o `supabase/promover-admin.sql` com o seu e-mail.

## Organização

O código está separado por funcionalidade: cada módulo tem sua pasta em `src/features` (páginas, componentes, hooks e dados), e o que é compartilhado fica em `src/shared`. As rotas e os guards de autenticação e papel ficam em `src/app`.

## Próximos passos

- testes com Vitest e Testing Library
- integrar o onboarding com a Microsoft Graph API
- trocar o assistente de insights (hoje baseado em regras) por um modelo de linguagem
