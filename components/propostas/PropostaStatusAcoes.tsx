"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PropostaStatus } from "@/types";

export function PropostaStatusAcoes({ id, status }: { id: string; status: PropostaStatus }) {
  const router = useRouter();

  async function atualizarStatus(novoStatus: PropostaStatus) {
    const res = await fetch(`/api/propostas/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (!res.ok) {
      toast.error("Não foi possível atualizar a proposta");
      return;
    }

    toast.success("Proposta atualizada");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <MoreHorizontal /> Alterar Status
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {status !== "APROVADA" && (
            <DropdownMenuItem onClick={() => atualizarStatus("APROVADA")}>
              <CheckCircle2 /> Aprovar
            </DropdownMenuItem>
          )}
          {status !== "REJEITADA" && (
            <DropdownMenuItem variant="destructive" onClick={() => atualizarStatus("REJEITADA")}>
              <XCircle /> Rejeitar
            </DropdownMenuItem>
          )}
          {status !== "ATIVA" && (
            <DropdownMenuItem onClick={() => atualizarStatus("ATIVA")}>
              <RotateCcw /> Reativar
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
