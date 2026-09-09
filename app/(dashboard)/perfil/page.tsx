import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getSessionUser } from "@/lib/auth";

const ROLE_LABELS = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  ENGENHEIRO: "Engenheiro",
  VIEWER: "Visualizador",
};

const STATUS_LABELS = { PENDING: "Pendente", ACTIVE: "Ativo", INACTIVE: "Inativo" } as const;
const STATUS_VARIANT = { PENDING: "warning", ACTIVE: "success", INACTIVE: "neutral" } as const;

export default async function PerfilPage() {
  const usuario = await getSessionUser();
  if (!usuario) redirect("/login");

  const iniciais = usuario.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      <PageHeader title="Meu perfil" />

      <SectionCard title="Dados da conta">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary-bg text-lg text-primary">{iniciais}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold text-text-primary">{usuario.name}</p>
            <p className="text-sm text-text-secondary">{usuario.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-text-muted">Perfil de acesso</dt>
            <dd className="mt-0.5 text-sm font-medium text-text-primary">{ROLE_LABELS[usuario.role]}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Status</dt>
            <dd className="mt-0.5">
              <StatusBadge variant={STATUS_VARIANT[usuario.status]}>{STATUS_LABELS[usuario.status]}</StatusBadge>
            </dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  );
}
