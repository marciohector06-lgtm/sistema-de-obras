export interface GastoSemanal {
  semana: string;
  total: number;
}

// Agrupa uma lista de gastos por semana (início da semana, formato dd/mm)
export function agruparGastosPorSemana(gastos: { data: Date | string; valor: number }[]): GastoSemanal[] {
  const grupos = new Map<string, number>();

  for (const gasto of gastos) {
    const data = typeof gasto.data === "string" ? new Date(gasto.data) : gasto.data;
    const inicioSemana = new Date(data);
    inicioSemana.setDate(data.getDate() - data.getDay());
    const chave = inicioSemana.toISOString().slice(0, 10);
    grupos.set(chave, (grupos.get(chave) ?? 0) + gasto.valor);
  }

  return Array.from(grupos.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, total]) => {
      const d = new Date(chave);
      return {
        semana: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
        total,
      };
    });
}

export interface SemanaAgenda<T> {
  chave: string;
  label: string;
  total: number;
  itens: T[];
}

// Agrupa qualquer lista de itens datados (gastos, entradas) em semanas, preservando os itens originais
export function agruparPorSemanaComItens<T extends { data: Date | string; valor: number }>(
  itens: T[]
): SemanaAgenda<T>[] {
  const grupos = new Map<string, T[]>();

  for (const item of itens) {
    const data = typeof item.data === "string" ? new Date(item.data) : item.data;
    const inicioSemana = new Date(data);
    inicioSemana.setDate(data.getDate() - data.getDay());
    const chave = inicioSemana.toISOString().slice(0, 10);
    grupos.set(chave, [...(grupos.get(chave) ?? []), item]);
  }

  return Array.from(grupos.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([chave, itensDaSemana]) => {
      const inicio = new Date(chave);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 6);
      const formatar = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        chave,
        label: `${formatar(inicio)} - ${formatar(fim)}`,
        total: itensDaSemana.reduce((acc, i) => acc + i.valor, 0),
        itens: itensDaSemana.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
      };
    });
}
