"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIntervaloSemana } from "@/lib/pagamentos";

// Navegação de semana (anterior/próxima) para a página de Pagamentos - sincronizada com a URL
export function PagamentosSemanaNav({ inicioSemana }: { inicioSemana: Date }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function irParaSemana(offsetDias: number) {
    const novaData = new Date(inicioSemana);
    novaData.setDate(novaData.getDate() + offsetDias);
    const params = new URLSearchParams(searchParams.toString());
    params.set("semana", novaData.toISOString().slice(0, 10));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => irParaSemana(-7)}>
        <ChevronLeft />
      </Button>
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary">
        <CalendarDays className="size-3.5 text-text-muted" />
        Semana {formatIntervaloSemana(inicioSemana)}
      </div>
      <Button variant="outline" size="icon" onClick={() => irParaSemana(7)}>
        <ChevronRight />
      </Button>
    </div>
  );
}
