import Link from "next/link";
import { notFound } from "next/navigation";
import { Wallet, TrendingDown, PiggyBank, Percent, Pencil, Landmark } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ObraStatusSelect } from "@/components/obras/ObraStatusSelect";
import { GastoModal } from "@/components/obras/GastoModal";
import { GastosChart } from "@/components/obras/GastosChart";
import { PrevisaoRefreshButton } from "@/components/obras/PrevisaoRefreshButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { agruparGastosPorSemana } from "@/lib/gastos";
import { formatBRL, formatDateBR } from "@/lib/utils";
import { GASTO_CATEGORIA_LABELS as CATEGORIA_LABELS } from "@/lib/obra";
import { calcularRiscoObra, RISCO_LABELS, RISCO_VARIANT } from "@/lib/ia/risco";

interface ObraDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ObraDetailPage({ params }: ObraDetailPageProps) {
  const { id } = await params;

  const obra = await prisma.obra.findUnique({
    where: { id },
    include: { cliente: true, gastos: { orderBy: { data: "desc" } }, pagamentos: true },
  });

  if (!obra) notFound();

  const gastoTotal = obra.gastos.reduce((acc, g) => acc + Number(g.valor), 0);
  const saldo = Number(obra.valorContrato) - gastoTotal;
  const progresso = Number(obra.progresso);
  const gastosSemanais = agruparGastosPorSemana(
    obra.gastos.map((g) => ({ data: g.data, valor: Number(g.valor) }))
  );

  const risco = calcularRiscoObra({
    status: obra.status,
    progresso,
    dataTermino: obra.dataTermino,
    valorContrato: Number(obra.valorContrato),
    previsaoCusto: obra.previsaoCusto ? Number(obra.previsaoCusto) : null,
    pagamentos: obra.pagamentos.map((p) => ({ status: p.status, dataVencimento: p.dataVencimento })),
  });

  return (
    <div>
      <PageHeader
        title={obra.nome}
        breadcrumbs={[{ label: "Obras", href: "/obras" }, { label: obra.nome }]}
        actions={
          <>
            <ObraStatusSelect obraId={obra.id} status={obra.status} />
            <Button variant="outline" render={<Link href={`/obras/${obra.id}/editar`} />}>
              <Pencil /> Editar
            </Button>
            <Button variant="outline" render={<Link href="/financeiro" />}>
              <Landmark /> Ver Financeiro
            </Button>
            <GastoModal obraId={obra.id} />
          </>
        }
      />

      {obra.cliente && (
        <p className="-mt-4 mb-6 text-sm text-text-secondary">Cliente: {obra.cliente.nome}</p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Contrato" value={formatBRL(Number(obra.valorContrato))} icon={Wallet} />
        <KpiCard label="Gasto" value={formatBRL(gastoTotal)} icon={TrendingDown} />
        <KpiCard
          label="Saldo"
          value={formatBRL(saldo)}
          icon={PiggyBank}
          valueClassName={saldo >= 0 ? "text-success" : "text-danger"}
        />
        <KpiCard
          label="Progresso"
          value={`${progresso.toFixed(1)}%`}
          icon={Percent}
          valueClassName={progresso >= 100 ? "text-danger" : progresso >= 70 ? "text-warning" : "text-success"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Evolução de Gastos" description="Total gasto por semana" className="lg:col-span-2">
          <GastosChart dados={gastosSemanais} />
        </SectionCard>

        <SectionCard title="Detalhes">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Endereço</dt>
              <dd className="text-right text-text-primary">{obra.endereco ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Início</dt>
              <dd className="text-text-primary">{formatDateBR(obra.dataInicio)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Término</dt>
              <dd className="text-text-primary">{formatDateBR(obra.dataTermino)}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <SectionCard
        title="Análise de Risco (IA)"
        description="Semáforo de risco e previsão de custo geradas automaticamente"
        action={obra.status === "EM_ANDAMENTO" ? <PrevisaoRefreshButton obraId={obra.id} /> : undefined}
        className="mt-6"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium text-text-secondary">Semáforo de Risco</p>
            <StatusBadge variant={RISCO_VARIANT[risco.nivel]}>{RISCO_LABELS[risco.nivel]}</StatusBadge>
            {risco.motivos.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-text-secondary">
                {risco.motivos.map((motivo) => (
                  <li key={motivo}>{motivo}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-text-secondary">Previsão de Custo Final</p>
            {obra.previsaoCusto ? (
              <>
                <p
                  className={`text-lg font-bold ${
                    Number(obra.previsaoCusto) > Number(obra.valorContrato) ? "text-danger" : "text-success"
                  }`}
                >
                  {formatBRL(Number(obra.previsaoCusto))}
                </p>
                <p className="mt-1 text-xs text-text-secondary">{obra.previsaoJustificativa}</p>
                {obra.previsaoAtualizadaEm && (
                  <p className="mt-1 text-[11px] text-text-muted">
                    Atualizado em {formatDateBR(obra.previsaoAtualizadaEm)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-text-muted">
                {obra.status === "EM_ANDAMENTO"
                  ? "Ainda não calculada. Clique em Atualizar Previsão."
                  : "Disponível apenas para obras em andamento."}
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Gastos Recentes" className="mt-6">
        {obra.gastos.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">Nenhum gasto registrado ainda.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obra.gastos.slice(0, 10).map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell>{gasto.descricao}</TableCell>
                  <TableCell className="text-text-secondary">{CATEGORIA_LABELS[gasto.categoria]}</TableCell>
                  <TableCell className="text-text-secondary">{formatDateBR(gasto.data)}</TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(Number(gasto.valor))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
