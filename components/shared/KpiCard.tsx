import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  variacao?: {
    valor: string;
    tipo: "positiva" | "negativa" | "neutra";
  };
  valueClassName?: string;
  className?: string;
}

// Card de métrica (KPI) - usado no topo dos dashboards
export function KpiCard({ label, value, icon: Icon, variacao, valueClassName, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 overflow-hidden rounded-lg border border-border bg-surface p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-text-secondary">{label}</span>
        {Icon && <Icon className="size-4 shrink-0 text-text-muted" />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span
          className={cn(
            "min-w-0 truncate text-lg font-bold tracking-tight text-text-primary sm:text-2xl",
            valueClassName
          )}
        >
          {value}
        </span>
        {variacao && (
          <span
            className={cn(
              "mb-0.5 shrink-0 whitespace-nowrap text-xs font-medium",
              variacao.tipo === "positiva" && "text-success",
              variacao.tipo === "negativa" && "text-danger",
              variacao.tipo === "neutra" && "text-text-muted"
            )}
          >
            {variacao.valor}
          </span>
        )}
      </div>
    </div>
  );
}
