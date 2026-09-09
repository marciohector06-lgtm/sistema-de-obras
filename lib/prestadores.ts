import type { MovimentoTipo, PrestadorCategoria } from "@/types";

export const MOVIMENTO_TIPO_LABELS: Record<MovimentoTipo, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

export const MOVIMENTO_TIPO_VARIANT: Record<MovimentoTipo, "success" | "danger"> = {
  ENTRADA: "success",
  SAIDA: "danger",
};

export const PRESTADOR_CATEGORIA_LABELS: Record<PrestadorCategoria, string> = {
  MAO_DE_OBRA_GERAL: "Mão de obra geral",
  ELETRICA: "Elétrica",
  HIDRAULICA: "Hidráulica",
  PINTURA: "Pintura",
  ALVENARIA: "Alvenaria",
  ACABAMENTO: "Acabamento",
  OUTRO: "Outro",
};

export interface ExtratoLinha<T> {
  movimento: T;
  saldoAcumulado: number;
}

export function calcExtrato<T extends { tipo: MovimentoTipo; valor: number; data: Date | string }>(
  movimentos: T[]
): { linhas: ExtratoLinha<T>[]; saldoFinal: number; totalEntradas: number; totalSaidas: number } {
  const ordenados = [...movimentos].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  let saldo = 0;
  const linhas = ordenados.map((movimento) => {
    saldo += movimento.tipo === "ENTRADA" ? movimento.valor : -movimento.valor;
    return { movimento, saldoAcumulado: saldo };
  });

  const totalEntradas = movimentos.filter((m) => m.tipo === "ENTRADA").reduce((acc, m) => acc + m.valor, 0);
  const totalSaidas = movimentos.filter((m) => m.tipo === "SAIDA").reduce((acc, m) => acc + m.valor, 0);

  return { linhas: linhas.reverse(), saldoFinal: saldo, totalEntradas, totalSaidas };
}
