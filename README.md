# Central de Dados Corporativa

Aplicação React para centralizar visão operacional e automações de onboarding em uma experiência mais limpa e visualmente organizada.

## Visão geral

Este projeto conta com três áreas principais:

- Análise de Dados: painel com KPIs, gráficos e indicadores de 8 áreas da empresa (Visão Geral, PCP, SAC, Vendas, Compras, T.I., RH e Marketing).
- Automação de RH: fluxo de onboarding com seleção de setor, cargo, gestor e licenças do Microsoft 365.
- Assistente de Insights: painel flutuante que lê os KPIs em tempo real e gera observações e recomendações em linguagem natural, sem depender de nenhuma API externa.

O acesso é protegido por login (e-mail/senha) via Supabase — cada conta enxerga o painel com seu próprio nome e empresa.

## Tecnologias

- React 18
- Vite
- React Router
- Tailwind CSS
- Recharts
- Lucide React
- Context API
- Supabase (Auth + Postgres)

## Estrutura do projeto

```text
src/
  app/                          Aplicação principal, layout e rota protegida
  features/
    analise-dados/pages/        Tela de análise de dados
    automacao-rh/pages/         Tela de automação de RH
    assistente/                 Motor de insights + painel flutuante
    auth/                       Telas de login e cadastro
  shared/
    components/                 Componentes reutilizáveis
    context/                    Contexto global e contexto de autenticação
    data/                       Dados mockados de estrutura organizacional
    lib/                        Cliente do Supabase
    utils/                      Funções auxiliares
supabase/
  schema.sql                    Script para rodar no projeto Supabase (tabela de perfis + RLS)
```

## Como executar localmente

```bash
npm install
npm run dev
```

A aplicação ficará disponível em http://localhost:5173 e a navegação inicia em `/analise-dados` (redireciona para `/login` se não houver sessão ativa).

## Como configurar o login (Supabase — plano gratuito)

O login não funciona sem essa configuração — sem ela, a aplicação mostra uma tela explicando o que falta.

1. Crie uma conta grátis em [supabase.com](https://supabase.com) e clique em **New project**.
2. No painel do projeto, vá em **Project Settings > API** e copie a **Project URL** e a **anon public key**.
3. Na raiz do projeto, copie `.env.example` para `.env` e cole os dois valores:
   ```bash
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. No painel do Supabase, abra o **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria a tabela `profiles` (nome, empresa, cargo) e garante que cada usuário só acesse os próprios dados.
5. Reinicie `npm run dev`. Acesse `/registro` para criar a primeira conta.

Por padrão o Supabase exige confirmação por e-mail no cadastro — se quiser pular isso em ambiente de teste, desative em **Authentication > Providers > Email > Confirm email**.

## Como construir

```bash
npm run build
```

## CI/CD

O projeto já conta com um workflow de CI no GitHub Actions para validar o build a cada push ou pull request na branch `main`.

## Próximos passos

- integrar a automação com Microsoft Graph API;
- substituir os demais dados mockados (KPIs, estrutura organizacional) por fontes reais;
- adicionar permissões por papel/área (ex.: gestor de RH não vê Financeiro);
- implementar testes automatizados.
