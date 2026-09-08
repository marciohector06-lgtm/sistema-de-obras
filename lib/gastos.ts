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
