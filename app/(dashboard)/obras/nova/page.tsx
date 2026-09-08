import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { ObraForm } from "@/components/obras/ObraForm";

export default async function NovaObraPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });

  return (
    <div>
      <PageHeader
        title="Nova Obra"
        breadcrumbs={[{ label: "Obras", href: "/obras" }, { label: "Nova Obra" }]}
      />
      <ObraForm clientes={clientes} />
    </div>
  );
}
