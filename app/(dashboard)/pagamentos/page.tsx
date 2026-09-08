import { Wallet, Clock, CheckCircle2, Loader, XCircle, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PagamentosSemanaNav } from "@/components/pagamentos/PagamentosSemanaNav";
import { PagamentosFiltros } from "@/components/pagamentos/PagamentosFiltros";
import { PagamentoModal } from "@/components/pagamentos/PagamentoModal";
import { PagamentoAcoes } from "@/components/pagamentos/PagamentoAcoes";
import { formatBRL, formatDateBR } from "@/lib/utils";
import {
  getInicioSemana,
  getPagamentoStatusEfetivo,
  PAGAMENTO_STATUS_LABELS,
  PAGAMENTO_STATUS_VARIANT,
} from "@/lib/pagamentos";
import type { PagamentoStatus } from "@/types";

interface PagamentosPageProps {
  searchParams: Promise<{ semana?: string; obraId?: string; status?: string }>;
}

export default async function PagamentosPage({ searchParams }: PagamentosPageProps) {
  const { semana, obraId, status } = await searchParams;

  const inicioSemana = getInicioSemana(semana ? new Date(semana) : new Date());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 7);

  const [pagamentosSemana, obras] = await Promise.all([
    prisma.pagamento.findMany({
      where: {
        dataVencimento: { gte: inicioSemana, lt: fimSemana },
        ...(obraId ? { obraId } : {}),
      },
      include: { obra: { select: { nome: true } } },
      orderBy: { dataVencimento: "asc" },
    }),
    prisma.obra.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  const linhas = pagamentosSemana.map((p) => ({
    ...p,
    statusEfetivo: getPagamentoStatusEfetivo(p.status, p.dataVencimento),
  }));

  const totalSemana = linhas.reduce((acc, p) => acc + Number(p.valor), 0);
  const contarPorStatus = (s: PagamentoStatus) => linhas.filter((p) => p.statusEfetivo === s).length;

  const linhasFiltradas = status ? linhas.filter((p) => p.statusEfetivo === status) : linhas;

  return (
    <div>
      <PageHeader
        title="Pagamentos"
        actions={<PagamentoModal obras={obras} />}
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PagamentosSemanaNav inicioSemana={inicioSemana} />
        <PagamentosFiltros obras={obras} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <KpiCard label="Total da Semana" value={formatBRL(totalSemana)} icon={Wallet} />
        <KpiCard label="Pendente" value={String(contarPorStatus("PENDENTE"))} icon={Clock} />
        <KpiCard label="Efetuado" value={String(contarPorStatus("EFETUADO"))} icon={CheckCircle2} />
        <KpiCard label="Em Processamento" value={String(contarPorStatus("EM_PROCESSAMENTO"))} icon={Loader} />
        <KpiCard
          label="Atrasado"
          value={String(contarPorStatus("ATRASADO"))}
          icon={AlertTriangle}
          valueClassName={contarPorStatus("ATRASADO") > 0 ? "text-danger" : undefined}
        />
        <KpiCard label="Cancelado" value={String(contarPorStatus("CANCELADO"))} icon={XCircle} />
      </div>

      <SectionCard title="Pagamentos da Semana">
        {linhasFiltradas.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">Nenhum pagamento nesta semana.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhasFiltradas.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell>{pagamento.descricao}</TableCell>
                  <TableCell className="text-text-secondary">{pagamento.obra.nome}</TableCell>
                  <TableCell className="text-text-secondary">{formatDateBR(pagamento.dataVencimento)}</TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(Number(pagamento.valor))}</TableCell>
                  <TableCell>
                    <StatusBadge variant={PAGAMENTO_STATUS_VARIANT[pagamento.statusEfetivo]}>
                      {PAGAMENTO_STATUS_LABELS[pagamento.statusEfetivo]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <PagamentoAcoes id={pagamento.id} status={pagamento.statusEfetivo} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
