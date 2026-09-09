import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ObraCard } from "@/components/shared/ObraCard";
import { ObrasFiltros } from "@/components/obras/ObrasFiltros";
import type { ObraStatus } from "@/types";

interface ObrasPageProps {
  searchParams: Promise<{ status?: string; clienteId?: string; q?: string }>;
}

export default async function ObrasPage({ searchParams }: ObrasPageProps) {
  const { status, clienteId, q } = await searchParams;

  const [obras, clientes] = await Promise.all([
    prisma.obra.findMany({
      where: {
        ...(status ? { status: status as ObraStatus } : {}),
        ...(clienteId ? { clienteId } : {}),
        ...(q ? { nome: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { cliente: true, gastos: { select: { valor: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Obras"
        actions={
          <Button render={<Link href="/obras/nova" />}>
            <Plus /> Nova Obra
          </Button>
        }
      />

      <ObrasFiltros clientes={clientes} />

      {obras.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma obra encontrada"
          description="Cadastre a primeira obra para começar a acompanhar o progresso."
          actionLabel="Nova Obra"
          actionHref="/obras/nova"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {obras.map((obra) => (
            <ObraCard
              key={obra.id}
              obra={{
                id: obra.id,
                nome: obra.nome,
                clienteNome: obra.cliente?.nome,
                valorContrato: Number(obra.valorContrato),
                gastoTotal: obra.gastos.reduce((acc, g) => acc + Number(g.valor), 0),
                progresso: Number(obra.progresso),
                status: obra.status,
                dataTermino: obra.dataTermino,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
