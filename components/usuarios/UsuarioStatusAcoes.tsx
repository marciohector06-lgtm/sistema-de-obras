"use client";

import { useRouter } from "next/navigation";
import { UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { UserStatus } from "@/types";

// Ações de aprovação / desativação de um usuário
export function UsuarioStatusAcoes({ userId, status }: { userId: string; status: UserStatus }) {
  const router = useRouter();

  async function atualizarStatus(novoStatus: UserStatus) {
    const res = await fetch(`/api/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (!res.ok) {
      toast.error("Não foi possível atualizar o usuário");
      return;
    }

    toast.success("Usuário atualizado");
    router.refresh();
  }

  if (status === "PENDING") {
    return (
      <Button size="sm" onClick={() => atualizarStatus("ACTIVE")}>
        <UserCheck /> Aprovar
      </Button>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Button size="sm" variant="destructive" onClick={() => atualizarStatus("INACTIVE")}>
        <UserX /> Desativar
      </Button>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={() => atualizarStatus("ACTIVE")}>
      <UserCheck /> Reativar
    </Button>
  );
}
