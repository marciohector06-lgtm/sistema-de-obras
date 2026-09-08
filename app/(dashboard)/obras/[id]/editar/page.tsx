import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { ObraForm } from "@/components/obras/ObraForm";

interface EditarObraPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarObraPage({ params }: EditarObraPageProps) {
  const { id } = await params;

  const [obra, clientes] = await Promise.all([
    prisma.obra.findUnique({ where: { id } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!obra) notFound();

  return (
    <div>
      <PageHeader
        title={`Editar: ${obra.nome}`}
        breadcrumbs={[
          { label: "Obras", href: "/obras" },
          { label: obra.nome, href: `/obras/${obra.id}` },
          { label: "Editar" },
        ]}
      />
      <ObraForm
        clientes={clientes}
        obraId={obra.id}
        defaultValues={{
          nome: obra.nome,
          descricao: obra.descricao ?? "",
          clienteId: obra.clienteId ?? "",
          endereco: obra.endereco ?? "",
          valorContrato: Number(obra.valorContrato),
          dataInicio: obra.dataInicio,
          dataTermino: obra.dataTermino,
          status: obra.status,
          prioridade: obra.prioridade,
          cor: obra.cor,
        }}
      />
    </div>
  );
}
