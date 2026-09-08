import Link from "next/link";
import { CalendarDays, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { formatBRL, formatDateBR } from "@/lib/utils";
import { getObraSaude } from "@/lib/obra";
import type { ObraStatus } from "@/types";

export interface ObraCardData {
  id: string;
  nome: string;
  clienteNome?: string | null;
  valorContrato: number;
  gastoTotal: number;
  progresso: number;
  status: ObraStatus;
  dataTermino: string | Date;
}

// Card de obra exibido na grade de listagem (/obras)
export function ObraCard({ obra }: { obra: ObraCardData }) {
  const saudeInfo = getObraSaude({
    progresso: obra.progresso,
    dataTermino: obra.dataTermino,
    status: obra.status,
  });
  const saldo = obra.valorContrato - obra.gastoTotal;

  return (
    <Link
      href={`/obras/${obra.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-text-primary">{obra.nome}</h3>
          {obra.clienteNome && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-text-secondary">
              <User className="size-3 shrink-0" />
              {obra.clienteNome}
            </p>
          )}
        </div>
        <StatusBadge variant={saudeInfo.variant} className="shrink-0">
          {saudeInfo.label}
        </StatusBadge>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">Contrato</span>
        <span className="font-medium text-text-primary">{formatBRL(obra.valorContrato)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">Gasto</span>
        <span className="font-medium text-text-primary">{formatBRL(obra.gastoTotal)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">Saldo</span>
        <span className={`font-medium ${saldo >= 0 ? "text-success" : "text-danger"}`}>
          {formatBRL(saldo)}
        </span>
      </div>

      <ProgressBar value={obra.progresso} showLabel />

      <div className="flex items-center gap-1 border-t border-border pt-2.5 text-[11px] text-text-muted">
        <CalendarDays className="size-3" />
        Término: {formatDateBR(obra.dataTermino)}
      </div>
    </Link>
  );
}
