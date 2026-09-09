"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALERTA_TIPO_LABELS } from "@/lib/alertas-labels";

const TIPO_OPTIONS = Object.entries(ALERTA_TIPO_LABELS);

const LIDO_LABELS: Record<string, string> = {
  all: "Todos",
  false: "Não lidos",
  true: "Lidos",
};

export function AlertasFiltros() {
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
        defaultValue={searchParams.get("lido") ?? "false"}
        onValueChange={(value) => updateParam("lido", value)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue>{(value: string) => LIDO_LABELS[value] ?? LIDO_LABELS.all}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LIDO_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("tipo") ?? "all"}
        onValueChange={(value) => updateParam("tipo", value)}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue>
            {(value: string) => (!value || value === "all" ? "Todos os tipos" : ALERTA_TIPO_LABELS[value as keyof typeof ALERTA_TIPO_LABELS])}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {TIPO_OPTIONS.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
