import type { PropostaEventoTipo, PropostaStatus } from "@/types";

export const PROPOSTA_STATUS_LABELS: Record<PropostaStatus, string> = {
  ATIVA: "Ativa",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
};

export const PROPOSTA_STATUS_VARIANT: Record<PropostaStatus, "info" | "success" | "danger"> = {
  ATIVA: "info",
  APROVADA: "success",
  REJEITADA: "danger",
};

export const PROPOSTA_EVENTO_LABELS: Record<PropostaEventoTipo, string> = {
  CRIADA: "Proposta criada",
  EDITADA: "Proposta editada",
  STATUS_ALTERADO: "Status alterado",
};

export interface TotaisProposta {
  subtotal: number;
  valorBdi: number;
  valorImpostos: number;
  valorTotal: number;
}

export function calcTotalItem(item: { quantidade: number; precoUnitario: number }): number {
  return item.quantidade * item.precoUnitario;
}

export function calcTotaisProposta(params: {
  itens: { quantidade: number; precoUnitario: number }[];
  bdi: number;
  impostos: number;
}): TotaisProposta {
  const subtotal = params.itens.reduce((acc, item) => acc + calcTotalItem(item), 0);
  const valorBdi = subtotal * (params.bdi / 100);
  const valorImpostos = (subtotal + valorBdi) * (params.impostos / 100);
  const valorTotal = subtotal + valorBdi + valorImpostos;

  return { subtotal, valorBdi, valorImpostos, valorTotal };
}
