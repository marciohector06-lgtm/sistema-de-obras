import { Wallet, TrendingDown, PiggyBank, Building2, Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getObraSaude } from "@/lib/obra";
import { ALERTA_TIPO_VARIANT } from "@/lib/alertas";
import { formatBRL, corProgresso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const obras = await prisma.obra.findMany({
    where: { status: { notIn: ["CANCELADA"] } },
    include: { cliente: true, gastos: { select: { valor: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const alertasRecentes = await prisma.alerta.findMany({
    where: { lido: false },
    include: { obra: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const totalAlertas = await prisma.alerta.count({ where: { lido: false } });

  const obrasComTotais = obras.map((obra) => ({
    ...obra,
    gastoTotal: obra.gastos.reduce((acc, g) => acc + Number(g.valor), 0),
  }));

  const portfolioTotal = obrasComTotais.reduce((acc, o) => acc + Number(o.valorContrato), 0);
  const gastoTotal = obrasComTotais.reduce((acc, o) => acc + o.gastoTotal, 0);
  const saldoGeral = portfolioTotal - gastoTotal;
  const obrasAtivas = obrasComTotais.filter((o) => o.status === "EM_ANDAMENTO").length;

  return (
    <div>
      <PageHeader title="Visão Geral" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Portfólio Total" value={formatBRL(portfolioTotal)} icon={Wallet} />
        <KpiCard label="Gasto Total" value={formatBRL(gastoTotal)} icon={TrendingDown} />
        <KpiCard
          label="Saldo Geral"
          value={formatBRL(saldoGeral)}
          icon={PiggyBank}
          valueClassName={saldoGeral >= 0 ? "text-success" : "text-danger"}
        />
        <KpiCard label="Obras Ativas" value={String(obrasAtivas)} icon={Building2} />
        <KpiCard label="Alertas" value={String(totalAlertas)} icon={Bell} />
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
