import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PropostaStatusAcoes } from "@/components/propostas/PropostaStatusAcoes";
import { calcTotaisProposta, calcTotalItem, PROPOSTA_STATUS_LABELS, PROPOSTA_STATUS_VARIANT, PROPOSTA_EVENTO_LABELS } from "@/lib/propostas";
import { formatBRL, formatDateBR } from "@/lib/utils";

interface PropostaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropostaDetailPage({ params }: PropostaDetailPageProps) {
  const { id } = await params;

  const proposta = await prisma.proposta.findUnique({
    where: { id },
    include: {
      cliente: true,
      secoes: { orderBy: { ordem: "asc" }, include: { itens: { orderBy: { ordem: "asc" } } } },
      eventos: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
    },
  });

  if (!proposta) notFound();

  const itens = proposta.secoes.flatMap((secao) => secao.itens);
  const totais = calcTotaisProposta({
    itens: itens.map((item) => ({ quantidade: Number(item.quantidade), precoUnitario: Number(item.precoUnitario) })),
    bdi: Number(proposta.bdi),
    impostos: Number(proposta.impostos),
  });

  return (
    <div>
      <PageHeader
        title={`Proposta #${proposta.numero} - ${proposta.titulo}`}
        breadcrumbs={[{ label: "Propostas", href: "/propostas" }, { label: `#${proposta.numero}` }]}
        actions={
          <>
            <PropostaStatusAcoes id={proposta.id} status={proposta.status} />
            <Button variant="outline" render={<Link href={`/propostas/${proposta.id}/editar`} />}>
              <Pencil /> Editar
            </Button>
            <Button variant="outline" render={<a href={`/api/propostas/${proposta.id}/pdf`} target="_blank" rel="noreferrer" />}>
              <Download /> Baixar PDF
            </Button>
          </>
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <StatusBadge variant={PROPOSTA_STATUS_VARIANT[proposta.status]}>
          {PROPOSTA_STATUS_LABELS[proposta.status]}
        </StatusBadge>
        <p className="text-sm text-text-secondary">Cliente: {proposta.cliente.nome}</p>
        <p className="text-sm text-text-secondary">Criada em {formatDateBR(proposta.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Itens da Proposta" className="lg:col-span-2">
          <div className="space-y-6">
            {proposta.secoes.map((secao) => (
              <div key={secao.id}>
                <p className="mb-2 text-sm font-semibold text-text-primary">{secao.titulo}</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Un.</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {secao.itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell className="text-text-secondary">{item.unidade}</TableCell>
                        <TableCell className="text-right">{Number(item.quantidade)}</TableCell>
                        <TableCell className="text-right">{formatBRL(Number(item.precoUnitario))}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatBRL(calcTotalItem({ quantidade: Number(item.quantidade), precoUnitario: Number(item.precoUnitario) }))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>

          {proposta.observacao && (
            <p className="mt-6 text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Observação: </span>
              {proposta.observacao}
            </p>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Totais">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Subtotal</dt>
                <dd>{formatBRL(totais.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">BDI ({Number(proposta.bdi)}%)</dt>
                <dd>{formatBRL(totais.valorBdi)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Impostos ({Number(proposta.impostos)}%)</dt>
                <dd>{formatBRL(totais.valorImpostos)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-text-primary">
                <dt>Total</dt>
                <dd>{formatBRL(totais.valorTotal)}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Histórico">
            <div className="space-y-3">
              {proposta.eventos.map((evento) => (
                <div key={evento.id} className="border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                  <p className="font-medium text-text-primary">{PROPOSTA_EVENTO_LABELS[evento.tipo]}</p>
                  <p className="text-xs text-text-secondary">{evento.mensagem}</p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {formatDateBR(evento.createdAt)}
                    {evento.user && ` · ${evento.user.name}`}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
