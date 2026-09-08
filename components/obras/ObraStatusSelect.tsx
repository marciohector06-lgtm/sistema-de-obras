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
import { OBRA_STATUS_LABELS } from "@/lib/obra";
import type { ObraStatus } from "@/types";

// Select de status editável inline no cabeçalho do dashboard da obra
export function ObraStatusSelect({ obraId, status }: { obraId: string; status: ObraStatus }) {
  const router = useRouter();

  async function handleChange(novoStatus: string | null) {
    if (!novoStatus) return;

    const res = await fetch(`/api/obras/${obraId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (!res.ok) {
      toast.error("Não foi possível atualizar o status");
      return;
    }

    toast.success("Status atualizado");
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger size="sm">
        <SelectValue>{(value: ObraStatus) => OBRA_STATUS_LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(OBRA_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
