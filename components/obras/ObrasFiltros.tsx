"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OBRA_STATUS_LABELS } from "@/lib/obra";

interface ObrasFiltrosProps {
  clientes: { id: string; nome: string }[];
}

const STATUS_OPTIONS = Object.entries(OBRA_STATUS_LABELS);

// Barra de filtros da listagem de obras (busca, status, cliente) - sincronizada com a URL
export function ObrasFiltros({ clientes }: ObrasFiltrosProps) {
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
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          placeholder="Buscar obra..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => updateParam("q", e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue>
            {(value: string) => (!value || value === "all" ? "Todos os status" : OBRA_STATUS_LABELS[value as keyof typeof OBRA_STATUS_LABELS])}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {STATUS_OPTIONS.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("clienteId") ?? "all"}
        onValueChange={(value) => updateParam("clienteId", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue>
            {(value: string) =>
              !value || value === "all" ? "Todos os clientes" : clientes.find((c) => c.id === value)?.nome
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os clientes</SelectItem>
          {clientes.map((cliente) => (
            <SelectItem key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
