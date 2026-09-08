import { diasRestantes } from "@/lib/utils";
import type { ObraStatus, SaudeObra } from "@/types";

export interface ObraSaude {
  saude: SaudeObra | "neutro";
  label: string;
  variant: "success" | "warning" | "danger" | "neutral";
}

// Calcula o status de saúde de uma obra combinando progresso financeiro e prazo
export function getObraSaude(params: {
  progresso: number;
  dataTermino: Date | string;
  status: ObraStatus;
}): ObraSaude {
  const { progresso, dataTermino, status } = params;

  if (status === "CONCLUIDA") return { saude: "neutro", label: "Concluída", variant: "success" };
  if (status === "CANCELADA") return { saude: "neutro", label: "Cancelada", variant: "neutral" };
  if (status === "PAUSADA") return { saude: "neutro", label: "Pausada", variant: "neutral" };
  if (status === "PLANEJAMENTO") return { saude: "neutro", label: "Planejamento", variant: "neutral" };

  const dias = diasRestantes(dataTermino);

  if (progresso > 100) return { saude: "critico", label: "Crítico", variant: "danger" };
  if (dias < 0) return { saude: "atrasado", label: "Prazo Vencido", variant: "danger" };
  if (progresso >= 80 || dias < 7) return { saude: "atencao", label: "Atenção", variant: "warning" };
  return { saude: "ok", label: "No Prazo", variant: "success" };
}

export const OBRA_STATUS_LABELS: Record<ObraStatus, string> = {
  PLANEJAMENTO: "Planejamento",
  EM_ANDAMENTO: "Em Andamento",
  PAUSADA: "Pausada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};
