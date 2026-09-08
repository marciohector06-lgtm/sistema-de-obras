import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FinanceiroFiltros } from "@/components/financeiro/FinanceiroFiltros";
import { OrcamentoGastoChart, type ObraChartData } from "@/components/financeiro/OrcamentoGastoChart";
import { CategoriaDonutChart, type CategoriaChartData } from "@/components/financeiro/CategoriaDonutChart";
import { EntradaModal } from "@/components/financeiro/EntradaModal";
import { ContratoModal } from "@/components/financeiro/ContratoModal";
import { Wallet, TrendingDown, PiggyBank, Building2 } from "lucide-react";
import { formatBRL, formatDateBR } from "@/lib/utils";
import { calcResumoFinanceiro, getPeriodoRange } from "@/lib/financeiro";
import { agruparPorSemanaComItens } from "@/lib/gastos";
import { getObraSaude, GASTO_CATEGORIA_LABELS } from "@/lib/obra";

const SAUDE_HEX: Record<string, string> = {
  success: "#2E7D32",
  warning: "#E65100",
  danger: "#C62828",
  neutral: "#9AA3B2",
};

interface FinanceiroPageProps {
  searchParams: Promise<{ obraId?: string; periodo?: string }>;
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const { obraId, periodo = "todos" } = await searchParams;
  const range = getPeriodoRange(periodo);
  const dataFiltro = range ? { gte: range.inicio, lt: range.fim } : undefined;

  const todasObras = await prisma.obra.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  const obras = await prisma.obra.findMany({
    where: obraId ? { id: obraId } : undefined,
    include: {
      gastos: { where: dataFiltro ? { data: dataFiltro } : undefined },
    },
    orderBy: { nome: "asc" },
  });

  const obrasComTotais = obras.map((obra) => ({
    ...obra,
    valorContratoNum: Number(obra.valorContrato),
    gastoTotal: obra.gastos.reduce((acc, g) => acc + Number(g.valor), 0),
  }));

  const resumo = calcResumoFinanceiro(
    obrasComTotais.map((o) => ({ valorContrato: o.valorContratoNum, gastoTotal: o.gastoTotal }))
  );

  const orcamentoGastoChart: ObraChartData[] = obrasComTotais.map((o) => {
    const saude = getObraSaude({ progresso: Number(o.progresso), dataTermino: o.dataTermino, status: o.status });
    return {
      nome: o.nome,
      orcamento: o.valorContratoNum,
      gasto: o.gastoTotal,
      corSaude: SAUDE_HEX[saude.variant],
    };
  });

  const todosGastos = obrasComTotais.flatMap((o) =>
    o.gastos.map((g) => ({ ...g, obraNome: o.nome }))
  );

  const categoriaTotais = new Map<string, number>();
  for (const g of todosGastos) {
    categoriaTotais.set(g.categoria, (categoriaTotais.get(g.categoria) ?? 0) + Number(g.valor));
  }
  const categoriaChart: CategoriaChartData[] = Array.from(categoriaTotais.entries()).map(
    ([categoria, total]) => ({
      categoria,
      label: GASTO_CATEGORIA_LABELS[categoria as keyof typeof GASTO_CATEGORIA_LABELS],
      total,
    })
  );

  const agendaSemanas = agruparPorSemanaComItens(
    todosGastos.map((g) => ({ ...g, valor: Number(g.valor) }))
  );

  const [entradas, contratos] = await Promise.all([
    prisma.entrada.findMany({
      where: {
        ...(obraId ? { obraId } : {}),
        ...(dataFiltro ? { data: dataFiltro } : {}),
      },
      include: { obra: { select: { nome: true } } },
      orderBy: { data: "desc" },
    }),
    prisma.contrato.findMany({
      where: obraId ? { obraId } : undefined,
      include: { obra: { select: { nome: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Financeiro" />
      <FinanceiroFiltros obras={todasObras} />

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="agenda">Agenda de Gastos</TabsTrigger>
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Orçamento Total" value={formatBRL(resumo.orcamentoTotal)} icon={Wallet} />
            <KpiCard label="Gasto Total" value={formatBRL(resumo.gastoTotal)} icon={TrendingDown} />
            <KpiCard
              label="Saldo Geral"
              value={formatBRL(resumo.saldoGeral)}
              icon={PiggyBank}
              valueClassName={resumo.saldoGeral >= 0 ? "text-success" : "text-danger"}
            />
            <KpiCard label="Total de Obras" value={String(resumo.totalObras)} icon={Building2} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Orçamento vs Gasto" description="Por obra">
              <OrcamentoGastoChart dados={orcamentoGastoChart} />
            </SectionCard>
            <SectionCard title="Distribuição por Categoria" description="Gastos no período selecionado">
              <CategoriaDonutChart dados={categoriaChart} />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="agenda" className="mt-4">
          <SectionCard title="Agenda de Gastos" description="Gastos agrupados por semana">
            {agendaSemanas.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">Nenhum gasto no período selecionado.</p>
            ) : (
              <div className="space-y-6">
                {agendaSemanas.map((semana) => (
                  <div key={semana.chave}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-primary">Semana {semana.label}</p>
                      <p className="text-sm font-medium text-text-secondary">{formatBRL(semana.total)}</p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Obra</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semana.itens.map((gasto) => (
                          <TableRow key={gasto.id}>
                            <TableCell>{gasto.descricao}</TableCell>
                            <TableCell className="text-text-secondary">{gasto.obraNome}</TableCell>
                            <TableCell className="text-text-secondary">
                              {GASTO_CATEGORIA_LABELS[gasto.categoria as keyof typeof GASTO_CATEGORIA_LABELS]}
                            </TableCell>
                            <TableCell className="text-text-secondary">{formatDateBR(gasto.data)}</TableCell>
                            <TableCell className="text-right font-medium">{formatBRL(Number(gasto.valor))}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="entradas" className="mt-4">
          <SectionCard
            title="Entradas"
            description="Receitas recebidas por obra"
            action={<EntradaModal obras={todasObras} />}
          >
            {entradas.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">Nenhuma entrada registrada ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entradas.map((entrada) => (
                    <TableRow key={entrada.id}>
                      <TableCell>{entrada.descricao}</TableCell>
                      <TableCell className="text-text-secondary">{entrada.obra.nome}</TableCell>
                      <TableCell className="text-text-secondary">{formatDateBR(entrada.data)}</TableCell>
                      <TableCell className="text-right font-medium text-success">
                        {formatBRL(Number(entrada.valor))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="contratos" className="mt-4">
          <SectionCard
            title="Contratos"
            description="Documentos vinculados às obras"
            action={<ContratoModal obras={todasObras} />}
          >
            {contratos.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">Nenhum contrato cadastrado ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((contrato) => (
                    <TableRow key={contrato.id}>
                      <TableCell>{contrato.titulo}</TableCell>
                      <TableCell className="text-text-secondary">{contrato.obra.nome}</TableCell>
                      <TableCell className="text-text-secondary">
                        {contrato.dataAssin ? formatDateBR(contrato.dataAssin) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {contrato.valor ? formatBRL(Number(contrato.valor)) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
