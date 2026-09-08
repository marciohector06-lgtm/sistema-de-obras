"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/types";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  ENGENHEIRO: "Engenheiro",
  VIEWER: "Visualizador",
};

// Select para alterar o perfil (role) de um usuário
export function UsuarioRoleSelect({ userId, role }: { userId: string; role: Role }) {
  const router = useRouter();

  async function handleChange(novoRole: string | null) {
    if (!novoRole) return;

    const res = await fetch(`/api/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: novoRole }),
    });

    if (!res.ok) {
      toast.error("Não foi possível alterar o perfil");
      return;
    }

    toast.success("Perfil atualizado");
    router.refresh();
  }

  return (
    <Select value={role} onValueChange={handleChange}>
      <SelectTrigger size="sm">
        <SelectValue>{(v: Role) => ROLE_LABELS[v]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
