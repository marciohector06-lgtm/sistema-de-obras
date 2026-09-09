import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { PropostaForm } from "@/components/propostas/PropostaForm";

export default async function NovaPropostaPage() {
  const [clientes, materiais] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.material.findMany({ orderBy: { descricao: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Nova Proposta"
        breadcrumbs={[{ label: "Propostas", href: "/propostas" }, { label: "Nova Proposta" }]}
      />
      <PropostaForm
        clientes={clientes}
        materiais={materiais.map((m) => ({ id: m.id, descricao: m.descricao, unidade: m.unidade, preco: Number(m.preco) }))}
      />
    </div>
  );
}
