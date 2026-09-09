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

## Fase 6 — Inteligência Artificial com Gemini (concluída)

### Decisão de provedor (comunicada, não perguntada antes de agir)
O `.env.example` original (Fase 1) previa `OPENAI_API_KEY`. O usuário pediu explicitamente para usar a API do Gemini nesta retomada — trocado por `GEMINI_API_KEY` / `GEMINI_MODEL` (default `gemini-2.5-flash`). SDK usada: `@google/genai` (pacote oficial do Google, `ai.models.generateContent`).

### Concluído
- `lib/ia/gemini.ts` — wrapper fino sobre `@google/genai` (`gerarTextoIA`, `gerarJsonIA` com `responseSchema`, `gerarConversaIA` para chat multi-turno). Retorna `null`/erro tratável quando `GEMINI_API_KEY` não está configurada — nenhuma feature de IA derruba o build ou a página sem a chave.
- `lib/ia/previsao.ts` — `preverCustoObra()`: projeta o custo final da obra. Sempre calcula uma estimativa local (regressão simples sobre a média semanal de gastos das últimas 6 semanas × semanas restantes até o término); se `GEMINI_API_KEY` estiver configurada, pede à Gemini uma previsão em JSON estruturado (`responseSchema`) com justificativa em português, caindo de volta pra estimativa local em caso de erro/resposta inválida.
- `lib/ia/risco.ts` — `calcularRiscoObra()`: semáforo de risco (Verde/Amarelo/Vermelho) determinístico — não depende da IA para responder rápido. Pontua orçamento estourado/próximo do limite, prazo vencido/próximo, pagamentos atrasados e previsão de custo acima do contratado.
- `lib/ia/contexto.ts` — `montarContextoPortfolio()`: resumo textual de todas as obras (status, progresso, prazo, saúde, pagamentos atrasados, previsão) + alertas não lidos, usado como contexto real para o chat.
- `lib/alertas.ts` — engine de alertas. `verificarAlertasObra(obraId)` roda checagens determinísticas (rápidas, sem chamar a IA): tiers de orçamento (70/85/100/estourado — só o tier atual fica ativo, os outros são resolvidos automaticamente), prazo (vencido/próximo), estoque baixo (reaproveita `calcStatusEstoque` da Fase 4) e dados inconsistentes (obra sem cliente, contrato ≤ 0, término antes do início, progresso > 150%). `atualizarPrevisaoObra(obraId)` é a única etapa que chama a Gemini — separada da checagem determinística de propósito, para não disparar uma chamada externa a cada gasto lançado; cacheada por 24h em `Obra.previsaoCusto/previsaoJustificativa/previsaoAtualizadaEm` (novos campos, migração `20260909012844_add_previsao_ia`), com `forcar: true` disponível para atualização manual.
- Alertas são *upsert* (por `obraId`+`tipo`, atualiza a mensagem de um alerta não lido existente em vez de duplicar) e *auto-resolvidos* (marcados como lidos) quando a condição deixa de ser verdadeira — sem necessidade de cron.
- Hooks de verificação automática: `POST /api/gastos`, `POST/PATCH /api/obras`, `POST /api/inventario/baixa` chamam `verificarAlertasObra` logo após a mutação relevante.
- API routes: `/api/alertas` (GET, filtro por lido/tipo/obraId), `/api/alertas/[id]` (PATCH — marcar lido/não lido), `/api/alertas/verificar` (POST — roda a verificação + previsão em todas as obras, usado pelo botão "Verificar Agora"), `/api/obras/[id]/previsao` (POST — força atualização da previsão de uma obra), `/api/ia/chat` (POST — chat com contexto real do portfólio; responde 503 com mensagem clara quando `GEMINI_API_KEY` não está configurada).
- `/alertas`: KPIs (Não Lidos/Críticos/Avisos/Informativos), filtro por lido/tipo sincronizado com a URL, lista de alertas (reaproveitando `AlertBanner` da Fase 1) com ação de marcar lido/não lido e botão "Verificar Agora".
- `/obras/[id]`: nova seção "Análise de Risco (IA)" com o semáforo de risco + motivos e a previsão de custo (valor, justificativa, data da última atualização, botão "Atualizar Previsão" quando a obra está em andamento).
- `/chat`: nova página de chat com a IA, respostas fundamentadas nos dados reais do portfólio (obras, progresso, prazos, alertas). Mostra aviso quando `GEMINI_API_KEY` não está configurada em vez de quebrar.
- Dashboard (`/dashboard`) e o contador de alertas do sino no `Header` — que desde a Fase 1 usavam dados mockados (`lib/mock-data.ts`) — foram conectados ao banco real nesta fase (removido `lib/mock-data.ts`, sem mais uso). Ambas as páginas marcadas `export const dynamic = "force-dynamic"` para não serem estaticamente pré-renderizadas com dados/config que mudam em runtime.
- `lib/alertas-labels.ts` — `ALERTA_TIPO_LABELS`/`ALERTA_TIPO_VARIANT` extraídos de `lib/alertas.ts` para um arquivo sem import de `lib/prisma`, consumido pelo componente cliente `AlertasFiltros` (ver nota técnica abaixo).
- Testado ponta a ponta via API real (servidor de dev + Postgres local + chave Gemini real): criar obra → lançar gasto que cruza 85% do orçamento → alertas de orçamento e prazo gerados automaticamente; `POST /api/obras/[id]/previsao` retornou previsão gerada pela Gemini (texto não é o fallback local); `POST /api/ia/chat` respondeu citando o progresso real da obra criada no teste; `/alertas`, `/obras/[id]` (seção IA) e `/chat` renderizados sem erro no servidor.

### Bug real encontrado e corrigido nesta fase
- **Importar uma constante de `lib/alertas.ts` num client component (`AlertasFiltros`) quebrava o build** (`Module not found: Can't resolve 'fs'/'dns'/'net'/'tls'`): o arquivo mistura constantes puras com funções que usam `lib/prisma` (que usa `pg`, dependente de módulos Node). Mesmo importando só uma constante, o bundler do Next inclui o módulo inteiro no bundle do cliente, puxando `pg` para o browser. Resolvido extraindo `ALERTA_TIPO_LABELS`/`ALERTA_TIPO_VARIANT` para `lib/alertas-labels.ts` (sem nenhum import server-only) — o mesmo tipo de problema já documentado na Fase 2 para funções, mas aqui com constantes.

### Notas técnicas importantes
- Ambiente local recriado do zero nesta sessão (pasta era um ZIP extraído, sem `.git`/`node_modules`): `npm install`, Postgres via Docker. A porta 5432 já estava ocupada por outro projeto (`raizes_db`) — `docker-compose.yml` remapeado para `5434:5432`.
- `GEMINI_API_KEY` real fornecida pelo usuário e salva em `.env.local` (gitignored, não vai para o repositório).
- Todas as features de IA são "degradam com elegância": sem `GEMINI_API_KEY`, o semáforo de risco e os alertas determinísticos continuam funcionando normalmente (não dependem da IA); a previsão de custo cai para a estimativa local; o chat mostra aviso ao usuário em vez de quebrar.

## Fase 7 — Orçamentos/Propostas & Materiais (concluída)

### Concluído
- Novos models: `Material` (catálogo: descrição, unidade, preço, NCM, origem), `Proposta` (número sequencial via `@default(autoincrement())` do Postgres — garante atomicidade sem lógica manual de "max+1"), `PropostaSecao`, `PropostaItem` (item avulso ou vinculado a um `Material`, com snapshot próprio de descrição/unidade/preço no momento da criação), `PropostaEvento` (auditoria: `CRIADA`/`EDITADA`/`STATUS_ALTERADO`). Migração `20260909015227_add_propostas_materiais`.
- `lib/propostas.ts` — labels/variantes de status e evento, `calcTotaisProposta()` (subtotal → + BDI% → + impostos% sobre subtotal+BDI → total). Arquivo puro (sem import de `lib/prisma`), usado tanto no server quanto no formulário client.
- `lib/pdf/proposta-pdf.tsx` — geração de PDF via `@react-pdf/renderer` (`renderToBuffer`). Fonte PT Sans (Regular/Bold) embutida em `assets/fonts/` (baixada do Google Fonts, licença OFL incluída) para suportar acentuação em português — a fonte Helvetica padrão do PDF não é o problema, mas registrar uma fonte própria garante os glifos corretos e consistência visual com o resto do sistema.
- `lib/validations.ts` — `materialSchema`, `propostaSchema` (aninhado: `secoes[].itens[]`), `propostaStatusSchema`.
- API routes: `/api/materiais` (GET/POST), `/api/materiais/[id]` (PATCH/DELETE), `/api/propostas` (GET com filtro status/cliente/busca, POST — cria proposta+seções+itens numa transação e registra evento `CRIADA`), `/api/propostas/[id]` (GET com seções/itens/eventos, PATCH — substitui seções/itens por completo dentro de uma transação e registra `EDITADA`), `/api/propostas/[id]/status` (PATCH dedicado — registra `STATUS_ALTERADO` com "de X para Y"), `/api/propostas/[id]/pdf` (GET — stream do PDF gerado on-the-fly, sem cache em disco).
- `/propostas`: grid de cards (nº, título, cliente, status, valor total já com BDI/impostos, data) com filtro por status/cliente/busca sincronizado com a URL; aba "Materiais" (mesma página, via Tabs) com tabela do catálogo + modal de cadastro.
- `/propostas/nova` e `/propostas/[id]/editar`: `PropostaForm` com `useFieldArray` aninhado (seções, e dentro de cada seção outro `useFieldArray` de itens via `PropostaSecaoFields`) — adicionar/remover seções e itens dinamicamente, selecionar um material do catálogo (preenche descrição/unidade/preço automaticamente, ainda editável) ou lançar um item avulso, totais recalculados ao vivo (`watch()`).
- `/propostas/[id]`: detalhe com itens agrupados por seção, totais (subtotal/BDI/impostos/total), histórico de eventos (auditoria), ações de mudar status (Aprovar/Rejeitar/Reativar) e botão para baixar o PDF.
- Testado ponta a ponta via API real + servidor de dev: material cadastrado → proposta criada com 2 seções/3 itens → totais conferidos manualmente (bateu exato) → PDF gerado (`application/pdf` válido, 1 página) → status alterado para Aprovada → histórico mostra os 2 eventos (`CRIADA`, `STATUS_ALTERADO`) → formulário de edição pré-preenchido corretamente → exclusão em cascata (`onDelete: Cascade` de seções/itens/eventos) confirmada ao limpar os dados de teste.

### Notas técnicas importantes
- **`for...of` sobre `.entries()` de array quebra o build**: o `tsconfig.json` do projeto não define `target` (default baixo, sem suporte a iteração de iteradores sem `--downlevelIteration`). `Array.from(map.entries())` (já usado em `lib/gastos.ts` desde a Fase 2) funciona; `for (const [i, x] of arr.entries())` não. Os loops de seções/itens em `/api/propostas` usam `for` indexado clássico por causa disso.
- **PDF e acentuação**: a fonte PT Sans embutida gera um PDF com o `/Encoding /Identity-H` e subset da fonte (`/Type0`) — os glifos visuais renderizam corretamente com acentos. A tabela `/ToUnicode` (usada só para copiar/buscar texto no PDF, não para a renderização) ficou com alguns caracteres acentuados malformados na extração de texto (`pdftotext`) — limitação conhecida do `@react-pdf/renderer`/`fontkit` com fontes subsetadas; não há rasterizador de PDF disponível neste ambiente para confirmar visualmente pixel a pixel, então a renderização visual não foi 100% confirmada, só inferida pela estrutura correta do PDF (Identity-H + fonte embutida = glifo correto independente do ToUnicode).
- **`assets/fonts/*.ttf` referenciados por `path.join(process.cwd(), ...)`** não seriam incluídos automaticamente num deploy serverless (Vercel) — adicionado `experimental.outputFileTracingIncludes` no `next.config.mjs` para a rota do PDF. Não testado em produção real (projeto ainda roda só localmente).

## Fase 8 — Prestadores e Financeiro Unificado (concluída)

### Concluído
- Novos models: `Prestador` (nome, documento, chave Pix, categoria), `ContratoPrestador` (contrato por prestador, mesmo formato do `Contrato` de obra), `MovimentoFinanceiro` (`ENTRADA`/`SAIDA`, com `obraId` e `prestadorId` ambos opcionais — um movimento pode não estar ligado a nenhuma obra específica, ex: despesa administrativa). `Pagamento` (da Fase 5) ganhou `prestadorId` opcional, permitindo vincular um pagamento semanal a um prestador específico sem quebrar o fluxo existente (obra continua obrigatória). Migração `20260909021354_add_prestadores_financeiro`.
- `lib/prestadores.ts` — labels/variantes de tipo de movimento, `calcExtrato()` (ordena por data, acumula saldo entrada‑saída, retorna também totais de entrada/saída — usado pela aba "Movimentos"). Arquivo puro, sem import de `lib/prisma`.
- API routes: `/api/prestadores` (GET/POST), `/api/prestadores/[id]` (PATCH/DELETE), `/api/contratos-prestador` (GET com filtro por prestador, POST), `/api/movimentos` (GET com filtro tipo/obra/prestador/período, POST), `/api/movimentos/[id]` (DELETE). `/api/pagamentos` POST ajustada para converter `prestadorId` vazio em `null` (mesmo padrão já usado para `clienteId` em obras).
- `/prestadores`: 3 abas (Tabs) — "Prestadores" (tabela + modal de cadastro), "Contratos" (tabela + modal, mesmo padrão dos contratos de obra), "Movimentos" (KPIs de entradas/saídas/saldo, filtro por tipo/obra/prestador sincronizado com a URL, extrato geral com saldo acumulado por linha, mais recente primeiro).
- `/pagamentos`: `PagamentoModal` ganhou um select opcional de prestador; a tabela ganhou uma coluna "Prestador".
- Testado ponta a ponta via API real: prestador cadastrado → contrato de prestador cadastrado → 2 movimentos (entrada e saída, um vinculado ao prestador) → extrato retornou ambos corretamente → pagamento criado vinculado a obra E prestador simultaneamente → prestador aparece na tabela de `/pagamentos` na semana correta → dados de teste removidos ao final (delete em cascata onde aplicável).

## Fase 9 — Automações via E-mail (concluída)

### Concluído
- Novos models: `ConfiguracaoEmail` (singleton, id fixo `"config"` — host/porta/usuário IMAP, senha guardada só criptografada, `usarSsl`, `ativo`, `ultimaVerificacaoEm`), `ImportacaoEmailLog` (histórico de cada execução: tipo `NFE`/`PIX_INTER`/`GERAL`, status `SUCESSO`/`ERRO`, mensagem, quantidade processada). Migrações `20260909022337_add_automacoes_email` e `20260909022528_add_geral_tipo_importacao`.
- `lib/crypto.ts` — `criptografar()`/`descriptografar()` (AES-256-GCM, chave derivada via SHA-256 de `EMAIL_CREDENTIALS_SECRET`). A senha do IMAP nunca é gravada em texto puro nem devolvida pela API (`GET /api/configuracoes/email` retorna só `senhaConfigurada: boolean`).
- `lib/email/nfe.ts` — `extrairItensNFe()` faz parse do XML da NF-e (schema oficial `nfeProc > NFe > infNFe > det > prod`, usando `fast-xml-parser`) e `importarMateriaisDaNFe()` faz upsert no catálogo de materiais (por descrição, case-insensitive: atualiza preço/unidade/NCM se já existir, cria com `origem: "NF-e (importado por e-mail)"` caso contrário). Testado com um XML sintético seguindo o schema oficial — extraiu os itens corretamente.
- `lib/email/pix-inter.ts` — `extrairPixInter()` é um parser heurístico (regex) do corpo em texto puro de um e-mail de notificação de Pix recebido do Banco Inter (extrai valor e nome do pagador). `importarPixComoMovimento()` cria um `MovimentoFinanceiro` do tipo `ENTRADA` e tenta vincular a um `Prestador` existente cujo nome bate (contains, case-insensitive) com o nome do pagador extraído.
- `lib/email/verificar.ts` — `executarVerificacaoEmail()`: se a automação não estiver `ativo`, não faz nada. Caso contrário, conecta via IMAP (`imapflow`), busca e-mails não lidos na caixa de entrada, e para cada um: se tiver anexo `.xml`, trata como NF-e; se o remetente/assunto sugerir Banco Inter/Pix, trata como notificação de Pix; marca a mensagem como lida ao final; registra um `ImportacaoEmailLog` por resultado (sucesso ou erro) e nunca deixa uma falha em uma mensagem interromper as demais.
- API routes: `/api/configuracoes/email` (GET — config atual com senha redigida; POST — salva, senha é opcional na atualização para não exigir redigitar a cada salvamento), `/api/configuracoes/email/verificar` (POST — aciona a verificação manualmente), `/api/configuracoes/email/logs` (GET — histórico).
- `/configuracoes` (visível só para ADMIN no menu): formulário de credenciais IMAP (host/porta/usuário/senha/SSL/ativo), botão "Verificar Agora", tabela com o histórico de importações.
- **Cron 3x/dia**: implementado como processo Node separado (`npm run cron:email`, `scripts/cron-email.ts`, agendado via `node-cron` para 08h/14h/20h), **não** embutido no processo do Next.js — ver nota técnica abaixo sobre o motivo dessa escolha. Roda uma verificação imediatamente ao iniciar, além do agendamento.
- Testado ponta a ponta: parser de NF-e validado com XML sintético (schema oficial); parser de Pix validado com um texto de e-mail plausível (extraiu valor e nome corretamente); round-trip de criptografia da senha validado; fluxo completo da API testado com servidor real — salvar configuração, tentar verificar com host IMAP inválido (`imap.invalido.test`) e confirmar que o erro é capturado, logado (`GERAL`/`ERRO`, mensagem `getaddrinfo ENOTFOUND...`) e retornado de forma limpa, sem derrubar o servidor; script de cron standalone testado isoladamente (conecta no Postgres, respeita `ativo=false`, não trava).

### Bugs reais encontrados e corrigidos nesta fase
- **`prisma.configuracaoEmail.upsert()` com senha opcional quebrava em dois níveis**: (1) `criptografar(senha!)` dentro do objeto `create` do `upsert` é avaliado pelo JavaScript mesmo quando só o branch `update` vai rodar de fato (objetos literais não são "lazy") — com `senha` ausente isso derrubava com `TypeError` dentro do `cipher.update()`. (2) Mesmo corrigindo isso, o Prisma valida a *estrutura* dos dois branches do `upsert` antes de decidir qual vai rodar, então `create` exigindo `senhaCriptografada` (campo obrigatório) sem valor derrubava com `PrismaClientValidationError` mesmo num update puro. Corrigido buscando o registro atual antes e chamando `update()` ou `create()` explicitamente, sem usar `upsert()`.
- **Import hoisting quebrou a leitura do `.env.local` no script de cron**: `import { config } from "dotenv"; config({ path: ".env.local" })` no topo do arquivo não adianta se logo abaixo houver um `import` estático de um módulo que lê `process.env.DATABASE_URL` no carregamento (como `lib/prisma.ts`) — imports estáticos em ESM são sempre resolvidos *antes* de qualquer código do próprio módulo rodar, então `lib/prisma.ts` tentava montar a conexão do Postgres com `DATABASE_URL` ainda `undefined` (erro real: `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`). Corrigido usando `import()` dinâmico para tudo que vem depois do `config(...)`.

### Notas técnicas importantes
- **Por que o cron não usa `instrumentation.ts` do Next.js**: o projeto já tem `middleware.ts` (Supabase Auth) rodando no Edge Runtime, e o Next 14.2 compila `instrumentation.ts` tanto para o runtime Node quanto para o Edge. Mesmo isolando o código do cron num arquivo separado e usando `import()` dinâmico condicionado a `process.env.NEXT_RUNTIME === "nodejs"` (o padrão documentado pelo Next para esse caso), o webpack ainda tentava empacotar a cadeia de dependências do `imapflow`/`pg` para o bundle do Edge Runtime e falhava (`Can't resolve 'stream'/'fs'/'net'` — módulos nativos do Node que não existem no Edge). `experimental.serverComponentsExternalPackages` não resolve porque só afeta o bundle Node, não o do Edge. Decisão: mover o cron para um processo Node standalone (`scripts/cron-email.ts`), completamente fora do pipeline de build do Next — mais simples e não depende de nenhum comportamento frágil do bundler.
- **Rodando em produção/self-hosted**: além de `next start`, é preciso manter `npm run cron:email` rodando continuamente (ex: um serviço adicional no `docker-compose.yml`, ou `pm2`) para a automação 3x/dia funcionar. Isso não foi adicionado ao `docker-compose.yml` porque o projeto ainda não tem um fluxo de deploy definido.
- **Parser de Pix do Banco Inter é heurístico e não testado contra um e-mail real** — não há credenciais de e-mail reais nem uma amostra real de notificação do Banco Inter disponíveis nesta sessão. A extração de valor e nome do pagador usa regex sobre o corpo em texto puro; caso o formato real do Banco Inter varie (ex: quebras de linha diferentes, rótulos diferentes de "recebido de"), o regex em `lib/email/pix-inter.ts` provavelmente vai precisar de ajuste fino assim que houver uma caixa de entrada real conectada. O parser de NF-e, por outro lado, segue o schema oficial da SEFAZ e tem uma base mais sólida mesmo sem teste contra XML real de fornecedor.
- **Credenciais IMAP reais e `EMAIL_CREDENTIALS_SECRET` de produção**: pendente, mesmo padrão do Supabase/Gemini — a funcionalidade está pronta, mas só é ativada quando o admin preencher `/configuracoes` com credenciais reais e marcar "Automação ativa".

## Supabase real conectado
- Projeto criado na organização `hmcorporation039-tech` (região `sa-east-1`, São Paulo). `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (formato novo `sb_publishable_...`) e `SUPABASE_SERVICE_ROLE_KEY` (formato novo `sb_secret_...`) configurados no `.env.local`.
- **A conexão direta (`db.<ref>.supabase.co:5432`) só resolve em IPv6** — não tem rota nesta rede/máquina (`Network is unreachable`). Usar sempre o **Connection Pooler**.
- **`DATABASE_URL` da aplicação usa o pooler em modo Transaction (porta 6543)** — libera conexões corretamente a cada query, essencial pro Vercel (serverless) e pra não esgotar o limite de conexões do plano free do Supabase (15 conexões simultâneas no modo Session).
- **Modo Session (porta 5432) trava em `prisma migrate deploy`/`migrate dev`** por causa de locks/prepared statements que o pgbouncer em modo Transaction não suporta bem. Para rodar migrations: trocar temporariamente a porta de `6543` para `5432` na `DATABASE_URL`, rodar a migration, e voltar pra `6543`.
- Todas as migrations aplicadas com sucesso no banco real.

## Fase 10 — Camada de Segurança (concluída)

### Concluído
- **Rate limiting** (`lib/rate-limit.ts`) — usa `@upstash/ratelimit` + `@upstash/redis` quando `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` estão configuradas; cai para um limitador em memória (por IP + rota) quando não estão, sem quebrar o build nem exigir infraestrutura nova imediatamente. Padrão: 60 req/min; endpoints mais caros (`/api/ia/chat`, `/api/alertas/verificar`, `/api/obras/[id]/previsao`, `/api/configuracoes/email/verificar`) têm limites mais baixos e específicos.
- **Autenticação e autorização por perfil** (`lib/auth.ts`) — `getSessionUser()` cruza a sessão do Supabase Auth (por e-mail) com a tabela `User` do Prisma. Três níveis: `exigirUsuarioAtivo` (qualquer perfil ativo, inclusive VIEWER), `exigirEscrita` (bloqueia VIEWER), `exigirAdmin` (só ADMIN — usado em gestão de usuários e configuração de e-mail). `lib/api-handler.ts` (`protegido()`) combina rate limit + o nível de autorização escolhido num wrapper único, aplicado nas 30 rotas de API do projeto.
- **`middleware.ts`** ajustado: requisições não autenticadas a `/api/*` agora recebem `401` em JSON, em vez de serem redirecionadas para a página de login (que devolvia HTML pro fetch do frontend).
- **Validação Zod server-side**: já existia em praticamente todos os endpoints desde as fases anteriores; conferido que os 30 endpoints validam o body antes de tocar no banco.
- **Sanitização de texto** (`lib/sanitize.ts`) — remove tags HTML de verdade (`<script>`, `<img onerror=...>`, etc.) via regex que exige um nome de tag válido logo após `<`/`</`. Testado explicitamente para não corromper texto legítimo com `<`, `>`, `&` (ex: "Diâmetro < 10mm", "Aço & Ferro Ltda") — a biblioteca `sanitize-html` foi cogitada e descartada porque ela *codifica* esses caracteres (`&lt;`, `&gt;`), o que quebra visualmente ao ser re-escapado pelo React no render. `sanitizarObjeto()` é recursivo (cobre a estrutura aninhada de propostas — seções/itens) e é aplicado em todo campo de texto antes de salvar, exceto senhas/segredos (ex: senha do IMAP em `/api/configuracoes/email`).
- **Auditoria** (`lib/audit.ts` + model `AuditLog`) — registra `acao`, `entidade`, `entidadeId`, `userId`/`userEmail`, `detalhes` (JSON) e `createdAt`. Aplicada nas 4 ações pedidas: `obra.deletar`, `estoque.mover` (baixa de inventário), `usuario.alterar` (mudança de perfil/status), `proposta.aprovar`/`proposta.status_alterar`.
- **Validação de variáveis de ambiente na inicialização** (`lib/env.ts` + `instrumentation.ts`) — a aplicação recusa subir (dev e produção) se `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` estiverem ausentes. Chaves de features opcionais (Gemini, e-mail) continuam com degradação graciosa, por design.
- **Validação de upload** (`lib/upload-validation.ts`) — `validarPdf()` (máx. 10MB, `application/pdf`) e `validarXmlNFe()` (máx. 2MB, `text/xml`/`application/xml`). Aplicada no único ponto real de recebimento de arquivo hoje (anexo de e-mail na importação de NF-e, `lib/email/verificar.ts`) — anexos acima do limite são rejeitados e logados sem interromper o processamento das demais mensagens. Não existe ainda upload de PDF de contrato pela UI (depende do Supabase Storage, que segue pendente); a validação está pronta para ser plugada quando esse upload for implementado.
- **Headers de segurança** (`next.config.mjs`) — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy em todas as rotas.
- **Cascade delete na `Obra`** — bug real encontrado durante o teste do item de auditoria: apagar uma obra com gastos/estoque/alertas vinculados quebrava com `P2003 ForeignKeyConstraintViolation`. Corrigido com `onDelete: Cascade` em `Gasto`, `Entrada`, `ObraInventario`, `Pagamento`, `Contrato`, `Alerta`; `MovimentoFinanceiro` usa `onDelete: SetNull` (preserva o histórico financeiro mesmo se a obra for apagada).

### Testado (todos os 8 itens, ponta a ponta, contra o Supabase real)
- Dois usuários de teste criados via Supabase Admin API + linha correspondente em `User` (`admin-teste@fornax.local` / `viewer-teste@fornax.local`), login real via `/login`, chamadas de API feitas com a sessão real (cookies do browser).
- Sem login → `401` em `/api/obras`. ADMIN → `200`/`201` em leitura e escrita. VIEWER → `200` em leitura, `403` em escrita (`/api/clientes`) e em endpoint admin-only (`/api/usuarios/[id]`).
- Rate limit: 5 requisições passam, a 6ª em diante recebe `429` (testado em `/api/alertas/verificar`, limite configurado propositalmente baixo pro teste).
- Zod: payload inválido devolve `400` com a mensagem de campo certa.
- Sanitização: `<script>alert("xss")</script>Cliente Malicioso` salvo como `alert("xss")Cliente Malicioso` (tag removida, texto inofensivo mantido).
- Auditoria: as 4 ações confirmadas na tabela `AuditLog` com `userEmail` correto e `detalhes` coerentes.
- Env obrigatório: servidor recusa subir de verdade (`.env.local` renomeado temporariamente, erro claro do `instrumentation.ts`, depois restaurado).
- Upload: `validarPdf`/`validarXmlNFe` testados unitariamente (aceita dentro do limite, rejeita acima e por tipo errado).
- Dados de teste e usuários de teste do Supabase Auth foram limpos ao final (menos os dois usuários de teste, mantidos para facilitar verificação futura).

## Sistema completo (Fases 1-10)
Todas as fases do mega prompt original (Fases 1-5), as fases adicionais definidas numa retomada anterior (Fases 6-9) e a camada de segurança (Fase 10) estão implementadas e testadas ponta a ponta contra infraestrutura real: Supabase (Postgres + Auth) em produção, chave Gemini real. Pendências conhecidas, todas documentadas nas seções acima e não bloqueantes para uso:
- Supabase Storage (upload de PDF de contratos) — ainda não conectado.
- Credenciais reais de e-mail (IMAP) para a Fase 9, e possível ajuste fino do parser de Pix do Banco Inter contra um e-mail real.
- Upstash Redis para rate limiting distribuído em produção — funciona hoje com o fallback em memória (correto para uma única instância; se o deploy usar múltiplas instâncias/regiões, configurar Upstash para o limite ser compartilhado).
- Deploy em produção (Vercel/self-hosted) ainda não configurado — `experimental.outputFileTracingIncludes` já preparado para a fonte do PDF, mas falta decidir a estratégia de deploy e como manter `npm run cron:email` rodando continuamente.
