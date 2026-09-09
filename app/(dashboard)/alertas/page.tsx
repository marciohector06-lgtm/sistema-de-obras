import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { AlertasFiltros } from "@/components/alertas/AlertasFiltros";
import { AlertaLidoButton } from "@/components/alertas/AlertaLidoButton";
import { VerificarAlertasButton } from "@/components/alertas/VerificarAlertasButton";
import { prisma } from "@/lib/prisma";
import { ALERTA_TIPO_LABELS, ALERTA_TIPO_VARIANT } from "@/lib/alertas";
import { formatDateBR } from "@/lib/utils";
import type { AlertaTipo } from "@/types";

interface AlertasPageProps {
  searchParams: Promise<{ lido?: string; tipo?: string }>;
}

export default async function AlertasPage({ searchParams }: AlertasPageProps) {
  const { lido, tipo } = await searchParams;
  const lidoFiltro = lido ?? "false";

  const [alertas, naoLidos] = await Promise.all([
    prisma.alerta.findMany({
      where: {
        ...(lidoFiltro !== "all" ? { lido: lidoFiltro === "true" } : {}),
        ...(tipo ? { tipo: tipo as AlertaTipo } : {}),
      },
      include: { obra: { select: { nome: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.alerta.findMany({ where: { lido: false }, select: { tipo: true } }),
  ]);

  const criticos = naoLidos.filter((a: { tipo: AlertaTipo }) => ALERTA_TIPO_VARIANT[a.tipo] === "danger").length;
  const avisos = naoLidos.filter((a: { tipo: AlertaTipo }) => ALERTA_TIPO_VARIANT[a.tipo] === "warning").length;
  const informativos = naoLidos.filter((a: { tipo: AlertaTipo }) => ALERTA_TIPO_VARIANT[a.tipo] === "info").length;

  return (
    <div>
      <PageHeader
        title="Alertas"
        breadcrumbs={[{ label: "Alertas" }]}
        actions={<VerificarAlertasButton />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Não Lidos" value={String(naoLidos.length)} icon={Bell} />
        <KpiCard label="Críticos" value={String(criticos)} icon={AlertCircle} valueClassName="text-danger" />
        <KpiCard label="Avisos" value={String(avisos)} icon={AlertTriangle} valueClassName="text-warning" />
        <KpiCard label="Informativos" value={String(informativos)} icon={Info} valueClassName="text-info" />
      </div>

      <AlertasFiltros />

      <SectionCard>
        {alertas.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted">Nenhum alerta encontrado para esse filtro.</p>
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <AlertBanner
                key={alerta.id}
                variant={ALERTA_TIPO_VARIANT[alerta.tipo]}
                title={alerta.titulo}
                description={`${alerta.mensagem}${alerta.obra ? ` · ${alerta.obra.nome}` : ""} · ${ALERTA_TIPO_LABELS[alerta.tipo]} · ${formatDateBR(alerta.createdAt)}`}
                action={<AlertaLidoButton id={alerta.id} lido={alerta.lido} />}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
