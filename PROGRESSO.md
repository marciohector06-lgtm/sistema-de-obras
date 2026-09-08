# Progresso — Sistema de Gestão de Obras

## Repositório
- Código publicado em https://github.com/marciohector06-lgtm/sistema-de-obras (branch `main`)

## Fase 1 — Fundação & Layout (em andamento)

### Concluído
- Projeto Next.js 14 (App Router) + TypeScript (strict) + Tailwind CSS v4
- shadcn/ui instalado via CLI (estilo `base-nova`, biblioteca `@base-ui/react`)
  - Componentes adicionados: button, card, badge, input, label, dropdown-menu, dialog, table, avatar, separator, sheet, tooltip, select, skeleton, sonner, textarea, tabs
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

## Fase 2 — Módulo Obras (concluída)

### Concluído
- Banco de dados local via Docker (Postgres 16, container `sistema-obras-db`) — usado para desenvolvimento real enquanto o Supabase não é conectado. Trocar `DATABASE_URL` no `.env.local` pela connection string do Supabase quando estiver pronto (nenhuma mudança de código necessária).
- Migração inicial aplicada (`prisma/migrations/20260908202413_init`)
- `lib/validations.ts` — schemas Zod (`obraSchema`, `gastoSchema`, `clienteSchema`), exportando tipos `Input` (pré-validação) e `Output` (pós-validação/coerção)
- `lib/obra.ts` — `getObraSaude()` (calcula status verde/amarelo/laranja/vermelho combinando progresso e prazo) e `OBRA_STATUS_LABELS`
- `lib/gastos.ts` — `agruparGastosPorSemana()` (usado pelo gráfico)
- API routes: `/api/clientes`, `/api/obras` (GET/POST), `/api/obras/[id]` (GET/PATCH/DELETE), `/api/gastos` (POST — recalcula `obra.progresso` numa transação)
- Componentes: `ObraCard`, `ObraForm` (react-hook-form + zod, usado em nova/editar), `ClienteSelect` (cadastro inline de cliente via modal), `GastoModal`, `GastosChart` (Recharts), `ObraStatusSelect` (edição inline), `ObrasFiltros`
- Páginas: `/obras` (grid com filtros por status/cliente/busca), `/obras/nova`, `/obras/[id]` (dashboard da obra com KPIs, gráfico, gastos recentes), `/obras/[id]/editar`
- Fluxo completo testado via Playwright: criar obra → ver detalhe → adicionar gasto → progresso recalculado → aparece na listagem. Testado também em viewport mobile (375-390px).

### Notas técnicas importantes (adicionais à Fase 1)
- **Prisma 7 exige driver adapter mesmo em setup padrão** (diferente do que a doc do Prisma sugeria): `lib/prisma.ts` usa `@prisma/adapter-pg` (`PrismaPg`) com `connectionString: process.env.DATABASE_URL`, não apenas `new PrismaClient()`.
- **`@base-ui/react` Select não resolve automaticamente o rótulo do item selecionado** a partir dos `<SelectItem>` declarados via JSX (diferente do Radix). Sempre passar a prop `children` do `SelectValue` como função: `<SelectValue>{(value) => LABEL_MAP[value]}</SelectValue>` — do contrário o trigger mostra o valor bruto (ex: "EM_ANDAMENTO" em vez de "Em Andamento").
- **`Button` do base-ui precisa de `nativeButton={false}`** quando composto com `render={<Link />}` (ou qualquer elemento que não seja `<button>`), senão gera warning de acessibilidade. Isso já foi resolvido de forma centralizada em `components/ui/button.tsx` (detecta `render` e desliga `nativeButton` automaticamente).
- **`components/ui/input.tsx` e `components/ui/textarea.tsx` precisaram de `React.forwardRef`** (o gerado pelo CLI não encaminhava ref) — sem isso, `react-hook-form`'s `register()` não conseguia ler o valor dos campos no submit (bug real encontrado ao testar o formulário de nova obra: campos aparentavam preenchidos na tela mas o Zod recebia `undefined`).
- **Zod `z.coerce.number()` / `z.coerce.date()` exigem o padrão de 3 genéricos do react-hook-form**: `useForm<InputType, unknown, OutputType>()` (usando `z.input<>`/`z.output<>` do schema), senão o TypeScript não fecha os tipos entre o que o formulário guarda (strings) e o que o `onSubmit` recebe (number/Date).
- **Uma função utilitária pura não pode ser exportada de um arquivo `"use client"` e chamada num Server Component** — o Next.js substitui todos os exports desse módulo por referências de cliente ao atravessar a fronteira, e a chamada falha em runtime com "is not a function". `agruparGastosPorSemana` foi movida para `lib/gastos.ts` (sem `"use client"`); o componente `GastosChart.tsx` só re-exporta o tipo.

## Fase 3 — Controle Financeiro (concluída)

### Decisão de schema (comunicada, não perguntada antes de agir)
O mega prompt pede uma aba "Entradas" (receitas recebidas do cliente por obra) na Fase 3, mas o schema original só tinha `Pagamento` (reservado para a Fase 5 — pagamentos semanais a fornecedores/mão de obra, com status Pendente/Efetuado/etc). Para não misturar os dois conceitos, foi criado um novo model `Entrada` (espelhando `Gasto`: obraId, descricao, valor, data, comprovante, observacao). Migração `20260908205111_add_entrada`.

### Concluído
- `lib/financeiro.ts` — `calcResumoFinanceiro()`, `getPeriodoRange()` (mês/trimestre/ano/todos)
- `lib/gastos.ts` — `agruparPorSemanaComItens()` (genérico, usado pela Agenda de Gastos)
- `GASTO_CATEGORIA_LABELS` centralizado em `lib/obra.ts` (estava duplicado em 2 arquivos)
- API routes: `/api/entradas` (GET/POST), `/api/contratos` (GET/POST)
- `/financeiro` com 4 abas (shadcn Tabs): Resumo (KPIs + gráfico de barras orçamento/gasto por obra colorido pela saúde + donut por categoria), Agenda de Gastos (itemizado por semana), Entradas (tabela + modal de cadastro), Contratos (tabela + modal de cadastro — upload de PDF fica desabilitado até o Supabase Storage ser conectado, com aviso visual disso)
- Filtro por obra e por período, sincronizado com a URL (`FinanceiroFiltros`)
- Testado ponta a ponta via Playwright: criação de obras/gastos com categorias variadas, navegação entre as 4 abas, cadastro de entrada — tudo funcionando e persistindo corretamente

### Bugs reais encontrados e corrigidos nesta fase
- **`components/ui/tabs.tsx` (gerado pelo shadcn) tinha um bug de CSS**: usava a variante Tailwind `data-horizontal:`/`group-data-horizontal/tabs:` (que procura um atributo booleano `data-horizontal`), mas o base-ui na verdade define `data-orientation="horizontal"`. Como os nomes nunca batiam, os Tabs sempre renderizavam na orientação errada (lista de abas em coluna vertical ao invés de uma barra horizontal). Corrigido trocando para a sintaxe `data-[orientation=horizontal]:` / `group-data-[orientation=horizontal]/tabs:` em todo o arquivo. Também fazia falta repassar a prop `orientation` de fato para o `TabsPrimitive.Root` (só o atributo decorativo `data-orientation` estava sendo setado).
- O gráfico de donut (Recharts `Pie`) parecia mostrar só uma fatia parcial em capturas de tela feitas com pouco tempo de espera — na verdade é só a animação de entrada (~1-2s); não é um bug.

### Simplificação assumida (não bloqueante)
- As tabelas de Agenda de Gastos / Entradas / Contratos usam `<Table>` com scroll horizontal em telas pequenas, em vez de virarem cards empilhados como o restante do sistema. Isso diverge da regra de UX do mega prompt ("nunca tabela pura em mobile"); left como está por ora para não expandir o escopo da fase — pode virar um ajuste de polimento futuro se desejado.

## Fase 4 — Inventário (concluída)

### Concluído
- `lib/inventario.ts` — `calcStatusEstoque()` (Baixo quando restante < 20% do comprado) e `sugerirEstoqueMinimo()` (heurística local simples: 20% da quantidade comprada — a versão baseada em histórico real de consumo fica para a Fase 6/IA)
- API routes: `/api/itens-inventario` (GET/POST — catálogo de itens), `/api/inventario` (GET/POST — entrada de estoque por obra, faz *upsert* respeitando a constraint única `obraId+itemId`, somando a quantidade se já existir), `/api/inventario/baixa` (POST — registra uso, valida que não ultrapassa o restante)
- `/inventario`: KPIs (Total de Itens do catálogo / Valor Total do Inventário / Itens com Estoque Baixo), tabela completa (Nome, Qtd Comprada, Qtd Usada, Qtd Restante, Unidade, Local, Valor Unitário, Valor Total, Status), filtro por local (sincronizado com a URL) e seção "Locais de Armazenamento" no rodapé
- `InventarioModal` — adiciona item ao estoque de uma obra; permite selecionar um item já cadastrado ou criar um novo inline (mesmo formulário, sem dialog aninhado) com sugestão automática de estoque mínimo conforme a quantidade digitada
- `BaixaEstoqueModal` — registra baixa de um item específico (obra + item), com validação de quantidade máxima
- Testado ponta a ponta via Playwright: criar obra → cadastrar item novo com 100 unidades → dar baixa de 90 → status muda para "Baixo" automaticamente, KPIs e resumo por local corretos

## Fase 5 — Pagamentos Semanais & Usuários (concluída)

### Concluído
- `lib/pagamentos.ts` — rótulos/variantes de status, `getPagamentoStatusEfetivo()` (um pagamento Pendente/Em Processamento cujo vencimento já passou é exibido como "Atrasado" automaticamente, sem precisar de um job/cron para reescrever o status gravado) e helpers de semana (`getInicioSemana`, `formatIntervaloSemana`, domingo-a-sábado, mesmo padrão usado na Agenda de Gastos)
- API routes: `/api/pagamentos` (GET com filtro por obra/status/semana, POST), `/api/pagamentos/[id]` (PATCH — muda status; ao marcar Efetuado grava `dataPagamento`), `/api/usuarios/[id]` (PATCH — altera `role` e/ou `status`)
- `/pagamentos`: navegação de semana (anterior/próxima), 6 KPIs (Total da Semana / Pendente / Efetuado / Em Processamento / Atrasado / Cancelado), filtros por obra e status, tabela com ações inline por linha (marcar como pago, marcar em processamento, cancelar) e modal de novo pagamento
- `/usuarios` (visível só para ADMIN no menu, mesma checagem de role já usada na Sidebar desde a Fase 1): tabela com nome/e-mail/perfil/status, select de perfil editável inline, botões de aprovar/desativar/reativar
- Testado ponta a ponta via Playwright: pagamento criado → marcado como pago → some do menu de ações (já não faz sentido "marcar como pago" de novo); usuário aprovado e perfil alterado

### Observação sobre dados de teste
- Não existe (nem foi pedido) um fluxo de criação de usuário na UI — usuários chegam pela Fase 1 (registro + aprovação do admin), que depende do Supabase Auth estar conectado. Para testar `/usuarios` agora, os registros foram inseridos diretamente no banco local via um script Prisma descartável (não commitado). Quando o Supabase for conectado, isso passa a acontecer de verdade pelo fluxo de `/registro`.

## Próximas fases (ainda não iniciadas)
- Fase 6 — Inteligência Artificial
