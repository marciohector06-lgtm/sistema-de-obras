"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventarioFiltrosProps {
  locais: string[];
}

// Filtro por local de armazenamento - sincronizado com a URL
export function InventarioFiltros({ locais }: InventarioFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("local", value);
    } else {
      params.delete("local");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select defaultValue={searchParams.get("local") ?? "all"} onValueChange={updateParam}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue>
          {(v: string) => (!v || v === "all" ? "Todos os locais" : v)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os locais</SelectItem>
        {locais.map((local) => (
          <SelectItem key={local} value={local}>
            {local}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
