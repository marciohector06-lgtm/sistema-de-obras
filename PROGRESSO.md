# Progresso — Sistema de Gestão de Obras

## Fase 1 — Fundação & Layout (em andamento)

### Concluído
- Projeto Next.js 14 (App Router) + TypeScript (strict) + Tailwind CSS v4
- shadcn/ui instalado via CLI (estilo `base-nova`, biblioteca `@base-ui/react`)
  - Componentes adicionados: button, card, badge, input, label, dropdown-menu, dialog, table, avatar, separator, sheet, tooltip, select, skeleton, sonner
- Design system aplicado em `app/globals.css` (paleta navy/primary/success/warning/danger/info do mega prompt, mapeada nos tokens do shadcn)
- Fonte Inter configurada
- Schema Prisma completo (`prisma/schema.prisma`) com todos os models do mega prompt
- Prisma Client gerado (Prisma 7 — usa `prisma.config.ts` para a `DATABASE_URL`, não mais `url` no `schema.prisma`)
- Supabase Auth integrado (`lib/supabase.ts`, `lib/supabase-server.ts`, `middleware.ts`) — **aguardando credenciais reais do projeto Supabase** (o middleware libera todas as rotas enquanto `NEXT_PUBLIC_SUPABASE_URL` não estiver configurada)
- Supabase CLI instalado como devDependency (`npx supabase ...`) e `supabase/` inicializado localmente
- Componentes compartilhados: `KpiCard`, `StatusBadge`, `ProgressBar`, `PageHeader`, `SectionCard`, `AlertBanner`
- Layout do dashboard: `Sidebar` (navy, navegação por perfil), `Header` (notificações + menu do usuário), `MobileNav` (drawer para telas < 768px)
- Páginas: `/login`, `/registro` (dark, premium), `/dashboard` (KpiCards + progresso das obras + alertas recentes, dados mockados em `lib/mock-data.ts`)
- `/` redireciona para `/dashboard`
- Build de produção, lint e type-check rodando sem erros
- Verificação visual feita (screenshots via Playwright): dashboard, dropdown do usuário, menu mobile, login

### Pendente (adiado a pedido do usuário — "por último")
- Criar o projeto Supabase real e preencher `.env.local` com as credenciais (URL, anon key, service role key)
- Rodar `prisma migrate dev` contra o banco real
- Dar acesso de push da conta `marciohector06-lgtm` ao repositório GitHub `hmcorporation039-tech/Sistema-de-obras` (push inicial já está pronto localmente, branch `main`, remote `origin` configurado — falhou por permissão 403)
- Testar o fluxo real de login/registro/aprovação de usuário (depende do Supabase conectado)

### Notas técnicas importantes
- **Tailwind v4**: o projeto foi migrado de v3 para v4 durante o `shadcn init` (a versão atual do shadcn CLI gera para v4). `tailwind.config.ts` foi removido — o tema agora vive em `app/globals.css` via `@theme inline`.
- **`@base-ui/react`**: esta versão do shadcn/ui não usa Radix nem o padrão `asChild` — usa a prop `render={<Componente />}` para composição (ex: `SheetTrigger`, `DropdownMenuTrigger`). `DropdownMenuLabel` precisa estar dentro de um `DropdownMenuGroup`.
- `components/ui/button.tsx` foi ajustado para usar `React.forwardRef` (o gerado pelo CLI não encaminhava ref, causando warning ao compor com `Sheet`/`DropdownMenu`).
- **Prisma 7**: `datasource.url` não é mais aceito em `schema.prisma`. A URL de conexão agora fica em `prisma.config.ts`. `.env.local` tem uma `DATABASE_URL` placeholder local só para o `prisma generate` funcionar antes da conexão real com o Supabase.
- `next@14.2.35` é o patch mais recente da série 14.x (a major pedida no mega prompt).

## Próximas fases (ainda não iniciadas)
- Fase 2 — Módulo Obras (CRUD completo)
- Fase 3 — Controle Financeiro
- Fase 4 — Inventário
- Fase 5 — Pagamentos Semanais & Usuários
- Fase 6 — Inteligência Artificial
