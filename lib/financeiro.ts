export interface ResumoFinanceiro {
  orcamentoTotal: number;
  gastoTotal: number;
  saldoGeral: number;
  totalObras: number;
}

// Calcula os totais gerais (Resumo) a partir da lista de obras com seus gastos já somados
export function calcResumoFinanceiro(obras: { valorContrato: number; gastoTotal: number }[]): ResumoFinanceiro {
  const orcamentoTotal = obras.reduce((acc, o) => acc + o.valorContrato, 0);
  const gastoTotal = obras.reduce((acc, o) => acc + o.gastoTotal, 0);
  return {
    orcamentoTotal,
    gastoTotal,
    saldoGeral: orcamentoTotal - gastoTotal,
    totalObras: obras.length,
  };
}

// Intervalo de datas [inicio, fim) para o período selecionado, relativo a hoje
export function getPeriodoRange(periodo: string): { inicio: Date; fim: Date } | null {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  if (periodo === "mes") {
    return {
      inicio: new Date(anoAtual, hoje.getMonth(), 1),
      fim: new Date(anoAtual, hoje.getMonth() + 1, 1),
    };
  }
  if (periodo === "trimestre") {
    const trimestreAtual = Math.floor(hoje.getMonth() / 3);
    return {
      inicio: new Date(anoAtual, trimestreAtual * 3, 1),
      fim: new Date(anoAtual, trimestreAtual * 3 + 3, 1),
    };
  }
  if (periodo === "ano") {
    return { inicio: new Date(anoAtual, 0, 1), fim: new Date(anoAtual + 1, 0, 1) };
  }
  return null; // "todos" - sem filtro de período
}
