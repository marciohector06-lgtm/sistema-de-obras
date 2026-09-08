export interface StatusEstoque {
  restante: number;
  percentualRestante: number;
  status: "baixo" | "normal";
}

// Item é considerado "Baixo" quando a quantidade restante é menor que 20% da quantidade comprada
export function calcStatusEstoque(qtdComprada: number, qtdUsada: number): StatusEstoque {
  const restante = qtdComprada - qtdUsada;
  const percentualRestante = qtdComprada > 0 ? (restante / qtdComprada) * 100 : 0;
  return {
    restante,
    percentualRestante,
    status: percentualRestante < 20 ? "baixo" : "normal",
  };
}

// Sugestão simples de estoque mínimo (heurística local) - baseada no mesmo limiar de 20% usado no status.
// Uma versão mais inteligente (baseada em histórico de consumo real) fica para a Fase 6 (IA).
export function sugerirEstoqueMinimo(qtdComprada: number): number {
  return Math.ceil(qtdComprada * 0.2);
}
