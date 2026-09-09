"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOVIMENTO_TIPO_LABELS } from "@/lib/prestadores";

interface MovimentosFiltrosProps {
  obras: { id: string; nome: string }[];
  prestadores: { id: string; nome: string }[];
}

export function MovimentosFiltros({ obras, prestadores }: MovimentosFiltrosProps) {
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
      <Select
        defaultValue={searchParams.get("tipo") ?? "all"}
        onValueChange={(value) => updateParam("tipo", value)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue>
            {(value: string) => (!value || value === "all" ? "Todos os tipos" : MOVIMENTO_TIPO_LABELS[value as keyof typeof MOVIMENTO_TIPO_LABELS])}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {Object.entries(MOVIMENTO_TIPO_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("obraId") ?? "all"}
        onValueChange={(value) => updateParam("obraId", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue>
            {(value: string) => (!value || value === "all" ? "Todas as obras" : obras.find((o) => o.id === value)?.nome)}
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
        defaultValue={searchParams.get("prestadorId") ?? "all"}
        onValueChange={(value) => updateParam("prestadorId", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue>
            {(value: string) => (!value || value === "all" ? "Todos os prestadores" : prestadores.find((p) => p.id === value)?.nome)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os prestadores</SelectItem>
          {prestadores.map((prestador) => (
            <SelectItem key={prestador.id} value={prestador.id}>
              {prestador.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
