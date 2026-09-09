import { Package, Wallet, AlertTriangle, Warehouse } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventarioFiltros } from "@/components/inventario/InventarioFiltros";
import { InventarioModal } from "@/components/inventario/InventarioModal";
import { BaixaEstoqueModal, type EstoqueOption } from "@/components/inventario/BaixaEstoqueModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatBRL } from "@/lib/utils";
import { calcStatusEstoque } from "@/lib/inventario";

const LOCAL_PADRAO = "Depósito Central";

interface InventarioPageProps {
  searchParams: Promise<{ local?: string }>;
}

export default async function InventarioPage({ searchParams }: InventarioPageProps) {
  const { local } = await searchParams;

  const [todosOsRegistros, registrosFiltrados, totalItensCatalogo, itensCatalogo, obras] = await Promise.all([
    prisma.obraInventario.findMany({ include: { item: true } }),
    prisma.obraInventario.findMany({
      where: local ? { local } : undefined,
      include: { item: true, obra: { select: { nome: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.itemInventario.count(),
    prisma.itemInventario.findMany({ orderBy: { nome: "asc" } }),
    prisma.obra.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  const locais = Array.from(
    new Set(todosOsRegistros.map((r) => r.local ?? LOCAL_PADRAO))
  ).sort();

  const linhas = registrosFiltrados.map((r) => {
    const { restante, status } = calcStatusEstoque(r.qtdComprada, r.qtdUsada);
    return {
      ...r,
      restante,
      status,
      valorTotal: restante >= 0 ? Number(r.item.valorUnitario) * r.qtdComprada : 0,
    };
  });

  const valorTotalInventario = linhas.reduce(
    (acc, l) => acc + Number(l.item.valorUnitario) * l.qtdComprada,
    0
  );
  const itensEstoqueBaixo = linhas.filter((l) => l.status === "baixo").length;

  const locaisResumo = locais.map((localNome) => {
    const registrosDoLocal = todosOsRegistros.filter((r) => (r.local ?? LOCAL_PADRAO) === localNome);
    return {
      nome: localNome,
      totalItens: registrosDoLocal.length,
      valorTotal: registrosDoLocal.reduce((acc, r) => acc + Number(r.item.valorUnitario) * r.qtdComprada, 0),
    };
  });

  const opcoesBaixa: EstoqueOption[] = registrosFiltrados
    .map((r) => {
      const { restante } = calcStatusEstoque(r.qtdComprada, r.qtdUsada);
      return {
        id: r.id,
        label: `${r.item.nome} - ${r.obra.nome} (restante: ${restante} ${r.item.unidade})`,
        restante,
      };
    })
    .filter((o) => o.restante > 0);

  return (
    <div>
      <PageHeader
        title="Inventário"
        actions={
          <>
            <BaixaEstoqueModal opcoes={opcoesBaixa} />
            <InventarioModal itens={itensCatalogo} obras={obras} />
          </>
        }
      />

      <div className="mb-5">
        <InventarioFiltros locais={locais} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total de Itens" value={String(totalItensCatalogo)} icon={Package} />
        <KpiCard label="Valor Total do Inventário" value={formatBRL(valorTotalInventario)} icon={Wallet} />
        <KpiCard
          label="Itens com Estoque Baixo"
          value={String(itensEstoqueBaixo)}
          icon={AlertTriangle}
          valueClassName={itensEstoqueBaixo > 0 ? "text-danger" : undefined}
        />
      </div>

      <SectionCard title="Itens em Estoque">
        {linhas.length === 0 ? (
          <EmptyState icon={Package} title="Nenhum item em estoque ainda." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Qtd Comprada</TableHead>
                <TableHead className="text-right">Qtd Usada</TableHead>
                <TableHead className="text-right">Qtd Restante</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-right">Valor Unitário</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((linha) => (
                <TableRow key={linha.id}>
                  <TableCell className="font-medium">{linha.item.nome}</TableCell>
                  <TableCell className="text-right">{linha.qtdComprada}</TableCell>
                  <TableCell className="text-right">{linha.qtdUsada}</TableCell>
                  <TableCell className="text-right">{linha.restante}</TableCell>
                  <TableCell className="text-text-secondary">{linha.item.unidade}</TableCell>
                  <TableCell className="text-text-secondary">{linha.local ?? LOCAL_PADRAO}</TableCell>
                  <TableCell className="text-right">{formatBRL(Number(linha.item.valorUnitario))}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatBRL(Number(linha.item.valorUnitario) * linha.qtdComprada)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={linha.status === "baixo" ? "danger" : "success"}>
                      {linha.status === "baixo" ? "Baixo" : "Normal"}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <SectionCard title="Locais de Armazenamento" className="mt-6">
        {locaisResumo.length === 0 ? (
          <EmptyState icon={Package} title="Nenhum local cadastrado ainda." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locaisResumo.map((local) => (
              <div key={local.nome} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-primary-bg">
                  <Warehouse className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{local.nome}</p>
                  <p className="text-xs text-text-secondary">
                    {local.totalItens} {local.totalItens === 1 ? "item" : "itens"} · {formatBRL(local.valorTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
