import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UsuarioRoleSelect } from "@/components/usuarios/UsuarioRoleSelect";
import { UsuarioStatusAcoes } from "@/components/usuarios/UsuarioStatusAcoes";

const STATUS_LABELS = { PENDING: "Pendente", ACTIVE: "Ativo", INACTIVE: "Inativo" } as const;
const STATUS_VARIANT = { PENDING: "warning", ACTIVE: "success", INACTIVE: "neutral" } as const;

export default async function UsuariosPage() {
  const usuarios = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader title="Usuários" />

      <SectionCard title="Usuários do Sistema" description="Aprovação de acesso e gestão de perfis">
        {usuarios.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => {
                const iniciais = usuario.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-primary-bg text-[11px] text-primary">
                            {iniciais}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{usuario.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{usuario.email}</TableCell>
                    <TableCell>
                      <UsuarioRoleSelect userId={usuario.id} role={usuario.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={STATUS_VARIANT[usuario.status]}>
                        {STATUS_LABELS[usuario.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <UsuarioStatusAcoes userId={usuario.id} status={usuario.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
