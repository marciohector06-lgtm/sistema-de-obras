import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropostasFiltros } from "@/components/propostas/PropostasFiltros";
import { MaterialModal } from "@/components/materiais/MaterialModal";
import { calcTotaisProposta, PROPOSTA_STATUS_LABELS, PROPOSTA_STATUS_VARIANT } from "@/lib/propostas";
import { formatBRL, formatDateBR } from "@/lib/utils";
import type { PropostaStatus } from "@/types";

interface PropostasPageProps {
  searchParams: Promise<{ status?: string; clienteId?: string; q?: string }>;
}

export default async function PropostasPage({ searchParams }: PropostasPageProps) {
  const { status, clienteId, q } = await searchParams;

  const [propostas, materiais, clientes] = await Promise.all([
    prisma.proposta.findMany({
      where: {
        ...(status ? { status: status as PropostaStatus } : {}),
        ...(clienteId ? { clienteId } : {}),
        ...(q ? { titulo: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { cliente: true, secoes: { include: { itens: true } } },
      orderBy: { numero: "desc" },
    }),
    prisma.material.findMany({ orderBy: { descricao: "asc" } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Propostas"
        actions={
          <Button render={<Link href="/propostas/nova" />}>
            <Plus /> Nova Proposta
          </Button>
        }
      />

      <Tabs defaultValue="propostas">
        <TabsList>
          <TabsTrigger value="propostas">Propostas</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
        </TabsList>

        <TabsContent value="propostas" className="mt-4">
          <PropostasFiltros clientes={clientes} />

          {propostas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
              <FileText className="size-8 text-text-muted" />
              <p className="text-sm font-medium text-text-primary">Nenhuma proposta encontrada</p>
              <p className="text-xs text-text-secondary">Crie a primeira proposta para começar.</p>
              <Button render={<Link href="/propostas/nova" />} size="sm">
                <Plus /> Nova Proposta
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {propostas.map((proposta) => {
                const itens = proposta.secoes.flatMap((secao) => secao.itens);
                const totais = calcTotaisProposta({
                  itens: itens.map((item) => ({
                    quantidade: Number(item.quantidade),
                    precoUnitario: Number(item.precoUnitario),
                  })),
                  bdi: Number(proposta.bdi),
                  impostos: Number(proposta.impostos),
                });

                return (
                  <Link
                    key={proposta.id}
                    href={`/propostas/${proposta.id}`}
                    className="block rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-text-muted">Proposta #{proposta.numero}</p>
                        <p className="truncate text-sm font-semibold text-text-primary">{proposta.titulo}</p>
                      </div>
                      <StatusBadge variant={PROPOSTA_STATUS_VARIANT[proposta.status]}>
                        {PROPOSTA_STATUS_LABELS[proposta.status]}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-text-secondary">{proposta.cliente.nome}</p>
                    <p className="mt-3 text-lg font-bold text-text-primary">{formatBRL(totais.valorTotal)}</p>
                    <p className="text-xs text-text-muted">{formatDateBR(proposta.createdAt)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="materiais" className="mt-4">
          <SectionCard title="Catálogo de Materiais" action={<MaterialModal />}>
            {materiais.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">Nenhum material cadastrado ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>NCM</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materiais.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>{material.descricao}</TableCell>
                      <TableCell className="text-text-secondary">{material.unidade}</TableCell>
                      <TableCell className="text-text-secondary">{material.ncm ?? "—"}</TableCell>
                      <TableCell className="text-text-secondary">{material.origem ?? "—"}</TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(Number(material.preco))}</TableCell>
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
