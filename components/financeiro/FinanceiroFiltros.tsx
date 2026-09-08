"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FinanceiroFiltrosProps {
  obras: { id: string; nome: string }[];
}

const PERIODO_LABELS: Record<string, string> = {
  todos: "Todo o período",
  mes: "Este mês",
  trimestre: "Este trimestre",
  ano: "Este ano",
};

// Filtros do painel financeiro (obra e período) - sincronizados com a URL
export function FinanceiroFiltros({ obras }: FinanceiroFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
        defaultValue={searchParams.get("periodo") ?? "todos"}
        onValueChange={(value) => updateParam("periodo", value)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue>{(v: string) => PERIODO_LABELS[v] ?? PERIODO_LABELS.todos}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PERIODO_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
