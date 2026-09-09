import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { PropostaForm } from "@/components/propostas/PropostaForm";

interface EditarPropostaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPropostaPage({ params }: EditarPropostaPageProps) {
  const { id } = await params;

  const [proposta, clientes, materiais] = await Promise.all([
    prisma.proposta.findUnique({
      where: { id },
      include: { secoes: { orderBy: { ordem: "asc" }, include: { itens: { orderBy: { ordem: "asc" } } } } },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.material.findMany({ orderBy: { descricao: "asc" } }),
  ]);

  if (!proposta) notFound();

  return (
    <div>
      <PageHeader
        title={`Editar: Proposta #${proposta.numero}`}
        breadcrumbs={[
          { label: "Propostas", href: "/propostas" },
          { label: `#${proposta.numero}`, href: `/propostas/${proposta.id}` },
          { label: "Editar" },
        ]}
      />
      <PropostaForm
        clientes={clientes}
        materiais={materiais.map((m) => ({ id: m.id, descricao: m.descricao, unidade: m.unidade, preco: Number(m.preco) }))}
        propostaId={proposta.id}
        defaultValues={{
          titulo: proposta.titulo,
          clienteId: proposta.clienteId,
          bdi: Number(proposta.bdi),
          impostos: Number(proposta.impostos),
          observacao: proposta.observacao ?? "",
          secoes: proposta.secoes.map((secao) => ({
            titulo: secao.titulo,
            itens: secao.itens.map((item) => ({
              materialId: item.materialId ?? "",
              descricao: item.descricao,
              unidade: item.unidade,
              quantidade: Number(item.quantidade),
              precoUnitario: Number(item.precoUnitario),
            })),
          })),
        }}
      />
    </div>
  );
}
