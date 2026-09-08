import { Wallet, TrendingDown, PiggyBank, Building2, Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatBRL, corProgresso } from "@/lib/utils";
import { MOCK_OBRAS, MOCK_ALERTAS_RECENTES } from "@/lib/mock-data";

const STATUS_LABEL = {
  success: "No prazo",
  warning: "Atenção",
  danger: "Crítico",
} as const;

export default function DashboardPage() {
  const portfolioTotal = MOCK_OBRAS.reduce((acc, o) => acc + o.valorContrato, 0);
  const gastoTotal = MOCK_OBRAS.reduce((acc, o) => acc + o.gastoTotal, 0);
  const saldoGeral = portfolioTotal - gastoTotal;
  const obrasAtivas = MOCK_OBRAS.length;

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
        <KpiCard label="Alertas" value={String(MOCK_ALERTAS_RECENTES.length)} icon={Bell} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Progresso das Obras" description="Andamento financeiro em relação ao contrato" className="lg:col-span-2">
          <div className="space-y-4">
            {MOCK_OBRAS.map((obra) => {
              const cor = corProgresso(obra.progresso);
              return (
                <div key={obra.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{obra.nome}</p>
                      <p className="text-xs text-text-secondary">{obra.cliente}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">{formatBRL(obra.gastoTotal)} / {formatBRL(obra.valorContrato)}</span>
                      <StatusBadge variant={cor}>{STATUS_LABEL[cor]}</StatusBadge>
                    </div>
                  </div>
                  <ProgressBar value={obra.progresso} showLabel />
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Alertas Recentes" description="Gerados automaticamente pela IA">
          <div className="space-y-3">
            {MOCK_ALERTAS_RECENTES.map((alerta) => (
              <div key={alerta.id} className="flex items-start gap-2.5 border-b border-border pb-3 last:border-0 last:pb-0">
                <span
                  className="mt-1 size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: alerta.tipo === "danger" ? "var(--danger)" : "var(--warning)" }}
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">{alerta.titulo}</p>
                  <p className="text-xs text-text-secondary">{alerta.obra}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
