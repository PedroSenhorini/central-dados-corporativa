# Central de Dados Corporativa

Intranet corporativa que reúne em um só lugar comunicados, diretório de pessoas, solicitações de RH, chamados de TI, compras e dashboards de indicadores, com **controle de acesso por cargo garantido no banco de dados**.

🔗 **Demo:** https://central-dados-corporativa.vercel.app
(crie uma conta na tela de cadastro; novos usuários entram com o perfil "geral")

<!-- Adicione aqui um print ou GIF da tela principal, por exemplo:
![Tela inicial](docs/preview.png)
-->

## Funcionalidades

| Área | Módulos |
| --- | --- |
| **Geral** | Início (resumo do dia), Mural de comunicados com confirmação de leitura, Diretório de pessoas, Documentos |
| **Indicadores** | Análise de Dados com KPIs, gráficos, filtros e um assistente de insights que destaca o que melhorou e o que precisa de atenção |
| **Solicitações** | Solicitações de RH (férias, declarações), Chamados de TI, Compras com fluxo de aprovação |
| **RH e operações** | Vagas em kanban com SLA de contratação, Automação de onboarding, Desligamento com bloqueio real de acesso, Checklist de visitas técnicas com fotos e assinatura |
| **Administração** | Gestão de usuários e papéis |

Também tem: busca rápida com `Ctrl + K`, central de notificações de pendências e atualização em tempo real (Supabase Realtime).

## Segurança e controle de acesso

- Autenticação com **Supabase Auth**.
- 9 papéis (`geral`, `rh`, `ti`, `compras`, `marketing`, `admin`…). Cada pessoa só vê os módulos do seu papel.
- As regras ficam no **PostgreSQL via Row Level Security (RLS)**. O front só esconde botões, e quem garante a permissão é o banco. Assim, a regra vale mesmo chamando a API direto.
- A migration [`20261001_seguranca_rls.sql`](supabase/migrations/20261001_seguranca_rls.sql) fecha caminhos de escalada de privilégio:
  - o usuário não consegue alterar o próprio papel;
  - não dá para se cadastrar como admin pelos metadados do sign up;
  - quem pede uma compra não aprova a própria solicitação;
  - colaborador desligado perde o acesso também pela API, não só na tela.

## Tecnologias

- **Front-end:** React 18, TypeScript, Vite, React Router, Tailwind CSS
- **Formulários e validação:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Back-end (BaaS):** Supabase (Auth, PostgreSQL, RLS, Realtime, Storage)
- **CI/CD:** GitHub Actions (typecheck + build a cada push/PR) e deploy na Vercel

## Estrutura

Organizado por funcionalidade (*feature-based*):

```text
src/
  app/            rotas, layout, ProtectedRoute e RequireRole
  features/       um diretório por módulo (pages, components, hooks, data)
  shared/         componentes, contextos, cliente Supabase, utilitários
supabase/
  schema.sql      schema completo (tabelas, policies RLS, storage)
  migrations/     mudanças incrementais de segurança e novos módulos
```

## Como rodar localmente

Pré-requisitos: Node.js 20+ e um projeto no [Supabase](https://supabase.com) (o plano gratuito serve).

```bash
git clone https://github.com/PedroSenhorini/central-dados-corporativa.git
cd central-dados-corporativa
npm install
```

1. No SQL Editor do Supabase, execute `supabase/schema.sql`.
2. Crie um arquivo `.env` na raiz com as chaves do seu projeto:

   ```env
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

3. Rode `npm run dev` e acesse http://localhost:5173
4. Para virar admin, cadastre-se e execute `supabase/promover-admin.sql` trocando o e-mail pelo seu.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | ambiente de desenvolvimento |
| `npm run typecheck` | checagem de tipos |
| `npm run build` | typecheck + build de produção |

## Próximos passos

- Testes automatizados (Vitest + Testing Library)
- Integração do onboarding com a Microsoft Graph API
- Assistente de insights com LLM

## Autor

**Pedro Senhorini** · [LinkedIn](https://www.linkedin.com/in/pedrosenhorini/) · [GitHub](https://github.com/PedroSenhorini)
