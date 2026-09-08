"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PagamentoStatus } from "@/types";

// Ações inline de um pagamento (marcar como pago, em processamento, cancelar)
export function PagamentoAcoes({ id, status }: { id: string; status: PagamentoStatus }) {
  const router = useRouter();

  async function atualizarStatus(novoStatus: PagamentoStatus) {
    const res = await fetch(`/api/pagamentos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (!res.ok) {
      toast.error("Não foi possível atualizar o pagamento");
      return;
    }

    toast.success("Pagamento atualizado");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" />}
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {status !== "EFETUADO" && (
            <DropdownMenuItem onClick={() => atualizarStatus("EFETUADO")}>
              <CheckCircle2 /> Marcar como pago
            </DropdownMenuItem>
          )}
          {status !== "EM_PROCESSAMENTO" && (
            <DropdownMenuItem onClick={() => atualizarStatus("EM_PROCESSAMENTO")}>
              <Clock /> Marcar em processamento
            </DropdownMenuItem>
          )}
          {status !== "CANCELADO" && (
            <DropdownMenuItem variant="destructive" onClick={() => atualizarStatus("CANCELADO")}>
              <XCircle /> Cancelar
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
