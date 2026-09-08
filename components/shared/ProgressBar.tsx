import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // percentual de 0 a 100+ (pode ultrapassar 100 quando orçamento estoura)
  className?: string;
  showLabel?: boolean;
}

// Barra de progresso com cor dinâmica baseada no percentual (verde/amarelo/vermelho)
export function ProgressBar({ value, className, showLabel }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const cor =
    value >= 100 ? "bg-danger" : value >= 70 ? "bg-warning" : "bg-success";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-full flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", cor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-medium text-text-secondary tabular-nums">
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
