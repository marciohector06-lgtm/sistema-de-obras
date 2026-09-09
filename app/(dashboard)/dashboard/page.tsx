import { Wallet, TrendingDown, PiggyBank, Building2, Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GastosChart } from "@/components/obras/GastosChart";
import { prisma } from "@/lib/prisma";
import { getObraSaude } from "@/lib/obra";
import { ALERTA_TIPO_VARIANT } from "@/lib/alertas";
import { agruparGastosPorMes } from "@/lib/gastos";
import { formatBRL, corProgresso } from "@/lib/utils";

function calcularVariacaoMensal(gastos: { data: Date; valor: number }[]) {
  const agora = new Date();
  const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

  let mesAtual = 0;
  let mesAnterior = 0;
  for (const gasto of gastos) {
    if (gasto.data >= inicioMesAtual) mesAtual += gasto.valor;
    else if (gasto.data >= inicioMesAnterior) mesAnterior += gasto.valor;
  }

  if (mesAnterior === 0) return null;

  const percentual = ((mesAtual - mesAnterior) / mesAnterior) * 100;
  const tipo = percentual > 0 ? "negativa" : percentual < 0 ? "positiva" : "neutra";
  const direcao = percentual > 0 ? "alta" : percentual < 0 ? "baixa" : "estavel";
  const sinal = percentual > 0 ? "+" : "";
  return { valor: `${sinal}${percentual.toFixed(0)}% vs mês anterior`, tipo, direcao } as const;
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [obras, todasObras, alertasRecentes, totalAlertas] = await Promise.all([
    prisma.obra.findMany({
      where: { status: { notIn: ["CANCELADA"] } },
      include: { cliente: true, gastos: { select: { valor: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.obra.findMany({
      where: { status: { notIn: ["CANCELADA"] } },
      select: { valorContrato: true, status: true, gastos: { select: { valor: true, data: true } } },
    }),
    prisma.alerta.findMany({
      where: { lido: false },
      include: { obra: { select: { nome: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.alerta.count({ where: { lido: false } }),
  ]);

  const obrasComTotais = obras.map((obra) => ({
    ...obra,
    gastoTotal: obra.gastos.reduce((acc, g) => acc + Number(g.valor), 0),
  }));

  const todosGastos = todasObras.flatMap((o) => o.gastos.map((g) => ({ data: g.data, valor: Number(g.valor) })));
  const portfolioTotal = todasObras.reduce((acc, o) => acc + Number(o.valorContrato), 0);
  const gastoTotal = todosGastos.reduce((acc, valor) => acc + valor.valor, 0);
  const saldoGeral = portfolioTotal - gastoTotal;
  const obrasAtivas = todasObras.filter((o) => o.status === "EM_ANDAMENTO").length;
  const variacaoGasto = calcularVariacaoMensal(todosGastos);
  const gastosPorMes = agruparGastosPorMes(todosGastos);

  return (
    <div>
      <PageHeader title="Visão Geral" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Portfólio Total" value={formatBRL(portfolioTotal)} icon={Wallet} />
        <KpiCard
          label="Gasto Total"
          value={formatBRL(gastoTotal)}
          icon={TrendingDown}
          variacao={variacaoGasto ?? undefined}
        />
        <KpiCard
          label="Saldo Geral"
          value={formatBRL(saldoGeral)}
          icon={PiggyBank}
          valueClassName={saldoGeral >= 0 ? "text-success" : "text-danger"}
        />
        <KpiCard label="Obras Ativas" value={String(obrasAtivas)} icon={Building2} />
        <KpiCard label="Alertas" value={String(totalAlertas)} icon={Bell} />
      </div>

      <div className="mb-6">
        <SectionCard title="Gasto Total por Mês" description="Soma de gastos de todas as obras, mês a mês">
          <GastosChart dados={gastosPorMes} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Progresso das Obras" description="Andamento financeiro em relação ao contrato" className="lg:col-span-2">
          {obrasComTotais.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Nenhuma obra cadastrada ainda.</p>
          ) : (
            <div className="space-y-4">
              {obrasComTotais.map((obra) => {
                const cor = corProgresso(Number(obra.progresso));
                const saude = getObraSaude({
                  progresso: Number(obra.progresso),
                  dataTermino: obra.dataTermino,
                  status: obra.status,
                });
                return (
                  <div key={obra.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{obra.nome}</p>
                        <p className="text-xs text-text-secondary">{obra.cliente?.nome ?? "Sem cliente"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary">
                          {formatBRL(obra.gastoTotal)} / {formatBRL(Number(obra.valorContrato))}
                        </span>
                        <StatusBadge variant={saude.variant === "neutral" ? "neutral" : cor}>{saude.label}</StatusBadge>
                      </div>
                    </div>
                    <ProgressBar value={Number(obra.progresso)} showLabel />
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Alertas Recentes" description="Gerados automaticamente pela IA">
          {alertasRecentes.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Nenhum alerta pendente.</p>
          ) : (
            <div className="space-y-3">
              {alertasRecentes.map((alerta) => {
                const variant = ALERTA_TIPO_VARIANT[alerta.tipo];
                return (
                  <div key={alerta.id} className="flex items-start gap-2.5 border-b border-border pb-3 last:border-0 last:pb-0">
                    <span
                      className="mt-1 size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--${variant})` }}
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{alerta.titulo}</p>
                      <p className="text-xs text-text-secondary">{alerta.obra?.nome ?? "Geral"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
