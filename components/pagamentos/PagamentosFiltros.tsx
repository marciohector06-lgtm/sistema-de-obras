"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGAMENTO_STATUS_LABELS } from "@/lib/pagamentos";

interface PagamentosFiltrosProps {
  obras: { id: string; nome: string }[];
}

// Filtros de obra e status da página de Pagamentos - sincronizados com a URL
export function PagamentosFiltros({ obras }: PagamentosFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select
        defaultValue={searchParams.get("obraId") ?? "all"}
        onValueChange={(value) => updateParam("obraId", value)}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue>
            {(v: string) => (!v || v === "all" ? "Todas as obras" : obras.find((o) => o.id === v)?.nome)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as obras</SelectItem>
          {obras.map((obra) => (
            <SelectItem key={obra.id} value={obra.id}>
              {obra.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue>
            {(v: string) =>
              !v || v === "all" ? "Todos os status" : PAGAMENTO_STATUS_LABELS[v as keyof typeof PAGAMENTO_STATUS_LABELS]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {Object.entries(PAGAMENTO_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
