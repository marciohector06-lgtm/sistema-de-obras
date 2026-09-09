import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrestadorModal } from "@/components/prestadores/PrestadorModal";
import { ContratoPrestadorModal } from "@/components/prestadores/ContratoPrestadorModal";
import { MovimentoModal } from "@/components/prestadores/MovimentoModal";
import { MovimentosFiltros } from "@/components/prestadores/MovimentosFiltros";
import { calcExtrato, MOVIMENTO_TIPO_LABELS, MOVIMENTO_TIPO_VARIANT } from "@/lib/prestadores";
import { formatBRL, formatDateBR } from "@/lib/utils";
import type { MovimentoTipo } from "@/types";

interface PrestadoresPageProps {
  searchParams: Promise<{ tipo?: string; obraId?: string; prestadorId?: string }>;
}

export default async function PrestadoresPage({ searchParams }: PrestadoresPageProps) {
  const { tipo, obraId, prestadorId } = await searchParams;

  const [prestadores, contratos, movimentos, obras] = await Promise.all([
    prisma.prestador.findMany({ orderBy: { nome: "asc" } }),
    prisma.contratoPrestador.findMany({
      include: { prestador: { select: { nome: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.movimentoFinanceiro.findMany({
      where: {
        ...(tipo ? { tipo: tipo as MovimentoTipo } : {}),
        ...(obraId ? { obraId } : {}),
        ...(prestadorId ? { prestadorId } : {}),
      },
      include: { obra: { select: { nome: true } }, prestador: { select: { nome: true } } },
      orderBy: { data: "desc" },
    }),
    prisma.obra.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  const extrato = calcExtrato(movimentos.map((m) => ({ ...m, valor: Number(m.valor) })));

  return (
    <div>
      <PageHeader title="Prestadores" />

      <Tabs defaultValue="prestadores">
        <TabsList>
          <TabsTrigger value="prestadores">Prestadores</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="movimentos">Movimentos (Extrato)</TabsTrigger>
        </TabsList>

        <TabsContent value="prestadores" className="mt-4">
          <SectionCard title="Prestadores" action={<PrestadorModal />}>
            {prestadores.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">Nenhum prestador cadastrado ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Chave Pix</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prestadores.map((prestador) => (
                    <TableRow key={prestador.id}>
                      <TableCell>{prestador.nome}</TableCell>
                      <TableCell className="text-text-secondary">{prestador.documento ?? "—"}</TableCell>
                      <TableCell className="text-text-secondary">{prestador.categoria ?? "—"}</TableCell>
                      <TableCell className="text-text-secondary">{prestador.chavePix ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="contratos" className="mt-4">
          <SectionCard
            title="Contratos por Prestador"
            action={<ContratoPrestadorModal prestadores={prestadores} />}
          >
            {contratos.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">Nenhum contrato cadastrado ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((contrato) => (
                    <TableRow key={contrato.id}>
                      <TableCell>{contrato.titulo}</TableCell>
                      <TableCell className="text-text-secondary">{contrato.prestador.nome}</TableCell>
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

        <TabsContent value="movimentos" className="mt-4">
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Entradas" value={formatBRL(extrato.totalEntradas)} icon={TrendingUp} valueClassName="text-success" />
            <KpiCard label="Saídas" value={formatBRL(extrato.totalSaidas)} icon={TrendingDown} valueClassName="text-danger" />
            <KpiCard
              label="Saldo"
              value={formatBRL(extrato.saldoFinal)}
              icon={PiggyBank}
              valueClassName={extrato.saldoFinal >= 0 ? "text-success" : "text-danger"}
            />
            <KpiCard label="Movimentos" value={String(movimentos.length)} icon={Wallet} />
          </div>

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <MovimentosFiltros obras={obras} prestadores={prestadores} />
            <MovimentoModal obras={obras} prestadores={prestadores} />
          </div>

          <SectionCard title="Extrato Geral">
            {extrato.linhas.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">Nenhum movimento encontrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Prestador</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extrato.linhas.map(({ movimento, saldoAcumulado }) => (
                    <TableRow key={movimento.id}>
                      <TableCell className="text-text-secondary">{formatDateBR(movimento.data)}</TableCell>
                      <TableCell>{movimento.descricao}</TableCell>
                      <TableCell>
                        <StatusBadge variant={MOVIMENTO_TIPO_VARIANT[movimento.tipo]}>
                          {MOVIMENTO_TIPO_LABELS[movimento.tipo]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-text-secondary">{movimento.obra?.nome ?? "—"}</TableCell>
                      <TableCell className="text-text-secondary">{movimento.prestador?.nome ?? "—"}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${movimento.tipo === "ENTRADA" ? "text-success" : "text-danger"}`}
                      >
                        {movimento.tipo === "ENTRADA" ? "+" : "-"}
                        {formatBRL(movimento.valor)}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(saldoAcumulado)}</TableCell>
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
