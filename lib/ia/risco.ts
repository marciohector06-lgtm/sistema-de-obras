import { diasRestantes } from "@/lib/utils";
import type { ObraStatus, PagamentoStatus } from "@/types";

export type RiscoNivel = "VERDE" | "AMARELO" | "VERMELHO";

export interface RiscoObra {
  nivel: RiscoNivel;
  pontuacao: number;
  motivos: string[];
}

export const RISCO_LABELS: Record<RiscoNivel, string> = {
  VERDE: "Baixo Risco",
  AMARELO: "Atenção",
  VERMELHO: "Alto Risco",
};

export const RISCO_VARIANT: Record<RiscoNivel, "success" | "warning" | "danger"> = {
  VERDE: "success",
  AMARELO: "warning",
  VERMELHO: "danger",
};

export function calcularRiscoObra(params: {
  status: ObraStatus;
  progresso: number;
  dataTermino: Date | string;
  valorContrato: number;
  previsaoCusto?: number | null;
  pagamentos: { status: PagamentoStatus; dataVencimento: Date | string }[];
}): RiscoObra {
  const { status, progresso, dataTermino, valorContrato, previsaoCusto, pagamentos } = params;

  if (status === "CONCLUIDA" || status === "CANCELADA" || status === "PLANEJAMENTO") {
    return { nivel: "VERDE", pontuacao: 0, motivos: [] };
  }

  const motivos: string[] = [];
  let pontuacao = 0;
  const dias = diasRestantes(dataTermino);

  if (progresso > 100) {
    pontuacao += 2;
    motivos.push("Orçamento estourado");
  } else if (progresso >= 85) {
    pontuacao += 1;
    motivos.push("Orçamento próximo do limite");
  }

  if (dias < 0) {
    pontuacao += 2;
    motivos.push("Prazo de entrega vencido");
  } else if (dias <= 15) {
    pontuacao += 1;
    motivos.push("Prazo de entrega próximo");
  }

  const pagamentosAtrasados = pagamentos.filter((p) => {
    if (p.status === "EFETUADO" || p.status === "CANCELADO") return false;
    const vencimento = typeof p.dataVencimento === "string" ? new Date(p.dataVencimento) : p.dataVencimento;
    return vencimento < new Date();
  }).length;

  if (pagamentosAtrasados > 0) {
    pontuacao += Math.min(pagamentosAtrasados, 2);
    motivos.push(`${pagamentosAtrasados} pagamento(s) atrasado(s)`);
  }

  if (previsaoCusto && valorContrato > 0) {
    const excedente = previsaoCusto / valorContrato;
    if (excedente > 1.15) {
      pontuacao += 2;
      motivos.push("Previsão de custo bem acima do contratado");
    } else if (excedente > 1) {
      pontuacao += 1;
      motivos.push("Previsão de custo acima do contratado");
    }
  }

  const nivel: RiscoNivel = pontuacao >= 4 ? "VERMELHO" : pontuacao >= 2 ? "AMARELO" : "VERDE";

  return { nivel, pontuacao, motivos };
}
